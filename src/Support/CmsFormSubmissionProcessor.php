<?php

namespace MadTechServices\MadCms\Support;

use Illuminate\Http\Request;
use MadTechServices\MadCms\Contracts\FormRuleBuilder;
use MadTechServices\MadCms\Contracts\FormSubmissionProcessor;
use MadTechServices\MadCms\Data\FormSubmissionResult;
use MadTechServices\MadCms\Models\CmsForm;
use MadTechServices\MadCms\Models\CmsFormSubmission;

class CmsFormSubmissionProcessor implements FormSubmissionProcessor
{
    public function __construct(
        private readonly FormRuleBuilder $rules,
        private readonly CmsFormActionRunner $actions,
    ) {}

    public function process(Request $request, CmsForm $form): FormSubmissionResult
    {
        abort_unless($form->status === 'active', 404);

        $form->loadMissing(['fields', 'actions']);
        $message = $form->success_message ?: 'Thanks, your submission has been received.';

        if ($this->isSpam($request, $form)) {
            return new FormSubmissionResult($message, true);
        }

        $payload = $request->validate($this->rules->for($form));
        $submission = $this->storeSubmission($request, $form, $payload);

        foreach ($form->actions->where('enabled', true) as $action) {
            $this->actions->run($form, $action, $submission, $payload);
        }

        return new FormSubmissionResult($message, false, $payload, $submission);
    }

    private function isSpam(Request $request, CmsForm $form): bool
    {
        $spam = $form->spam_settings ?: [];
        $honeypotField = $spam['honeypot_field'] ?? 'website';

        if (($spam['honeypot_enabled'] ?? true) && $request->filled($honeypotField)) {
            return true;
        }

        $minimumSeconds = (int) ($spam['minimum_seconds'] ?? 0);
        $startedAt = (int) $request->input('_form_started_at', 0);

        return $minimumSeconds > 0
            && ($startedAt <= 0 || (((int) round(microtime(true) * 1000)) - $startedAt) < ($minimumSeconds * 1000));
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function storeSubmission(Request $request, CmsForm $form, array $payload): ?CmsFormSubmission
    {
        $databaseEnabled = $form->actions->where('type', 'database')->where('enabled', true)->isNotEmpty();
        if (! $databaseEnabled && $form->actions->isNotEmpty()) {
            return null;
        }

        $pageModel = (string) config('madcms.models.page');
        $page = $request->input('_page_id') ? $pageModel::find($request->input('_page_id')) : null;
        $submissionModel = (string) config('madcms.models.form_submission');

        return $submissionModel::create([
            'cms_form_id' => $form->id,
            'site_page_id' => $page?->id,
            'payload' => $payload,
            'metadata' => [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->headers->get('referer'),
            ],
        ]);
    }
}
