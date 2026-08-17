<?php

namespace MadTechServices\MadCms\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use MadTechServices\MadCms\Contracts\FormActionHandler;
use MadTechServices\MadCms\Contracts\FormActionTypeRegistry;
use MadTechServices\MadCms\Models\CmsForm;
use MadTechServices\MadCms\Models\CmsFormAction;
use MadTechServices\MadCms\Models\CmsFormSubmission;
use RuntimeException;
use Throwable;

class CmsFormActionRunner
{
    public function __construct(private readonly FormActionTypeRegistry $actionTypes) {}

    /** @param array<string, mixed> $payload */
    public function run(CmsForm $form, CmsFormAction $action, ?CmsFormSubmission $submission, array $payload): void
    {
        if ($action->type === 'database') {
            return;
        }

        if ($action->type === 'email') {
            $to = $action->config['to'] ?? null;
            if (! $to) {
                $this->logAction($form, $action, $submission, 'skipped', 'Email action skipped because no recipients were configured.');

                return;
            }

            $this->runLoggedAction($form, $action, $submission, fn () => $this->sendEmail(
                $to,
                $action->config['subject'] ?? "New {$form->name} submission",
                $this->emailBody($form, $payload, $submission?->id, $action->config['body'] ?? null),
            ));

            return;
        }

        if ($action->type === 'autoresponder') {
            $toField = $action->config['to_field'] ?? 'email';
            $to = $payload[$toField] ?? null;
            if (! $to) {
                $this->logAction($form, $action, $submission, 'skipped', "Autoresponder skipped because '{$toField}' was empty.");

                return;
            }

            $subject = $this->renderTemplate($action->config['subject'] ?? "Thanks for contacting {$form->name}", $form, $payload, $submission?->id);
            $body = $this->emailBody($form, $payload, $submission?->id, $action->config['body'] ?? 'Thanks, we have received your submission.');
            $this->runLoggedAction($form, $action, $submission, fn () => $this->sendEmail((string) $to, $subject, $body));

            return;
        }

        if ($action->type === 'webhook') {
            $url = $action->config['url'] ?? null;
            if (! $url) {
                $this->logAction($form, $action, $submission, 'skipped', 'Webhook action skipped because no URL was configured.');

                return;
            }

            $this->runLoggedAction($form, $action, $submission, fn () => $this->sendWebhook((string) $url, $form, $payload, $submission, $action->config ?? []));

            return;
        }

        $handlerClass = $this->actionTypes->definitions()[$action->type]['handler'] ?? null;
        if (! is_string($handlerClass) || ! is_a($handlerClass, FormActionHandler::class, true)) {
            return;
        }

        $this->runLoggedAction(
            $form,
            $action,
            $submission,
            fn () => app($handlerClass)->handle($form, $action, $submission, $payload),
        );
    }

    /** @param array<string, mixed> $payload */
    private function emailBody(CmsForm $form, array $payload, ?int $submissionId, ?string $template = null): string
    {
        if ($template) {
            return $this->renderTemplate($template, $form, $payload, $submissionId);
        }

        $lines = ["New {$form->name} submission", ''];
        if ($submissionId) {
            $lines[] = "Submission ID: {$submissionId}";
            $lines[] = '';
        }

        foreach ($payload as $key => $value) {
            $lines[] = str_replace('_', ' ', ucfirst($key)).': '.(is_array($value) ? implode(', ', $value) : (string) $value);
        }

        return implode("\n", $lines);
    }

    /** @param array<string, mixed> $payload */
    private function renderTemplate(string $template, CmsForm $form, array $payload, ?int $submissionId): string
    {
        $replacements = [
            'form_name' => $form->name,
            'submission_id' => $submissionId ?: '',
        ];

        foreach ($payload as $key => $value) {
            $replacements[$key] = is_array($value) ? implode(', ', $value) : (string) $value;
        }

        return (string) preg_replace_callback('/\{([a-zA-Z0-9_]+)\}/', fn ($match) => $replacements[$match[1]] ?? '', $template);
    }

    /** @return array{message: string, context: array<string, mixed>} */
    private function sendEmail(string $to, string $subject, string $body): array
    {
        $recipients = collect(explode(',', $to))->map(fn ($recipient) => trim($recipient))->filter()->values()->all();
        if (! $recipients) {
            return ['message' => 'Email skipped because no valid recipients were found.', 'context' => ['recipients' => []]];
        }

        Mail::raw($body, function ($message) use ($recipients, $subject): void {
            $message->to($recipients)->subject($subject);
        });

        return ['message' => 'Email sent.', 'context' => ['recipients' => $recipients, 'subject' => $subject]];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>  $config
     * @return array{message: string, context: array<string, mixed>}
     */
    private function sendWebhook(string $url, CmsForm $form, array $payload, ?CmsFormSubmission $submission, array $config): array
    {
        $headers = collect($config['headers'] ?? [])
            ->mapWithKeys(fn ($value, $key) => is_array($value) ? [$value['name'] ?? $key => $value['value'] ?? ''] : [$key => $value])
            ->filter(fn ($value, $key) => filled($key) && filled($value))
            ->all();

        $response = Http::timeout((int) ($config['timeout'] ?? 10))
            ->withHeaders($headers)
            ->post($url, [
                'form' => ['id' => $form->id, 'name' => $form->name, 'slug' => $form->slug],
                'submission_id' => $submission?->id,
                'payload' => $payload,
                'metadata' => $submission?->metadata,
            ]);

        if ($response->failed()) {
            throw new RuntimeException("Webhook returned HTTP {$response->status()}.");
        }

        return ['message' => "Webhook delivered with HTTP {$response->status()}.", 'context' => ['url' => $url, 'status' => $response->status()]];
    }

    /** @param callable(): array<string, mixed>|null $callback */
    private function runLoggedAction(CmsForm $form, CmsFormAction $action, ?CmsFormSubmission $submission, callable $callback): void
    {
        try {
            $result = $callback() ?: [];
            $this->logAction($form, $action, $submission, 'success', $result['message'] ?? 'Action completed.', $result['context'] ?? []);
        } catch (Throwable $exception) {
            $this->logAction($form, $action, $submission, 'failed', $exception->getMessage());
            Log::warning('CMS form action failed', [
                'form_id' => $form->id,
                'action_id' => $action->id,
                'submission_id' => $submission?->id,
                'type' => $action->type,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    /** @param array<string, mixed> $context */
    private function logAction(CmsForm $form, CmsFormAction $action, ?CmsFormSubmission $submission, string $status, ?string $message = null, array $context = []): void
    {
        $logModel = (string) config('madcms.models.form_action_log');
        $logModel::create([
            'cms_form_id' => $form->id,
            'cms_form_action_id' => $action->id,
            'cms_form_submission_id' => $submission?->id,
            'type' => $action->type,
            'status' => $status,
            'message' => $message,
            'context' => $context,
        ]);
    }
}
