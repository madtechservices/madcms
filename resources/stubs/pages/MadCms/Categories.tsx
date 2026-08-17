import { Head } from '@inertiajs/react';
import { MadCmsCategoryManager } from '../../vendor/madcms/admin-category-manager';
import type { CmsRecord } from '../../vendor/madcms/types';
import { adminHost } from './host';

export default function Categories({
    categories,
    madcmsBasePath = '/madcms',
    madcmsMutationBasePath = '/cms',
    madcmsMutationsEnabled = false,
    errors = {},
}: {
    categories: CmsRecord[];
    madcmsBasePath?: string;
    madcmsMutationBasePath?: string;
    madcmsMutationsEnabled?: boolean;
    errors?: Record<string, string>;
}) {
    return (
        <>
            <Head title="Categories" />
            <MadCmsCategoryManager
                categories={categories}
                mutationBasePath={madcmsMutationBasePath}
                mutationsEnabled={madcmsMutationsEnabled}
                errors={errors}
                host={adminHost(madcmsBasePath)}
            />
        </>
    );
}
