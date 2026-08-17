<?php

namespace MadTechServices\MadCms\Contracts;

use Illuminate\Http\Request;
use MadTechServices\MadCms\Data\FormSubmissionResult;
use MadTechServices\MadCms\Models\CmsForm;

interface FormSubmissionProcessor
{
    public function process(Request $request, CmsForm $form): FormSubmissionResult;
}
