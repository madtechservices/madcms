<?php

namespace MadTechServices\MadCms\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use MadTechServices\MadCms\Contracts\FormSubmissionProcessor;
use MadTechServices\MadCms\Models\CmsForm;

class PublicFormController extends Controller
{
    public function store(Request $request, CmsForm $form, FormSubmissionProcessor $processor): RedirectResponse
    {
        $result = $processor->process($request, $form);

        return back()->with('success', $result->message);
    }
}
