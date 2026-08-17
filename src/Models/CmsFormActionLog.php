<?php

namespace MadTechServices\MadCms\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CmsFormActionLog extends Model
{
    protected $fillable = [
        'cms_form_id',
        'cms_form_action_id',
        'cms_form_submission_id',
        'type',
        'status',
        'message',
        'context',
    ];

    protected $casts = [
        'context' => 'array',
    ];

    public function getTable(): string
    {
        return (string) config('madcms.tables.form_action_logs', parent::getTable());
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo((string) config('madcms.models.form'), 'cms_form_id');
    }

    public function action(): BelongsTo
    {
        return $this->belongsTo((string) config('madcms.models.form_action'), 'cms_form_action_id');
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo((string) config('madcms.models.form_submission'), 'cms_form_submission_id');
    }
}
