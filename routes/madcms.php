<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use MadTechServices\MadCms\Http\Controllers\AdminDataController;
use MadTechServices\MadCms\Http\Controllers\AdminPresentationController;
use MadTechServices\MadCms\Http\Controllers\CategoryMutationController;
use MadTechServices\MadCms\Http\Controllers\FormMutationController;
use MadTechServices\MadCms\Http\Controllers\ModuleMutationController;
use MadTechServices\MadCms\Http\Controllers\PageMutationController;
use MadTechServices\MadCms\Http\Controllers\PublicFormController;
use MadTechServices\MadCms\Http\Controllers\SubmissionAdminController;

Route::middleware(config('madcms.routes.public_form_middleware', ['web']))
    ->post(
        config('madcms.routes.public_form_path', 'forms/{form}'),
        [PublicFormController::class, 'store'],
    )
    ->name(config('madcms.routes.public_form_name', 'forms.submit'));

if (config('madcms.routes.register_admin_mutations', false) || config('madcms.routes.register_admin_api', false)) {
    Route::prefix(config('madcms.routes.prefix', 'cms'))
        ->name(config('madcms.routes.name_prefix', 'cms.'))
        ->middleware(config('madcms.routes.middleware', ['web', 'auth']))
        ->group(function (): void {
            if (config('madcms.routes.register_admin_api', false)) {
                Route::get('pages', [AdminDataController::class, 'pages'])
                    ->middleware(config('madcms.routes.page_middleware', []))
                    ->name('pages.index');
                Route::get('pages/{page}', [AdminDataController::class, 'page'])
                    ->middleware(config('madcms.routes.page_middleware', []))
                    ->name('pages.show');
            }

            if (config('madcms.routes.register_admin_mutations', false)) {
                Route::middleware(config('madcms.routes.page_middleware', []))->group(function (): void {
                    Route::post('pages', [PageMutationController::class, 'store'])->name('pages.store');
                    Route::put('pages/{page}', [PageMutationController::class, 'update'])->name('pages.update');
                    Route::delete('pages/{page}', [PageMutationController::class, 'destroy'])->name('pages.destroy');
                    Route::post('pages/{page}/duplicate', [PageMutationController::class, 'duplicate'])->name('pages.duplicate');
                    Route::post('pages/{page}/publish', [PageMutationController::class, 'publish'])->name('pages.publish');
                    Route::post('pages/{page}/unpublish', [PageMutationController::class, 'unpublish'])->name('pages.unpublish');
                    Route::post('pages/{page}/archive', [PageMutationController::class, 'archive'])->name('pages.archive');
                    Route::post('pages/{page}/revisions/{revision}/restore', [PageMutationController::class, 'restoreRevision'])->name('pages.revisions.restore');
                    Route::post('pages/{page}/builder-review', [PageMutationController::class, 'markReviewed'])->name('pages.builder.review');
                    Route::post('pages/{page}/builder-enable', [PageMutationController::class, 'enableReviewed'])->name('pages.builder.enable');
                });
            }

            if (config('madcms.routes.register_admin_api', false)) {
                Route::get('registries', [AdminDataController::class, 'registries'])
                    ->middleware(config('madcms.routes.registry_middleware', []))
                    ->name('registries.index');
            }

            Route::middleware(config('madcms.routes.module_middleware', []))->group(function (): void {
                if (config('madcms.routes.register_admin_api', false)) {
                    Route::get('modules', [AdminDataController::class, 'modules'])->name('modules.index');
                }

                if (config('madcms.routes.register_admin_mutations', false)) {
                    Route::post('modules', [ModuleMutationController::class, 'store'])->name('modules.store');
                    Route::put('modules/{module}', [ModuleMutationController::class, 'update'])->name('modules.update');
                    Route::post('modules/{module}/duplicate', [ModuleMutationController::class, 'duplicate'])->name('modules.duplicate');
                    Route::post('modules/{module}/revisions/{revision}/restore', [ModuleMutationController::class, 'restoreRevision'])->name('modules.revisions.restore');
                    Route::delete('modules/{module}', [ModuleMutationController::class, 'destroy'])->name('modules.destroy');
                }
            });

            Route::middleware(config('madcms.routes.form_middleware', []))->group(function (): void {
                if (config('madcms.routes.register_admin_api', false)) {
                    Route::get('forms', [AdminDataController::class, 'forms'])->name('forms.index');
                }

                if (config('madcms.routes.register_admin_mutations', false)) {
                    Route::post('forms', [FormMutationController::class, 'store'])->name('forms.store');
                    Route::put('forms/{form}', [FormMutationController::class, 'update'])->name('forms.update');
                    Route::post('forms/{form}/duplicate', [FormMutationController::class, 'duplicate'])->name('forms.duplicate');
                    Route::delete('forms/{form}', [FormMutationController::class, 'destroy'])->name('forms.destroy');
                }
            });

            Route::middleware(config('madcms.routes.submission_middleware', []))->group(function (): void {
                if (config('madcms.routes.register_admin_api', false)) {
                    Route::get('form-submissions', [AdminDataController::class, 'submissions'])->name('form-submissions.index');
                }

                if (config('madcms.routes.register_admin_mutations', false)) {
                    Route::get('form-submissions/export', [SubmissionAdminController::class, 'export'])->name('form-submissions.export');
                    Route::post('form-submissions/bulk', [SubmissionAdminController::class, 'bulk'])->name('form-submissions.bulk');
                    Route::patch('form-submissions/{submission}', [SubmissionAdminController::class, 'update'])->name('form-submissions.update');
                    Route::delete('form-submissions/{submission}', [SubmissionAdminController::class, 'destroy'])->name('form-submissions.destroy');
                    Route::post('form-action-logs/{log}/retry', [SubmissionAdminController::class, 'retryAction'])->name('form-action-logs.retry');
                }
            });

            Route::middleware(config('madcms.routes.category_middleware', []))->group(function (): void {
                if (config('madcms.routes.register_admin_api', false)) {
                    Route::get('categories', [AdminDataController::class, 'categories'])->name('categories.index');
                }

                if (config('madcms.routes.register_admin_mutations', false)) {
                    Route::post('categories', [CategoryMutationController::class, 'store'])->name('categories.store');
                    Route::put('categories/{category}', [CategoryMutationController::class, 'update'])->name('categories.update');
                    Route::delete('categories/{category}', [CategoryMutationController::class, 'destroy'])->name('categories.destroy');
                    Route::post('categories/reorder', [CategoryMutationController::class, 'reorder'])->name('categories.reorder');
                }
            });
        });
}

if (config('madcms.routes.register_admin_presentation', false) && class_exists(Inertia::class)) {
    Route::prefix(config('madcms.routes.presentation_prefix', 'madcms'))
        ->name(config('madcms.routes.presentation_name_prefix', 'madcms.ui.'))
        ->middleware(config('madcms.routes.presentation_middleware', ['web', 'auth']))
        ->group(function (): void {
            Route::get('/', fn () => redirect()->route(config('madcms.routes.presentation_name_prefix', 'madcms.ui.').'pages'));
            Route::get('pages', [AdminPresentationController::class, 'pages'])->middleware(config('madcms.routes.page_middleware', []))->name('pages');
            Route::get('pages/create', [AdminPresentationController::class, 'createPage'])->middleware(config('madcms.routes.page_middleware', []))->name('pages.create');
            Route::get('pages/{page}', [AdminPresentationController::class, 'editPage'])->middleware(config('madcms.routes.page_middleware', []))->name('pages.edit');
            Route::get('modules', [AdminPresentationController::class, 'modules'])->middleware(config('madcms.routes.module_middleware', []))->name('modules');
            Route::get('modules/create', [AdminPresentationController::class, 'createModule'])->middleware(config('madcms.routes.module_middleware', []))->name('modules.create');
            Route::get('modules/{module}', [AdminPresentationController::class, 'editModule'])->middleware(config('madcms.routes.module_middleware', []))->name('modules.edit');
            Route::get('forms', [AdminPresentationController::class, 'forms'])->middleware(config('madcms.routes.form_middleware', []))->name('forms');
            Route::get('forms/create', [AdminPresentationController::class, 'createForm'])->middleware(config('madcms.routes.form_middleware', []))->name('forms.create');
            Route::get('forms/{form}', [AdminPresentationController::class, 'editForm'])->middleware(config('madcms.routes.form_middleware', []))->name('forms.edit');
            Route::get('submissions', [AdminPresentationController::class, 'submissions'])->middleware(config('madcms.routes.submission_middleware', []))->name('submissions');
            Route::get('submissions/{submission}', [AdminPresentationController::class, 'submission'])->middleware(config('madcms.routes.submission_middleware', []))->name('submissions.show');
            Route::get('categories', [AdminPresentationController::class, 'categories'])->middleware(config('madcms.routes.category_middleware', []))->name('categories');
        });
}
