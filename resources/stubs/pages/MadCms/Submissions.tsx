import { Head } from '@inertiajs/react';
import { MadCmsSubmissionsCollection, type AdminPaginator } from '../../vendor/madcms/admin-collections';
import type { CmsRecord } from '../../vendor/madcms/types';
import { adminHost } from './host';

export default function Submissions({
    submissions,
    filters = {},
    madcmsBasePath = '/madcms',
}: {
    submissions: AdminPaginator<CmsRecord>;
    filters?: { q?: string };
    madcmsBasePath?: string;
}) {
    return (
        <>
            <Head title="Form submissions" />
            <MadCmsSubmissionsCollection paginator={submissions} searchTerm={filters.q || ''} host={adminHost(madcmsBasePath)} />
        </>
    );
}
