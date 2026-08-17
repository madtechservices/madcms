import { Head } from '@inertiajs/react';
import { MadCmsFormEditor, type MadCmsFormEditorProps } from '../../vendor/madcms/admin-form-editor';
import { adminHost } from './host';

type Props = Omit<MadCmsFormEditorProps, 'basePath' | 'mutationBasePath' | 'mutationsEnabled' | 'host'> & {
    madcmsBasePath?: string;
    madcmsMutationBasePath?: string;
    madcmsMutationsEnabled?: boolean;
};

export default function FormEdit({ madcmsBasePath = '/madcms', madcmsMutationBasePath = '/cms', madcmsMutationsEnabled = false, ...props }: Props) {
    return (
        <>
            <Head title={props.form.name ? `Edit ${props.form.name}` : 'Create form'} />
            <MadCmsFormEditor
                {...props}
                basePath={madcmsBasePath}
                mutationBasePath={madcmsMutationBasePath}
                mutationsEnabled={madcmsMutationsEnabled}
                host={adminHost(madcmsBasePath)}
            />
        </>
    );
}
