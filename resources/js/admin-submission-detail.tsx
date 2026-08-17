import { router } from '@inertiajs/react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { MadCmsAdminShell, type MadCmsAdminShellHost } from './admin-shell';
import type { CmsRecord } from './types';

type SubmissionRecord = CmsRecord & {
    id: number;
    status?: string;
    payload?: CmsRecord | null;
    metadata?: CmsRecord | null;
    form?: CmsRecord | null;
    page?: CmsRecord | null;
    action_logs?: CmsRecord[];
    created_at?: string;
};

export type MadCmsSubmissionDetailProps = {
    submission: SubmissionRecord;
    statuses?: string[];
    basePath?: string;
    mutationBasePath?: string;
    mutationsEnabled?: boolean;
    host?: MadCmsAdminShellHost;
};

const display = (value: unknown) => (typeof value === 'string' ? value : JSON.stringify(value, null, 2));

export function MadCmsSubmissionDetail({
    submission,
    statuses = ['new', 'read', 'archived'],
    basePath = '/madcms',
    mutationBasePath = '/cms',
    mutationsEnabled = true,
    host,
}: MadCmsSubmissionDetailProps) {
    const [status, setStatus] = useState(String(submission.status || 'new'));
    const [saving, setSaving] = useState(false);
    const payload = submission.payload || {};
    const metadata = submission.metadata || {};
    const logs = submission.action_logs || [];
    const save = () => {
        if (!mutationsEnabled) return;
        setSaving(true);
        router.patch(`${mutationBasePath}/form-submissions/${submission.id}`, { status }, { preserveScroll: true, onFinish: () => setSaving(false) });
    };
    const actions = (
        <>
            <a
                href={`${basePath}/submissions`}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium"
            >
                <ArrowLeft className="h-4 w-4" />
                Submissions
            </a>
            <button
                type="button"
                disabled={!mutationsEnabled}
                onClick={() => {
                    if (window.confirm('Delete this submission?')) router.delete(`${mutationBasePath}/form-submissions/${submission.id}`);
                }}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 disabled:opacity-50"
            >
                <Trash2 className="h-4 w-4" />
                Delete
            </button>
        </>
    );

    return (
        <MadCmsAdminShell
            activeSection="submissions"
            title={`Submission #${submission.id}`}
            description={`${String(submission.form?.name || 'Form')} · ${String(submission.created_at || '')}`}
            actions={actions}
            host={host}
        >
            {!mutationsEnabled && (
                <div className="mb-4 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    This submission is read-only because package admin mutations are disabled.
                </div>
            )}
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <section className="border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <h2 className="text-sm font-semibold">Submitted values</h2>
                    </div>
                    <dl className="divide-y divide-slate-200">
                        {Object.entries(payload).map(([key, value]) => (
                            <div key={key} className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr]">
                                <dt className="text-sm font-medium text-slate-600">{key}</dt>
                                <dd className="min-w-0 text-sm break-words whitespace-pre-wrap text-slate-950">{display(value)}</dd>
                            </div>
                        ))}
                    </dl>
                    {Object.keys(payload).length === 0 && <p className="p-6 text-sm text-slate-500">No submitted values.</p>}
                </section>
                <div className="space-y-5">
                    <section className="border border-slate-200 bg-white p-4">
                        <label className="text-sm font-medium">
                            Status
                            <select
                                className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                            >
                                {statuses.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button
                            type="button"
                            onClick={save}
                            disabled={!mutationsEnabled || saving}
                            className="mt-3 inline-flex h-9 items-center gap-2 rounded-md bg-blue-700 px-3 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? 'Saving...' : 'Save status'}
                        </button>
                    </section>
                    <section className="border border-slate-200 bg-white">
                        <div className="border-b border-slate-200 px-4 py-3">
                            <h2 className="text-sm font-semibold">Workflow actions</h2>
                        </div>
                        <div className="divide-y divide-slate-200">
                            {logs.map((log, index) => (
                                <div key={String(log.id || index)} className="px-4 py-3 text-sm">
                                    <div className="font-medium">
                                        {String(log.type || log.action_type || (log.action as CmsRecord | undefined)?.type || 'Action')}
                                    </div>
                                    <div className="mt-1 text-slate-600">{String(log.status || '')}</div>
                                    {Boolean(log.error) && <div className="mt-1 text-red-700">{String(log.error)}</div>}
                                </div>
                            ))}
                            {logs.length === 0 && <p className="p-4 text-sm text-slate-500">No action logs.</p>}
                        </div>
                    </section>
                    <details className="border border-slate-200 bg-white">
                        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Request metadata</summary>
                        <pre className="overflow-x-auto border-t border-slate-200 p-4 text-xs">{JSON.stringify(metadata, null, 2)}</pre>
                    </details>
                </div>
            </div>
        </MadCmsAdminShell>
    );
}
