<?php

namespace MadTechServices\MadCms\Http\Controllers;

use Illuminate\Http\Request;
use MadTechServices\MadCms\Contracts\LayoutUsageAnalyzer;
use MadTechServices\MadCms\Contracts\ModuleDefinitionManager;
use MadTechServices\MadCms\Models\CmsModule;
use MadTechServices\MadCms\Models\CmsModuleRevision;

class ModuleMutationController
{
    public function store(Request $request, ModuleDefinitionManager $modules)
    {
        $module = $modules->create(
            $request->validate($modules->validationRules()),
            $request->user()?->id,
        );

        if (config('madcms.routes.register_admin_presentation', false)) {
            $route = config('madcms.routes.presentation_name_prefix', 'madcms.ui.').'modules.edit';
            if (app('router')->has($route)) {
                return redirect()->route($route, $module)->with('success', 'Module created.');
            }
        }

        return back()->with('success', 'Module created.');
    }

    public function update(
        Request $request,
        CmsModule $module,
        ModuleDefinitionManager $modules,
        LayoutUsageAnalyzer $usage,
    ) {
        $data = $request->validate($modules->validationRules());

        if (($data['status'] ?? $module->status) !== 'active' && $usage->enabledPagesUsingModule($module->id)->isNotEmpty()) {
            back()->withErrors([
                'status' => 'This module is used by enabled builder layouts and cannot be deactivated until those placements are detached, replaced, or staged.',
            ])->throwResponse();
        }

        $modules->update($module, $data, $request->user()?->id);

        return back()->with('success', 'Module saved.');
    }

    public function duplicate(Request $request, CmsModule $module, ModuleDefinitionManager $modules)
    {
        $modules->duplicate($module, $request->user()?->id);

        return back()->with('success', 'Module duplicated.');
    }

    public function restoreRevision(
        Request $request,
        CmsModule $module,
        CmsModuleRevision $revision,
        ModuleDefinitionManager $modules,
    ) {
        abort_unless($revision->cms_module_id === $module->id, 404);

        $modules->restore($module, $revision, $request->user()?->id);

        return back()->with('success', 'Module revision restored.');
    }

    public function destroy(CmsModule $module, LayoutUsageAnalyzer $usage)
    {
        if ($usage->enabledPagesUsingModule($module->id)->isNotEmpty()) {
            back()->withErrors([
                'module' => 'This module is used by enabled builder layouts and cannot be deleted until those placements are detached, replaced, or staged.',
            ])->throwResponse();
        }

        $module->delete();

        return back()->with('success', 'Module deleted.');
    }
}
