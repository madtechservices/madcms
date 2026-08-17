<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_page_revisions', function (Blueprint $table) {
            if (!Schema::hasColumn('site_page_revisions', 'builder_layout')) {
                $table->json('builder_layout')->nullable()->after('seo');
            }
        });
    }

    public function down(): void
    {
        Schema::table('site_page_revisions', function (Blueprint $table) {
            if (Schema::hasColumn('site_page_revisions', 'builder_layout')) {
                $table->dropColumn('builder_layout');
            }
        });
    }
};
