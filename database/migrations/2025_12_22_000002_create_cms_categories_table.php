<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_categories', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('cms_categories')->nullOnDelete();
            $table->integer('order')->default(0);
            $table->json('seo')->nullable();
            $table->json('access')->nullable();
            $table->timestamps();
        });

        Schema::create('cms_category_site_page', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cms_category_id')->constrained('cms_categories')->cascadeOnDelete();
            $table->foreignId('site_page_id')->constrained('site_pages')->cascadeOnDelete();
            $table->unique(['cms_category_id', 'site_page_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_category_site_page');
        Schema::dropIfExists('cms_categories');
    }
};
