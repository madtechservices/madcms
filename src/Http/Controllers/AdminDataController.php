<?php

namespace MadTechServices\MadCms\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use MadTechServices\MadCms\Contracts\CategoryAdminQuery;
use MadTechServices\MadCms\Contracts\FormActionTypeRegistry;
use MadTechServices\MadCms\Contracts\FormAdminQuery;
use MadTechServices\MadCms\Contracts\FormFieldTypeRegistry;
use MadTechServices\MadCms\Contracts\ModuleAdminQuery;
use MadTechServices\MadCms\Contracts\ModuleTypeRegistry;
use MadTechServices\MadCms\Contracts\PageAdminQuery;
use MadTechServices\MadCms\Contracts\SubmissionAdminQuery;

class AdminDataController
{
    public function __construct(
        private readonly ModuleAdminQuery $modules,
        private readonly PageAdminQuery $pages,
        private readonly FormAdminQuery $forms,
        private readonly SubmissionAdminQuery $submissions,
        private readonly CategoryAdminQuery $categories,
        private readonly ModuleTypeRegistry $moduleTypes,
        private readonly FormFieldTypeRegistry $fieldTypes,
        private readonly FormActionTypeRegistry $actionTypes,
    ) {}

    public function pages(Request $request): JsonResponse
    {
        $pageModel = (string) config('madcms.models.page');
        $filters = [
            'q' => $request->string('q')->toString(),
            'status' => $request->string('status')->toString(),
            'builder' => $request->string('builder')->toString(),
        ];

        return response()->json([
            'pages' => $this->pages->paginate($filters, $request->user(), $this->perPage($request, 20)),
            'filters' => $filters,
            'builder_summary' => $this->pages->summary($request->user()),
            'statuses' => $pageModel::$statuses,
        ]);
    }

    public function page(Request $request, int|string $page): JsonResponse
    {
        $pageModel = (string) config('madcms.models.page');
        $record = $pageModel::query()->findOrFail($page);

        return response()->json($this->pages->editorData($record, $request->user()));
    }

    public function modules(Request $request): JsonResponse
    {
        $filters = [
            'q' => $request->string('q')->toString(),
            'type' => $request->string('type')->toString(),
        ];

        return response()->json([
            'modules' => $this->modules->paginate($filters, $this->perPage($request, 30)),
            'filters' => $filters,
            'types' => $this->moduleTypes->all(),
            'forms' => $this->modules->activeForms(),
        ]);
    }

    public function forms(Request $request): JsonResponse
    {
        $filters = ['q' => $request->string('q')->toString()];

        return response()->json([
            'forms' => $this->forms->paginate($filters, $this->perPage($request, 20)),
            'filters' => $filters,
            'field_types' => $this->fieldTypes->all(),
            'action_types' => $this->actionTypes->all(),
        ]);
    }

    public function submissions(Request $request): JsonResponse
    {
        $filters = [
            'q' => $request->string('q')->toString(),
            'form_id' => $request->integer('form_id') ?: null,
            'status' => $request->string('status')->toString(),
        ];

        return response()->json([
            'submissions' => $this->submissions->paginate($filters, $this->perPage($request, 50)),
            'forms' => $this->submissions->forms(),
            'filters' => $filters,
        ]);
    }

    public function categories(Request $request): JsonResponse
    {
        return response()->json([
            'categories' => $this->categories->visibleTo($request->user()),
        ]);
    }

    public function registries(): JsonResponse
    {
        return response()->json([
            'module_types' => $this->moduleTypes->definitions(),
            'form_field_types' => $this->fieldTypes->definitions(),
            'form_action_types' => $this->actionTypes->definitions(),
        ]);
    }

    private function perPage(Request $request, int $default): int
    {
        return max(1, min(100, $request->integer('per_page', $default)));
    }
}
