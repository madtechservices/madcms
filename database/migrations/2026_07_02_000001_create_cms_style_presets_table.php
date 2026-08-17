<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_style_presets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('target', 40);
            $table->json('style');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['target', 'created_by']);
            $table->unique(['target', 'created_by', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_style_presets');
    }
};