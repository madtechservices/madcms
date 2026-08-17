<?php

namespace MadTechServices\MadCms\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use MadTechServices\MadCms\Contracts\AccessManager;
use MadTechServices\MadCms\Contracts\CategoryAdminQuery;
use MadTechServices\MadCms\Contracts\FormActionTypeRegistry;
use MadTechServices\MadCms\Contracts\FormAdminQuery;
use MadTechServices\MadCms\Contracts\FormDefinitionManager;
use MadTechServices\MadCms\Contracts\FormFieldTypeRegistry;
use MadTechServices\MadCms\Contracts\FormRuleBuilder;
use MadTechServices\MadCms\Contracts\FormSubmissionProcessor;
use MadTechServices\MadCms\Contracts\LayoutUsageAnalyzer;
use MadTechServices\MadCms\Contracts\ModuleAdminQuery;
use MadTechServices\MadCms\Contracts\ModuleDefinitionManager;
use MadTechServices\MadCms\Contracts\ModuleTypeRegistry;
use MadTechServices\MadCms\Contracts\PageAdminQuery;
use MadTechServices\MadCms\Contracts\PageDefinitionManager;
use MadTechServices\MadCms\Contracts\PageLayoutInspector;
use MadTechServices\MadCms\Contracts\PagePublishingPolicy;
use MadTechServices\MadCms\Contracts\SubmissionAdminQuery;
use MadTechServices\MadCms\Http\Controllers\CategoryMutationController;
use MadTechServices\MadCms\Http\Controllers\FormMutationController;
use MadTechServices\MadCms\Http\Controllers\ModuleMutationController;
use MadTechServices\MadCms\Http\Controllers\PageMutationController;
use MadTechServices\MadCms\Http\Controllers\SubmissionAdminController;
use MadTechServices\MadCms\Models\CmsCategory;
use MadTechServices\MadCms\Models\CmsForm;
use MadTechServices\MadCms\Models\CmsFormAction;
use MadTechServices\MadCms\Models\CmsFormActionLog;
use MadTechServices\MadCms\Models\CmsFormField;
use MadTechServices\MadCms\Models\CmsFormSubmission;
use MadTechServices\MadCms\Models\CmsModule;
use MadTechServices\MadCms\Models\CmsModuleRevision;
use MadTechServices\MadCms\Models\CmsPageLayout;
use MadTechServices\MadCms\Models\CmsPageSearchRanking;
use MadTechServices\MadCms\Models\CmsStylePreset;
use MadTechServices\MadCms\Models\SitePage;
use MadTechServices\MadCms\Models\SitePageRevision;
use Throwable;

class StatusCommand extends Command
{
    protected $signature = 'madcms:status {--json : Return the report as JSON}';

    protected $description = 'Report MAD CMS installation health and package extraction ownership';

    public function handle(): int
    {
        $checks = $this->checks();
        $healthy = collect($checks)->every(fn (array $check) => $check['ready']);

        $report = [
            'package' => 'madtechservices/madcms',
            'mode' => config('madcms.mode', 'hybrid'),
            'healthy' => $healthy,
            'checks' => $checks,
        ];

        if ($this->option('json')) {
            $this->line((string) json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

            return $healthy ? self::SUCCESS : self::FAILURE;
        }

        $this->components->info('MAD CMS package status');
        $this->line('Package: <fg=cyan>'.$report['package'].'</>');
        $this->line('Mode: <fg=yellow>'.$report['mode'].'</>');
        $this->newLine();
        $this->table(
            ['Area', 'Status', 'Ownership', 'Details'],
            collect($checks)->map(fn (array $check, string $area) => [
                $area,
                $check['ready'] ? 'ready' : 'missing',
                $check['ownership'],
                $check['details'],
            ])->all(),
        );

        $this->newLine();
        $this->line($healthy
            ? '<fg=green>Existing CMS installation detected. Package extraction can continue incrementally.</>'
            : '<fg=red>One or more required host integrations are missing.</>');

        return $healthy ? self::SUCCESS : self::FAILURE;
    }

    /** @return array<string, array{ready: bool, ownership: string, details: string}> */
    private function checks(): array
    {
        $tables = collect(config('madcms.tables', []));
        $missingTables = $tables->filter(fn (string $table) => ! $this->hasTable($table))->values();
        $pageModel = config('madcms.models.page');
        $userModel = config('madcms.models.user');
        $pageRevisionModel = config('madcms.models.page_revision');
        $categoryModel = config('madcms.models.category');
        $searchRankingModel = config('madcms.models.search_ranking');
        $layoutModel = config('madcms.models.layout');
        $moduleModel = config('madcms.models.module');
        $moduleRevisionModel = config('madcms.models.module_revision');
        $formModel = config('madcms.models.form');
        $formFieldModel = config('madcms.models.form_field');
        $formActionModel = config('madcms.models.form_action');
        $formActionLogModel = config('madcms.models.form_action_log');
        $formSubmissionModel = config('madcms.models.form_submission');
        $stylePresetModel = config('madcms.models.style_preset');
        $extractedModels = [
            [$pageModel, SitePage::class],
            [$pageRevisionModel, SitePageRevision::class],
            [$categoryModel, CmsCategory::class],
            [$searchRankingModel, CmsPageSearchRanking::class],
            [$layoutModel, CmsPageLayout::class],
            [$moduleModel, CmsModule::class],
            [$moduleRevisionModel, CmsModuleRevision::class],
            [$formModel, CmsForm::class],
            [$formFieldModel, CmsFormField::class],
            [$formActionModel, CmsFormAction::class],
            [$formActionLogModel, CmsFormActionLog::class],
            [$formSubmissionModel, CmsFormSubmission::class],
            [$stylePresetModel, CmsStylePreset::class],
        ];
        $extractedModelsReady = collect($extractedModels)->every(
            fn (array $mapping): bool => is_string($mapping[0])
                && class_exists($mapping[0])
                && is_a($mapping[0], $mapping[1], true),
        );
        $packageFrontendPath = dirname(__DIR__, 2).'/'.ltrim((string) config('madcms.frontend.package_entrypoint'), '/');
        $hostFrontendReady = is_dir(base_path((string) config('madcms.frontend.source_path', 'resources/js')));
        $packageFrontendReady = is_file($packageFrontendPath);
        $packageRoutes = (bool) config('madcms.routes.register');
        $adminMutationRoutes = (bool) config('madcms.routes.register_admin_mutations');
        $adminApiRoutes = (bool) config('madcms.routes.register_admin_api');
        $adminPresentationRoutes = (bool) config('madcms.routes.register_admin_presentation');
        $routeNamePrefix = (string) config('madcms.routes.name_prefix', 'cms.');
        $publicFormRoute = (string) config('madcms.routes.public_form_name', 'forms.submit');
        $publicFormRouteReady = Route::has($publicFormRoute);
        $adminMutationRoutesReady = ! $adminMutationRoutes
            || (Route::has($routeNamePrefix.'pages.store')
                && Route::has($routeNamePrefix.'modules.store')
                && Route::has($routeNamePrefix.'forms.store')
                && Route::has($routeNamePrefix.'form-submissions.export')
                && Route::has($routeNamePrefix.'categories.store'));
        $adminApiRoutesReady = ! $adminApiRoutes
            || (Route::has($routeNamePrefix.'pages.index')
                && Route::has($routeNamePrefix.'pages.show')
                && Route::has($routeNamePrefix.'modules.index')
                && Route::has($routeNamePrefix.'forms.index')
                && Route::has($routeNamePrefix.'form-submissions.index')
                && Route::has($routeNamePrefix.'categories.index')
                && Route::has($routeNamePrefix.'registries.index'));
        $presentationNamePrefix = (string) config('madcms.routes.presentation_name_prefix', 'madcms.ui.');
        $adminPresentationRoutesReady = ! $adminPresentationRoutes
            || (class_exists(Inertia::class)
                && Route::has($presentationNamePrefix.'pages')
                && Route::has($presentationNamePrefix.'modules')
                && Route::has($presentationNamePrefix.'forms')
                && Route::has($presentationNamePrefix.'submissions')
                && Route::has($presentationNamePrefix.'categories'));
        $routesReady = $packageRoutes
            ? $publicFormRouteReady && $adminMutationRoutesReady && $adminApiRoutesReady && $adminPresentationRoutesReady
            : $publicFormRouteReady && Route::has($routeNamePrefix.'pages.index');

        return [
            'configuration' => [
                'ready' => is_string(config('madcms.mode')),
                'ownership' => 'package',
                'details' => 'Package configuration is loaded.',
            ],
            'database' => [
                'ready' => $missingTables->isEmpty(),
                'ownership' => config('madcms.migrations.load') ? 'package' : 'application',
                'details' => $missingTables->isEmpty()
                    ? $tables->count().' existing CMS tables detected.'
                    : 'Missing: '.$missingTables->implode(', '),
            ],
            'models' => [
                'ready' => is_string($userModel) && class_exists($userModel),
                'ownership' => str_starts_with((string) $userModel, 'MadTechServices\\') ? 'package' : 'application',
                'details' => 'Host user model: '.$userModel.'.',
            ],
            'extracted models' => [
                'ready' => $extractedModelsReady,
                'ownership' => $extractedModelsReady ? 'package' : 'application',
                'details' => 'Page, category, ranking, builder, and form model families are available from MAD CMS.',
            ],
            'registries' => [
                'ready' => app()->bound(ModuleTypeRegistry::class)
                    && app()->bound(FormFieldTypeRegistry::class)
                    && app()->bound(FormActionTypeRegistry::class),
                'ownership' => 'package',
                'details' => 'Module, form field, and form action extension registries are bound.',
            ],
            'form services' => [
                'ready' => app()->bound(FormRuleBuilder::class)
                    && app()->bound(FormSubmissionProcessor::class)
                    && app()->bound(FormDefinitionManager::class),
                'ownership' => 'package',
                'details' => 'Form definitions, public validation, submission processing, and action execution are package-owned.',
            ],
            'module services' => [
                'ready' => app()->bound(ModuleDefinitionManager::class),
                'ownership' => 'package',
                'details' => 'Reusable module definitions, slugs, duplication, and revisions are package-owned.',
            ],
            'layout services' => [
                'ready' => app()->bound(LayoutUsageAnalyzer::class)
                    && app()->bound(PageLayoutInspector::class)
                    && app()->bound(PageAdminQuery::class)
                    && app()->bound(PageDefinitionManager::class)
                    && app()->bound(PagePublishingPolicy::class),
                'ownership' => 'package',
                'details' => 'Page persistence/revisions, builder inspection, and linked module/form usage analysis are package-owned.',
            ],
            'admin mutations' => [
                'ready' => class_exists(ModuleMutationController::class)
                    && class_exists(PageMutationController::class)
                    && class_exists(FormMutationController::class)
                    && class_exists(SubmissionAdminController::class)
                    && class_exists(CategoryMutationController::class)
                    && app()->bound(ModuleAdminQuery::class)
                    && app()->bound(FormAdminQuery::class)
                    && app()->bound(SubmissionAdminQuery::class)
                    && app()->bound(AccessManager::class)
                    && app()->bound(CategoryAdminQuery::class),
                'ownership' => 'package',
                'details' => 'Access, page layout inspection/querying, category, module, form, and submission administration is package-owned and independently routable.',
            ],
            'routes' => [
                'ready' => $routesReady,
                'ownership' => $packageRoutes ? 'package' : 'application',
                'details' => $packageRoutes
                    ? (($adminMutationRoutes || $adminApiRoutes || $adminPresentationRoutes)
                        ? 'Public form and enabled opt-in admin API, mutation, and presentation routes are registered.'
                        : 'Public form route is registered; package admin API, mutation, and presentation routes are disabled by configuration.')
                    : 'Host CMS admin and public form routes are registered.',
            ],
            'frontend' => [
                'ready' => $hostFrontendReady && $packageFrontendReady,
                'ownership' => config('madcms.frontend.register') ? 'package' : 'application',
                'details' => $packageFrontendReady
                    ? 'Versioned frontend contract, neutral admin shell, page/module/form editors, category manager, submission detail, runtime, starter and editor schemas, schema-driven property fields, responsive, layout, and advanced scoped style controls, 22 core renderers, public forms, rows/columns canvas, component library, and property panel are available; the host supplies optional design-system and theme adapters.'
                    : 'Package frontend contract entrypoint is missing.',
            ],
        ];
    }

    private function hasTable(string $table): bool
    {
        try {
            return Schema::hasTable($table);
        } catch (Throwable) {
            return false;
        }
    }
}
