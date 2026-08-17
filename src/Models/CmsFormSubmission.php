<?php

namespace MadTechServices\MadCms\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CmsFormSubmission extends Model
{
    protected $fillable = [
        'cms_form_id',
        'site_page_id',
        'payload',
        'metadata',
        'status',
    ];

    protected $casts = [
        'payload' => 'array',
        'metadata' => 'array',
    ];

    public function getTable(): string
    {
        return (string) config('madcms.tables.form_submissions', parent::getTable());
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo((string) config('madcms.models.form'), 'cms_form_id');
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo((string) config('madcms.models.page'), 'site_page_id');
    }

    public function actionLogs(): HasMany
    {
        return $this->hasMany((string) config('madcms.models.form_action_log'), 'cms_form_submission_id')->latest();
    }
}
