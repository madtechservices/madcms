import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { ReactNode } from 'react';

import { MadCmsAdminShell, type AdminSection, type MadCmsAdminShellHost } from './admin-shell';
import type { CmsRecord } from './types';

export type AdminPaginator<T extends CmsRecord> = {
    current_page?: number;
    data: T[];
    from?: number | null;
    last_page?: number;
    next_page_url?: string | null;
    per_page?: number;
    prev_page_url?: string | null;
    to?: number | null;
    total?: number;
};

export type AdminCollectionColumn<T extends CmsRecord> = {
    key: string;
    label: string;
    render: (record: T) => ReactNode;
};

export type AdminCollectionHost = MadCmsAdminShellHost & {
    renderResourceLink?: (href: string, label: ReactNode, ariaLabel: string) => ReactNode;
    renderSearch?: (value: string, placeholder: string) => ReactNode;
};

export type MadCmsCollectionViewProps<T extends CmsRecord> = {
    activeSection: AdminSection;
    actions?: ReactNode;
    columns: AdminCollectionColumn<T>[];
    description: string;
    editHref?: (record: T) => string;
    emptyMessage: string;
    host?: AdminCollectionHost;
    paginator: AdminPaginator<T>;
    searchPlaceholder?: string;
    searchTerm?: string;
    title: string;
};

function ResourceLink({ href, label, ariaLabel, host }: { href: string; label: ReactNode; ariaLabel: string; host?: AdminCollectionHost }) {
    return host?.renderResourceLink ? (
        host.renderResourceLink(href, label, ariaLabel)
    ) : (
        <a href={href} aria-label={ariaLabel} className="font-medium text-blue-700 hover:underline">
            {label}
        </a>
    );
}

export function MadCmsCollectionView<T extends CmsRecord>({
    activeSection,
    actions,
    columns,
    description,
    editHref,
    emptyMessage,
    host,
    paginator,
    searchPlaceholder = 'Search',
    searchTerm = '',
    title,
}: MadCmsCollectionViewProps<T>) {
    const firstColumn = columns[0];

    return (
        <MadCmsAdminShell activeSection={activeSection} title={title} description={description} actions={actions} host={host}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                {host?.renderSearch ? (
                    host.renderSearch(searchTerm, searchPlaceholder)
                ) : (
                    <form method="get" className="flex w-full max-w-md items-center gap-2" role="search">
                        <label htmlFor={`${activeSection}-search`} className="sr-only">
                            {searchPlaceholder}
                        </label>
                        <input
                            id={`${activeSection}-search`}
                            name="q"
                            defaultValue={searchTerm}
                            placeholder={searchPlaceholder}
                            className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm"
                        />
                        <button
                            type="submit"
                            aria-label="Search"
                            className="grid h-10 w-10 place-items-center rounded-md border border-slate-300 bg-white hover:bg-slate-100"
                        >
                            <Search className="h-4 w-4" />
                        </button>
                    </form>
                )}
                <span className="text-sm text-slate-600">{paginator.total ?? paginator.data.length} total</span>
            </div>

            <div className="overflow-x-auto border-y border-slate-200 bg-white sm:rounded-md sm:border">
                <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase">
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key} scope="col" className="px-4 py-3">
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {paginator.data.map((record, rowIndex) => (
                            <tr key={String(record.id ?? rowIndex)} className="hover:bg-slate-50">
                                {columns.map((column) => (
                                    <td key={column.key} className="px-4 py-3 align-top text-slate-700">
                                        {column.key === firstColumn?.key && editHref ? (
                                            <ResourceLink
                                                href={editHref(record)}
                                                label={column.render(record)}
                                                ariaLabel={`Open ${String(record.name ?? record.title ?? 'item')}`}
                                                host={host}
                                            />
                                        ) : (
                                            column.render(record)
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {paginator.data.length === 0 && <p className="px-4 py-10 text-center text-sm text-slate-600">{emptyMessage}</p>}
            </div>

            {(paginator.last_page ?? 1) > 1 && (
                <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-3 text-sm">
                    <ResourceLink
                        href={paginator.prev_page_url || '#'}
                        label={
                            <>
                                <ChevronLeft className="h-4 w-4" /> Previous
                            </>
                        }
                        ariaLabel="Previous page"
                        host={paginator.prev_page_url ? host : undefined}
                    />
                    <span>
                        Page {paginator.current_page ?? 1} of {paginator.last_page}
                    </span>
                    <ResourceLink
                        href={paginator.next_page_url || '#'}
                        label={
                            <>
                                Next <ChevronRight className="h-4 w-4" />
                            </>
                        }
                        ariaLabel="Next page"
                        host={paginator.next_page_url ? host : undefined}
                    />
                </nav>
            )}
        </MadCmsAdminShell>
    );
}

const text = (value: unknown, fallback = '—') => String(value ?? fallback);

export function MadCmsPagesCollection(
    props: Omit<MadCmsCollectionViewProps<CmsRecord>, 'activeSection' | 'columns' | 'description' | 'editHref' | 'emptyMessage' | 'title'>,
) {
    return (
        <MadCmsCollectionView
            {...props}
            activeSection="pages"
            title="Pages"
            description="Manage page content, layouts, publishing, and search metadata."
            emptyMessage="No pages found."
            editHref={(page) => `/cms/pages/${page.id}`}
            columns={[
                { key: 'title', label: 'Page', render: (page) => text(page.title) },
                { key: 'status', label: 'Status', render: (page) => text(page.status) },
                { key: 'builder', label: 'Builder', render: (page) => text(page.builder_status, 'empty') },
                { key: 'components', label: 'Components', render: (page) => text(page.builder_module_count, '0') },
            ]}
        />
    );
}

export function MadCmsModulesCollection(
    props: Omit<MadCmsCollectionViewProps<CmsRecord>, 'activeSection' | 'columns' | 'description' | 'editHref' | 'emptyMessage' | 'title'>,
) {
    return (
        <MadCmsCollectionView
            {...props}
            activeSection="modules"
            title="Modules"
            description="Manage reusable components shared across page layouts."
            emptyMessage="No modules found."
            editHref={(module) => `/cms/modules/${module.id}`}
            columns={[
                { key: 'name', label: 'Module', render: (module) => text(module.name) },
                { key: 'type', label: 'Type', render: (module) => text(module.type) },
                { key: 'status', label: 'Status', render: (module) => text(module.status) },
                { key: 'usage', label: 'Pages', render: (module) => text(module.usage_count, '0') },
            ]}
        />
    );
}

export function MadCmsFormsCollection(
    props: Omit<MadCmsCollectionViewProps<CmsRecord>, 'activeSection' | 'columns' | 'description' | 'editHref' | 'emptyMessage' | 'title'>,
) {
    return (
        <MadCmsCollectionView
            {...props}
            activeSection="forms"
            title="Forms"
            description="Build fields, validation, submission storage, and workflow actions."
            emptyMessage="No forms found."
            editHref={(form) => `/cms/forms/${form.id}`}
            columns={[
                { key: 'name', label: 'Form', render: (form) => text(form.name) },
                { key: 'status', label: 'Status', render: (form) => text(form.status) },
                { key: 'submissions', label: 'Submissions', render: (form) => text(form.submissions_count, '0') },
                { key: 'usage', label: 'Pages', render: (form) => text(form.usage_count, '0') },
            ]}
        />
    );
}

export function MadCmsSubmissionsCollection(
    props: Omit<MadCmsCollectionViewProps<CmsRecord>, 'activeSection' | 'columns' | 'description' | 'editHref' | 'emptyMessage' | 'title'>,
) {
    return (
        <MadCmsCollectionView
            {...props}
            activeSection="submissions"
            title="Form submissions"
            description="Review captured form data and workflow status."
            emptyMessage="No submissions found."
            editHref={(submission) => `/cms/submissions/${submission.id}`}
            columns={[
                { key: 'form', label: 'Form', render: (submission) => text((submission.form as CmsRecord | undefined)?.name) },
                { key: 'status', label: 'Status', render: (submission) => text(submission.status) },
                { key: 'created', label: 'Received', render: (submission) => text(submission.created_at) },
            ]}
        />
    );
}

export function MadCmsCategoriesCollection(
    props: Omit<MadCmsCollectionViewProps<CmsRecord>, 'activeSection' | 'columns' | 'description' | 'editHref' | 'emptyMessage' | 'title'>,
) {
    return (
        <MadCmsCollectionView
            {...props}
            activeSection="categories"
            title="Categories"
            description="Organise pages and manage category visibility."
            emptyMessage="No categories found."
            columns={[
                { key: 'title', label: 'Category', render: (category) => text(category.title) },
                { key: 'slug', label: 'Slug', render: (category) => text(category.slug) },
                { key: 'parent', label: 'Parent', render: (category) => text((category.parent as CmsRecord | undefined)?.title) },
                { key: 'order', label: 'Order', render: (category) => text(category.order, '0') },
            ]}
        />
    );
}
