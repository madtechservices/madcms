<?php

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

$mode = env('MADCMS_MODE', 'hybrid');
$model = static fn (string $host, string $package): string => $mode === 'hybrid' && class_exists($host)
    ? $host
    : $package;

return [
    /*
    | Hybrid mode lets an existing application adopt MAD CMS incrementally.
    | Package mode will be used by fresh installations after extraction is complete.
    */
    'mode' => $mode,

    'access' => [
        'admin_role' => 'admin',
        'roles_table' => 'roles',
    ],

    'routes' => [
        'register' => env('MADCMS_REGISTER_ROUTES', $mode === 'package'),
        'register_admin_mutations' => env('MADCMS_REGISTER_ADMIN_MUTATIONS', false),
        'register_admin_api' => env('MADCMS_REGISTER_ADMIN_API', false),
        'register_admin_presentation' => env('MADCMS_REGISTER_ADMIN_PRESENTATION', false),
        'prefix' => 'cms',
        'name_prefix' => 'cms.',
        'middleware' => ['web', 'auth'],
        'public_form_path' => 'forms/{form}',
        'public_form_name' => 'forms.submit',
        'public_form_middleware' => ['web'],
        'page_middleware' => ['can:cms-pages-view'],
        'module_middleware' => ['can:cms-modules-manage'],
        'form_middleware' => ['can:cms-forms-manage'],
        'submission_middleware' => ['can:cms-form-submissions-view'],
        'category_middleware' => ['can:cms-categories-manage'],
        'registry_middleware' => [],
        'presentation_prefix' => env('MADCMS_PRESENTATION_PREFIX', 'madcms'),
        'presentation_name_prefix' => 'madcms.ui.',
        'presentation_middleware' => ['web', 'auth'],
        'presentation_component_prefix' => 'MadCms',
    ],

    'migrations' => [
        'load' => env('MADCMS_LOAD_MIGRATIONS', $mode === 'package'),
    ],

    'models' => [
        'user' => 'App\\Models\\User',
        'page' => $model('App\\Models\\SitePage', SitePage::class),
        'page_revision' => $model('App\\Models\\SitePageRevision', SitePageRevision::class),
        'category' => $model('App\\Models\\CmsCategory', CmsCategory::class),
        'search_ranking' => $model('App\\Models\\CmsPageSearchRanking', CmsPageSearchRanking::class),
        'layout' => $model('App\\Models\\CmsPageLayout', CmsPageLayout::class),
        'module' => $model('App\\Models\\CmsModule', CmsModule::class),
        'module_revision' => $model('App\\Models\\CmsModuleRevision', CmsModuleRevision::class),
        'form' => $model('App\\Models\\CmsForm', CmsForm::class),
        'form_field' => $model('App\\Models\\CmsFormField', CmsFormField::class),
        'form_action' => $model('App\\Models\\CmsFormAction', CmsFormAction::class),
        'form_action_log' => $model('App\\Models\\CmsFormActionLog', CmsFormActionLog::class),
        'form_submission' => $model('App\\Models\\CmsFormSubmission', CmsFormSubmission::class),
        'style_preset' => $model('App\\Models\\CmsStylePreset', CmsStylePreset::class),
    ],

    'module_types' => [
        'hero',
        'logo-grid',
        'service-cards',
        'testimonial-grid',
        'portal-cta',
        'feature-split',
        'faq',
        'form-embed',
        'text-block',
        'heading',
        'image',
        'gallery',
        'stats',
        'video',
        'icon-feature',
        'button',
        'quote',
        'divider',
        'spacer',
        'map',
        'embed',
        'carousel',
    ],

    'form_field_types' => [
        'text',
        'textarea',
        'email',
        'phone',
        'select',
        'checkbox',
        'radio',
        'hidden',
        'consent',
    ],

    'form_action_types' => [
        'database',
        'email',
        'autoresponder',
        'webhook',
    ],

    'tables' => [
        'pages' => 'site_pages',
        'page_revisions' => 'site_page_revisions',
        'layouts' => 'cms_page_layouts',
        'modules' => 'cms_modules',
        'module_revisions' => 'cms_module_revisions',
        'forms' => 'cms_forms',
        'form_fields' => 'cms_form_fields',
        'form_actions' => 'cms_form_actions',
        'form_action_logs' => 'cms_form_action_logs',
        'form_submissions' => 'cms_form_submissions',
        'categories' => 'cms_categories',
        'category_page' => 'cms_category_site_page',
        'style_presets' => 'cms_style_presets',
        'search_rankings' => 'cms_page_search_rankings',
    ],

    'permissions' => [
        'pages_view' => 'cms-pages-view',
        'pages_create' => 'cms-pages-create',
        'pages_edit' => 'cms-pages-edit',
        'pages_delete' => 'cms-pages-delete',
        'pages_publish' => 'cms-pages-publish',
        'categories_manage' => 'cms-categories-manage',
        'menus_manage' => 'cms-menus-manage',
        'modules_manage' => 'cms-modules-manage',
        'forms_manage' => 'cms-forms-manage',
        'submissions_view' => 'cms-form-submissions-view',
    ],

    'frontend' => [
        'framework' => 'inertia-react',
        'source_path' => 'resources/js',
        'contract_version' => 1,
        'runtime_live' => true,
        'core_renderers_live' => true,
        'form_renderer_live' => true,
        'builder_canvas_live' => true,
        'module_library_live' => true,
        'property_panel_live' => true,
        'editor_schemas_live' => true,
        'editor_fields_live' => true,
        'responsive_style_controls_live' => true,
        'layout_style_fields_live' => true,
        'advanced_style_fields_live' => true,
        'admin_shell_available' => true,
        'admin_collections_available' => true,
        'admin_category_manager_available' => true,
        'admin_form_editor_available' => true,
        'admin_module_editor_available' => true,
        'admin_page_editor_available' => true,
        'admin_submission_detail_available' => true,
        'package_entrypoint' => 'resources/js/index.ts',
        'publish_path' => 'resources/js/vendor/madcms',
        'register' => false,
    ],
];
