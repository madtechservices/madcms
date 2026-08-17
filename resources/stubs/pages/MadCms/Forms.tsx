import { Head, Link } from '@inertiajs/react';
import { MadCmsFormsCollection, type AdminPaginator } from '../../vendor/madcms/admin-collections';
import type { CmsRecord } from '../../vendor/madcms/types';
import { adminHost } from './host';

export default function Forms({
    forms,
    filters = {},
    madcmsBasePath = '/madcms',
}: {
    forms: AdminPaginator<CmsRecord>;
    filters?: { q?: string };
    madcmsBasePath?: string;
}) {
    return (
        <>
            <Head title="Forms" />
            <MadCmsFormsCollection
                paginator={forms}
                searchTerm={filters.q || ''}
                host={adminHost(madcmsBasePath)}
                actions={
                    <Link
                        href={`${madcmsBasePath}/forms/create`}
                        className="inline-flex h-10 items-center rounded-md bg-blue-700 px-4 text-sm font-semibold text-white"
                    >
                        Create form
                    </Link>
                }
            />
        </>
    );
}
