<?php

namespace MadTechServices\MadCms;

use Illuminate\Support\ServiceProvider;
use MadTechServices\MadCms\Console\InstallCommand;
use MadTechServices\MadCms\Console\StatusCommand;
use MadTechServices\MadCms\Contracts\AccessManager as AccessManagerContract;
use MadTechServices\MadCms\Contracts\CategoryAdminQuery as CategoryAdminQueryContract;
use MadTechServices\MadCms\Contracts\FormActionTypeRegistry as FormActionTypeRegistryContract;
use MadTechServices\MadCms\Contracts\FormAdminQuery as FormAdminQueryContract;
use MadTechServices\MadCms\Contracts\FormDefinitionManager as FormDefinitionManagerContract;
use MadTechServices\MadCms\Contracts\FormFieldTypeRegistry as FormFieldTypeRegistryContract;
use MadTechServices\MadCms\Contracts\FormRuleBuilder as FormRuleBuilderContract;
use MadTechServices\MadCms\Contracts\FormSubmissionProcessor as FormSubmissionProcessorContract;
use MadTechServices\MadCms\Contracts\LayoutUsageAnalyzer as LayoutUsageAnalyzerContract;
use MadTechServices\MadCms\Contracts\ModuleAdminQuery as ModuleAdminQueryContract;
use MadTechServices\MadCms\Contracts\ModuleDefinitionManager as ModuleDefinitionManagerContract;
use MadTechServices\MadCms\Contracts\ModuleTypeRegistry as ModuleTypeRegistryContract;
use MadTechServices\MadCms\Contracts\PageAdminQuery as PageAdminQueryContract;
use MadTechServices\MadCms\Contracts\PageDefinitionManager as PageDefinitionManagerContract;
use MadTechServices\MadCms\Contracts\PageLayoutInspector as PageLayoutInspectorContract;
use MadTechServices\MadCms\Contracts\PagePublishingPolicy as PagePublishingPolicyContract;
use MadTechServices\MadCms\Contracts\SubmissionAdminQuery as SubmissionAdminQueryContract;
use MadTechServices\MadCms\Registry\FormActionTypeRegistry;
use MadTechServices\MadCms\Registry\FormFieldTypeRegistry;
use MadTechServices\MadCms\Registry\ModuleTypeRegistry;
use MadTechServices\MadCms\Support\CmsAccessManager;
use MadTechServices\MadCms\Support\CmsCategoryAdminQuery;
use MadTechServices\MadCms\Support\CmsFormAdminQuery;
use MadTechServices\MadCms\Support\CmsFormDefinitionManager;
use MadTechServices\MadCms\Support\CmsFormRuleBuilder;
use MadTechServices\MadCms\Support\CmsFormSubmissionProcessor;
use MadTechServices\MadCms\Support\CmsLayoutUsageAnalyzer;
use MadTechServices\MadCms\Support\CmsModuleAdminQuery;
use MadTechServices\MadCms\Support\CmsModuleDefinitionManager;
use MadTechServices\MadCms\Support\CmsPageAdminQuery;
use MadTechServices\MadCms\Support\CmsPageDefinitionManager;
use MadTechServices\MadCms\Support\CmsPageLayoutInspector;
use MadTechServices\MadCms\Support\CmsPagePublishingPolicy;
use MadTechServices\MadCms\Support\CmsSubmissionAdminQuery;

class MadCmsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/madcms.php', 'madcms');

        $this->app->singleton(ModuleTypeRegistryContract::class, function (): ModuleTypeRegistry {
            return new ModuleTypeRegistry(config('madcms.module_types', []));
        });

        $this->app->alias(ModuleTypeRegistryContract::class, ModuleTypeRegistry::class);

        $this->app->singleton(FormFieldTypeRegistryContract::class, function (): FormFieldTypeRegistry {
            return new FormFieldTypeRegistry(config('madcms.form_field_types', []));
        });
        $this->app->alias(FormFieldTypeRegistryContract::class, FormFieldTypeRegistry::class);

        $this->app->singleton(FormActionTypeRegistryContract::class, function (): FormActionTypeRegistry {
            return new FormActionTypeRegistry(config('madcms.form_action_types', []));
        });
        $this->app->alias(FormActionTypeRegistryContract::class, FormActionTypeRegistry::class);

        $this->app->bind(FormRuleBuilderContract::class, CmsFormRuleBuilder::class);
        $this->app->bind(FormSubmissionProcessorContract::class, CmsFormSubmissionProcessor::class);
        $this->app->bind(FormDefinitionManagerContract::class, CmsFormDefinitionManager::class);
        $this->app->bind(ModuleDefinitionManagerContract::class, CmsModuleDefinitionManager::class);
        $this->app->bind(LayoutUsageAnalyzerContract::class, CmsLayoutUsageAnalyzer::class);
        $this->app->bind(ModuleAdminQueryContract::class, CmsModuleAdminQuery::class);
        $this->app->bind(FormAdminQueryContract::class, CmsFormAdminQuery::class);
        $this->app->bind(SubmissionAdminQueryContract::class, CmsSubmissionAdminQuery::class);
        $this->app->bind(AccessManagerContract::class, CmsAccessManager::class);
        $this->app->bind(CategoryAdminQueryContract::class, CmsCategoryAdminQuery::class);
        $this->app->bind(PageLayoutInspectorContract::class, CmsPageLayoutInspector::class);
        $this->app->bind(PageAdminQueryContract::class, CmsPageAdminQuery::class);
        $this->app->bind(PageDefinitionManagerContract::class, CmsPageDefinitionManager::class);
        $this->app->bind(PagePublishingPolicyContract::class, CmsPagePublishingPolicy::class);
    }

    public function boot(): void
    {
        $this->publishes([
            __DIR__.'/../config/madcms.php' => config_path('madcms.php'),
        ], 'madcms-config');

        $this->publishes([
            __DIR__.'/../resources/js' => resource_path('js/vendor/madcms'),
        ], 'madcms-frontend');

        $this->publishes([
            __DIR__.'/../resources/stubs/pages/MadCms' => resource_path('js/pages/MadCms'),
        ], 'madcms-admin-pages');

        if ($this->app->runningInConsole()) {
            $this->commands([
                InstallCommand::class,
                StatusCommand::class,
            ]);
        }

        if (config('madcms.migrations.load', false)) {
            $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
        }

        if (config('madcms.routes.register', false)) {
            $this->loadRoutesFrom(__DIR__.'/../routes/madcms.php');
        }
    }
}
