<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_modules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('type', 80);
            $table->string('category', 80)->default('content');
            $table->string('status', 40)->default('active');
            $table->json('content')->nullable();
            $table->json('style')->nullable();
            $table->json('settings')->nullable();
            $table->text('advanced_classes')->nullable();
            $table->longText('custom_css')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['type', 'status']);
            $table->index('category');
        });

        Schema::create('cms_page_layouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_page_id')->constrained('site_pages')->cascadeOnDelete();
            $table->string('status', 40)->default('draft');
            $table->json('layout')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['site_page_id', 'status']);
        });

        Schema::create('cms_module_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cms_module_id')->constrained('cms_modules')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('type', 80);
            $table->json('content')->nullable();
            $table->json('style')->nullable();
            $table->json('settings')->nullable();
            $table->text('advanced_classes')->nullable();
            $table->longText('custom_css')->nullable();
            $table->string('note')->nullable();
            $table->timestamps();
        });

        Schema::create('cms_forms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('status', 40)->default('active');
            $table->string('submit_label')->default('Submit');
            $table->text('success_message')->nullable();
            $table->json('spam_settings')->nullable();
            $table->json('style')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('cms_form_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cms_form_id')->constrained('cms_forms')->cascadeOnDelete();
            $table->string('type', 50);
            $table->string('label');
            $table->string('name');
            $table->string('placeholder')->nullable();
            $table->text('help_text')->nullable();
            $table->boolean('required')->default(false);
            $table->json('validation_rules')->nullable();
            $table->json('options')->nullable();
            $table->json('layout')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->unique(['cms_form_id', 'name']);
            $table->index(['cms_form_id', 'order']);
        });

        Schema::create('cms_form_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cms_form_id')->constrained('cms_forms')->cascadeOnDelete();
            $table->string('type', 60);
            $table->boolean('enabled')->default(true);
            $table->json('config')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index(['cms_form_id', 'enabled', 'order']);
        });

        Schema::create('cms_form_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cms_form_id')->constrained('cms_forms')->cascadeOnDelete();
            $table->foreignId('site_page_id')->nullable()->constrained('site_pages')->nullOnDelete();
            $table->json('payload');
            $table->json('metadata')->nullable();
            $table->string('status', 40)->default('new');
            $table->timestamps();

            $table->index(['cms_form_id', 'status']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_form_submissions');
        Schema::dropIfExists('cms_form_actions');
        Schema::dropIfExists('cms_form_fields');
        Schema::dropIfExists('cms_forms');
        Schema::dropIfExists('cms_module_revisions');
        Schema::dropIfExists('cms_page_layouts');
        Schema::dropIfExists('cms_modules');
    }
};
