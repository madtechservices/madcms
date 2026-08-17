<?php

namespace MadTechServices\MadCms\Contracts;

use MadTechServices\MadCms\Models\CmsForm;
use MadTechServices\MadCms\Models\CmsFormAction;
use MadTechServices\MadCms\Models\CmsFormSubmission;

interface FormActionHandler
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array{message?: string, context?: array<string, mixed>}
     */
    public function handle(
        CmsForm $form,
        CmsFormAction $action,
        ?CmsFormSubmission $submission,
        array $payload,
    ): array;
}
