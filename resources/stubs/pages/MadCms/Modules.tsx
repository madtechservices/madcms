import { Head, Link } from '@inertiajs/react';
import { MadCmsModulesCollection, type AdminPaginator } from '../../vendor/madcms/admin-collections';
import type { CmsRecord } from '../../vendor/madcms/types';
import { adminHost } from './host';

export default function Modules({
    modules,
    filters = {},
    madcmsBasePath = '/madcms',
}: {
    modules: AdminPaginator<CmsRecord>;
    filters?: { q?: string };
    madcmsBasePath?: string;
}) {
    return (
        <>
            <Head title="Modules" />
            <MadCmsModulesCollection
                paginator={modules}
                searchTerm={filters.q || ''}
                host={adminHost(madcmsBasePath)}
                actions={
                    <Link
                        href={`${madcmsBasePath}/modules/create`}
                        className="inline-flex h-10 items-center rounded-md bg-blue-700 px-4 text-sm font-semibold text-white"
                    >
                        Create module
                    </Link>
                }
            />
        </>
    );
}
