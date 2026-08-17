import { Head } from '@inertiajs/react';
import { MadCmsPageEditor, type MadCmsPageEditorProps } from '../../vendor/madcms/admin-page-editor';
import { adminHost } from './host';

type Props = Omit<MadCmsPageEditorProps, 'builderLayout' | 'basePath' | 'mutationBasePath' | 'mutationsEnabled' | 'host'> & {
    builder_layout?: MadCmsPageEditorProps['builderLayout'];
    madcmsBasePath?: string;
    madcmsMutationBasePath?: string;
    madcmsMutationsEnabled?: boolean;
};

export default function PageEdit({
    builder_layout,
    madcmsBasePath = '/madcms',
    madcmsMutationBasePath = '/cms',
    madcmsMutationsEnabled = false,
    ...props
}: Props) {
    return (
        <>
            <Head title={props.page.title ? `Edit ${props.page.title}` : 'Create page'} />
            <MadCmsPageEditor
                {...props}
                builderLayout={builder_layout}
                basePath={madcmsBasePath}
                mutationBasePath={madcmsMutationBasePath}
                mutationsEnabled={madcmsMutationsEnabled}
                host={adminHost(madcmsBasePath)}
            />
        </>
    );
}
