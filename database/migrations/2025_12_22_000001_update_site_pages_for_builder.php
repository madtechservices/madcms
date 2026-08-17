<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_pages', function (Blueprint $table) {
            $table->string('page_type')->default('site')->after('title');
            $table->string('status')->default('draft')->after('page_type');
            $table->string('render_context')->default('frontend')->after('status');
            $table->string('template')->default('default')->after('render_context');

            $table->json('blocks')->nullable()->after('content');
            $table->json('seo')->nullable()->after('blocks');
            $table->json('access')->nullable()->after('seo');

            $table->timestamp('published_at')->nullable()->after('access');
            $table->foreignId('created_by')->nullable()->after('published_at')->constrained('users')->nullOnDelete();
        });

        Schema::table('site_pages', function (Blueprint $table) {
            $table->longText('content')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('site_pages', function (Blueprint $table) {
            $table->dropConstrainedForeignId('created_by');
            $table->dropColumn([
                'page_type',
                'status',
                'render_context',
                'template',
                'blocks',
                'seo',
                'access',
                'published_at',
            ]);
        });

        Schema::table('site_pages', function (Blueprint $table) {
            $table->longText('content')->nullable(false)->change();
        });
    }
};
