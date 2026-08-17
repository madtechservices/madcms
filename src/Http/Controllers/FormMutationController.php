<?php

namespace MadTechServices\MadCms\Http\Controllers;

use Illuminate\Http\Request;
use MadTechServices\MadCms\Contracts\FormDefinitionManager;
use MadTechServices\MadCms\Contracts\LayoutUsageAnalyzer;
use MadTechServices\MadCms\Models\CmsForm;

class FormMutationController
{
    public function store(Request $request, FormDefinitionManager $forms)
    {
        $form = $forms->create(
            $request->validate($forms->validationRules()),
            $request->user()?->id,
        );

        if (config('madcms.routes.register_admin_presentation', false)) {
            $route = config('madcms.routes.presentation_name_prefix', 'madcms.ui.').'forms.edit';
            if (app('router')->has($route)) {
                return redirect()->route($route, $form)->with('success', 'Form created.');
            }
        }

        return back()->with('success', 'Form created.');
    }

    public function update(
        Request $request,
        CmsForm $form,
        FormDefinitionManager $forms,
        LayoutUsageAnalyzer $usage,
    ) {
        $data = $request->validate($forms->validationRules());

        if (($data['status'] ?? $form->status) !== 'active' && $usage->enabledPagesUsingForm($form->id)->isNotEmpty()) {
            back()->withErrors([
                'status' => 'This form is used by enabled builder layouts and cannot be deactivated until those form embeds are replaced, removed, or staged.',
            ])->throwResponse();
        }

        $forms->update($form, $data, $request->user()?->id);

        return back()->with('success', 'Form saved.');
    }

    public function duplicate(Request $request, CmsForm $form, FormDefinitionManager $forms)
    {
        $forms->duplicate($form, $request->user()?->id);

        return back()->with('success', 'Form duplicated.');
    }

    public function destroy(CmsForm $form, LayoutUsageAnalyzer $usage)
    {
        if ($usage->enabledPagesUsingForm($form->id)->isNotEmpty()) {
            back()->withErrors([
                'form' => 'This form is used by enabled builder layouts and cannot be deleted until those form embeds are replaced, removed, or staged.',
            ])->throwResponse();
        }

        $form->delete();

        return back()->with('success', 'Form deleted.');
    }
}
