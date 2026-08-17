<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_pages', function (Blueprint $table) {
            if (!Schema::hasColumn('site_pages', 'parent_id')) {
                $table->foreignId('parent_id')->nullable()->after('slug')->constrained('site_pages')->nullOnDelete();
            }
            if (!Schema::hasColumn('site_pages', 'subtitle')) {
                $table->string('subtitle')->nullable()->after('title');
            }
            if (!Schema::hasColumn('site_pages', 'excerpt')) {
                $table->text('excerpt')->nullable()->after('subtitle');
            }
            if (!Schema::hasColumn('site_pages', 'featured_image')) {
                $table->string('featured_image')->nullable()->after('excerpt');
            }
            if (!Schema::hasColumn('site_pages', 'unpublished_at')) {
                $table->timestamp('unpublished_at')->nullable()->after('published_at');
            }
            if (!Schema::hasColumn('site_pages', 'sort_order')) {
                $table->integer('sort_order')->default(0)->after('unpublished_at');
            }
            if (!Schema::hasColumn('site_pages', 'tags')) {
                $table->json('tags')->nullable()->after('sort_order');
            }
        });
    }

    public function down(): void
    {
        Schema::table('site_pages', function (Blueprint $table) {
            if (Schema::hasColumn('site_pages', 'parent_id')) {
                $table->dropConstrainedForeignId('parent_id');
            }
            $cols = [];
            foreach (['subtitle','excerpt','featured_image','unpublished_at','sort_order','tags'] as $c) {
                if (Schema::hasColumn('site_pages', $c)) {
                    $cols[] = $c;
                }
            }
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};