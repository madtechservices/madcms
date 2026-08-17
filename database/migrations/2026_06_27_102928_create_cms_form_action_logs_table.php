<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cms_form_action_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cms_form_id')->constrained('cms_forms')->cascadeOnDelete();
            $table->foreignId('cms_form_action_id')->nullable()->constrained('cms_form_actions')->nullOnDelete();
            $table->foreignId('cms_form_submission_id')->nullable()->constrained('cms_form_submissions')->cascadeOnDelete();
            $table->string('type', 60);
            $table->string('status', 40);
            $table->text('message')->nullable();
            $table->json('context')->nullable();
            $table->timestamps();

            $table->index(['cms_form_id', 'type', 'status']);
            $table->index(['cms_form_submission_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_form_action_logs');
    }
};
