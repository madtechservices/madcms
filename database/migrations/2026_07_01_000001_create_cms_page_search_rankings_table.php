<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_page_search_rankings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_page_id')->constrained('site_pages')->cascadeOnDelete();
            $table->string('keyword');
            $table->decimal('position', 8, 2)->nullable();
            $table->unsignedInteger('clicks')->nullable();
            $table->unsignedInteger('impressions')->nullable();
            $table->decimal('ctr', 8, 4)->nullable();
            $table->string('engine', 80)->default('Google');
            $table->string('source', 120)->default('google_search_console');
            $table->string('url', 2048)->nullable();
            $table->timestamp('checked_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['site_page_id', 'checked_at']);
            $table->index(['site_page_id', 'keyword']);
            $table->index(['engine', 'source']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_page_search_rankings');
    }
};