<?php

namespace MadTechServices\MadCms\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use MadTechServices\MadCms\Contracts\CategoryAdminQuery;
use MadTechServices\MadCms\Contracts\FormActionTypeRegistry;
use MadTechServices\MadCms\Contracts\FormAdminQuery;
use MadTechServices\MadCms\Contracts\FormFieldTypeRegistry;
use MadTechServices\MadCms\Contracts\ModuleAdminQuery;
use MadTechServices\MadCms\Contracts\ModuleTypeRegistry;
use MadTechServices\MadCms\Contracts\PageAdminQuery;
use MadTechServices\MadCms\Contracts\SubmissionAdminQuery;

class AdminPresentationController
{
    public function __construct(
        private readonly PageAdminQuery $pages,
        private readonly ModuleAdminQuery $modules,
        private readonly FormAdminQuery $forms,
        private readonly SubmissionAdminQuery $submissions,
        private readonly CategoryAdminQuery $categories,
        private readonly ModuleTypeRegistry $moduleTypes,
        private readonly FormFieldTypeRegistry $fieldTypes,
        private readonly FormActionTypeRegistry $actionTypes,
    ) {}

    public function pages(Request $request)
    {
        $filters = ['q' => $request->string('q')->toString(), 'status' => $request->string('status')->toString(), 'builder' => $request->string('builder')->toString()];

        return Inertia::render($this->component('Pages'), $this->shared() + [
            'pages' => $this->pages->paginate($filters, $request->user()),
            'filters' => $filters,
            'builderSummary' => $this->pages->summary($request->user()),
        ]);
    }

    public function createPage(Request $request)
    {
        return Inertia::render($this->component('PageEdit'), $this->shared() + $this->pages->createData($request->user()) + [
            'mode' => 'create',
        ]);
    }

    public function editPage(Request $request, int|string $page)
    {
        $pageModel = (string) config('madcms.models.page');
        $record = $pageModel::query()->findOrFail($page);

        return Inertia::render($this->component('PageEdit'), $this->shared() + $this->pages->editorData($record, $request->user()) + [
            'mode' => 'edit',
        ]);
    }

    public function modules(Request $request)
    {
        $filters = ['q' => $request->string('q')->toString(), 'type' => $request->string('type')->toString()];

        return Inertia::render($this->component('Modules'), $this->shared() + [
            'modules' => $this->modules->paginate($filters),
            'filters' => $filters,
            'types' => $this->moduleTypes->all(),
        ]);
    }

    public function createModule()
    {
        $types = $this->moduleTypes->definitions();
        $type = array_key_first($types) ?: 'text-block';
        $definition = $types[$type] ?? [];

        return Inertia::render($this->component('ModuleEdit'), $this->shared() + [
            'mode' => 'create',
            'module' => [
                'name' => '',
                'slug' => '',
                'type' => $type,
                'category' => $definition['category'] ?? 'content',
                'status' => 'active',
                'content' => $definition['default_content'] ?? [],
                'style' => $definition['default_style'] ?? [],
                'settings' => [],
                'advanced_classes' => '',
                'custom_css' => '',
                'usage_count' => 0,
                'usage_pages' => [],
            ],
            'forms' => $this->modules->activeForms(),
            'types' => $types,
        ]);
    }

    public function editModule(int|string $module)
    {
        $moduleModel = (string) config('madcms.models.module');
        $record = $moduleModel::query()->findOrFail($module);

        return Inertia::render($this->component('ModuleEdit'), $this->shared() + $this->modules->editorData($record) + [
            'mode' => 'edit',
            'types' => $this->moduleTypes->definitions(),
        ]);
    }

    public function forms(Request $request)
    {
        $filters = ['q' => $request->string('q')->toString()];

        return Inertia::render($this->component('Forms'), $this->shared() + [
            'forms' => $this->forms->paginate($filters),
            'filters' => $filters,
            'fieldTypes' => $this->fieldTypes->all(),
            'actionTypes' => $this->actionTypes->all(),
        ]);
    }

    public function createForm()
    {
        return Inertia::render($this->component('FormEdit'), $this->shared() + [
            'mode' => 'create',
            'form' => [
                'name' => '',
                'slug' => '',
                'description' => '',
                'status' => 'active',
                'submit_label' => 'Submit',
                'success_message' => 'Thanks, your submission has been received.',
                'spam_settings' => ['honeypot_enabled' => true, 'minimum_seconds' => 2],
                'style' => [],
                'fields' => [],
                'actions' => [['type' => 'database', 'enabled' => true, 'config' => []]],
                'usage_count' => 0,
                'usage_pages' => [],
                'submissions_count' => 0,
            ],
            'fieldTypes' => $this->fieldTypes->definitions(),
            'actionTypes' => $this->actionTypes->definitions(),
        ]);
    }

    public function editForm(int|string $form)
    {
        $formModel = (string) config('madcms.models.form');
        $record = $formModel::query()->findOrFail($form);

        return Inertia::render($this->component('FormEdit'), $this->shared() + $this->forms->editorData($record) + [
            'mode' => 'edit',
            'fieldTypes' => $this->fieldTypes->definitions(),
            'actionTypes' => $this->actionTypes->definitions(),
        ]);
    }

    public function submissions(Request $request)
    {
        $filters = ['q' => $request->string('q')->toString(), 'form_id' => $request->integer('form_id') ?: null, 'status' => $request->string('status')->toString()];

        return Inertia::render($this->component('Submissions'), $this->shared() + [
            'submissions' => $this->submissions->paginate($filters),
            'filters' => $filters,
            'forms' => $this->submissions->forms(),
        ]);
    }

    public function submission(int|string $submission)
    {
        return Inertia::render($this->component('SubmissionShow'), $this->shared() + [
            'submission' => $this->submissions->find($submission),
            'statuses' => ['new', 'read', 'archived'],
        ]);
    }

    public function categories(Request $request)
    {
        return Inertia::render($this->component('Categories'), $this->shared() + [
            'categories' => $this->categories->visibleTo($request->user()),
        ]);
    }

    private function component(string $name): string
    {
        return trim((string) config('madcms.routes.presentation_component_prefix', 'MadCms'), '/').'/'.$name;
    }

    private function shared(): array
    {
        return [
            'madcmsBasePath' => '/'.trim((string) config('madcms.routes.presentation_prefix', 'madcms'), '/'),
            'madcmsMutationBasePath' => '/'.trim((string) config('madcms.routes.prefix', 'cms'), '/'),
            'madcmsMutationsEnabled' => (bool) config('madcms.routes.register_admin_mutations', false),
        ];
    }
}
