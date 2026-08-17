<?php

namespace MadTechServices\MadCms\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use MadTechServices\MadCms\Contracts\SubmissionAdminQuery;
use MadTechServices\MadCms\Models\CmsFormActionLog;
use MadTechServices\MadCms\Models\CmsFormSubmission;
use MadTechServices\MadCms\Support\CmsFormActionRunner;

class SubmissionAdminController
{
    private const STATUSES = ['new', 'read', 'archived'];

    public function export(Request $request, SubmissionAdminQuery $submissions)
    {
        $rows = $submissions->all($this->filters($request));
        $filename = 'form-submissions-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($rows): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Form', 'Page', 'Status', 'Submitted at', 'Payload JSON', 'Metadata JSON']);

            foreach ($rows as $submission) {
                fputcsv($handle, [
                    $submission->id,
                    $submission->form?->name,
                    $submission->page?->title,
                    $submission->status,
                    optional($submission->created_at)->toDateTimeString(),
                    json_encode($submission->payload),
                    json_encode($submission->metadata),
                ]);
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    public function update(Request $request, CmsFormSubmission $submission)
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:'.implode(',', self::STATUSES)],
        ]);

        $submission->update(['status' => $data['status']]);

        return back()->with('success', 'Submission updated.');
    }

    public function bulk(Request $request)
    {
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', Rule::exists(config('madcms.tables.form_submissions'), 'id')],
            'action' => ['required', 'string', 'in:mark_new,mark_read,archive,delete'],
        ]);

        $submissionModel = (string) config('madcms.models.form_submission');
        $query = $submissionModel::query()->whereIn('id', $data['ids']);

        match ($data['action']) {
            'mark_new' => $query->update(['status' => 'new']),
            'mark_read' => $query->update(['status' => 'read']),
            'archive' => $query->update(['status' => 'archived']),
            'delete' => $query->delete(),
        };

        return back()->with('success', 'Submissions updated.');
    }

    public function destroy(CmsFormSubmission $submission)
    {
        $submission->delete();

        return back()->with('success', 'Submission deleted.');
    }

    public function retryAction(CmsFormActionLog $log, CmsFormActionRunner $runner)
    {
        $log->load(['form', 'action', 'submission']);

        abort_unless($log->action && $log->submission, 404);

        $runner->run($log->form, $log->action, $log->submission, $log->submission->payload ?? []);

        return back()->with('success', 'Action retried.');
    }

    protected function filters(Request $request): array
    {
        return [
            'form_id' => $request->input('form_id', ''),
            'status' => $request->input('status', ''),
            'q' => $request->input('q', ''),
        ];
    }
}
