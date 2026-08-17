import { Head } from '@inertiajs/react';
import { MadCmsModuleEditor, type MadCmsModuleEditorProps } from '../../vendor/madcms/admin-module-editor';
import { adminHost } from './host';

type Props = Omit<MadCmsModuleEditorProps, 'basePath' | 'mutationBasePath' | 'mutationsEnabled' | 'host'> & {
    madcmsBasePath?: string;
    madcmsMutationBasePath?: string;
    madcmsMutationsEnabled?: boolean;
};

export default function ModuleEdit({ madcmsBasePath = '/madcms', madcmsMutationBasePath = '/cms', madcmsMutationsEnabled = false, ...props }: Props) {
    return (
        <>
            <Head title={props.module.name ? `Edit ${props.module.name}` : 'Create module'} />
            <MadCmsModuleEditor
                {...props}
                basePath={madcmsBasePath}
                mutationBasePath={madcmsMutationBasePath}
                mutationsEnabled={madcmsMutationsEnabled}
                host={adminHost(madcmsBasePath)}
            />
        </>
    );
}
