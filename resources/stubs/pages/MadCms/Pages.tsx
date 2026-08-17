import { Head, Link } from '@inertiajs/react';
import { MadCmsPagesCollection, type AdminPaginator } from '../../vendor/madcms/admin-collections';
import type { CmsRecord } from '../../vendor/madcms/types';
import { adminHost } from './host';

export default function Pages({
    pages,
    filters = {},
    madcmsBasePath = '/madcms',
}: {
    pages: AdminPaginator<CmsRecord>;
    filters?: { q?: string };
    madcmsBasePath?: string;
}) {
    return (
        <>
            <Head title="Pages" />
            <MadCmsPagesCollection
                paginator={pages}
                searchTerm={filters.q || ''}
                host={adminHost(madcmsBasePath)}
                actions={
                    <Link
                        href={`${madcmsBasePath}/pages/create`}
                        className="inline-flex h-10 items-center rounded-md bg-blue-700 px-4 text-sm font-semibold text-white"
                    >
                        Create page
                    </Link>
                }
            />
        </>
    );
}
