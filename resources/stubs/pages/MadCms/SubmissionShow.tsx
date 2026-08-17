import { Head } from '@inertiajs/react';
import { MadCmsSubmissionDetail, type MadCmsSubmissionDetailProps } from '../../vendor/madcms/admin-submission-detail';
import { adminHost } from './host';

type Props = Omit<MadCmsSubmissionDetailProps, 'basePath' | 'mutationBasePath' | 'mutationsEnabled' | 'host'> & {
    madcmsBasePath?: string;
    madcmsMutationBasePath?: string;
    madcmsMutationsEnabled?: boolean;
};

export default function SubmissionShow({
    madcmsBasePath = '/madcms',
    madcmsMutationBasePath = '/cms',
    madcmsMutationsEnabled = false,
    ...props
}: Props) {
    return (
        <>
            <Head title={`Submission #${props.submission.id}`} />
            <MadCmsSubmissionDetail
                {...props}
                basePath={madcmsBasePath}
                mutationBasePath={madcmsMutationBasePath}
                mutationsEnabled={madcmsMutationsEnabled}
                host={adminHost(madcmsBasePath)}
            />
        </>
    );
}
