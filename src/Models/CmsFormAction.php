<?php

namespace MadTechServices\MadCms\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CmsFormAction extends Model
{
    protected $fillable = [
        'cms_form_id',
        'type',
        'enabled',
        'config',
        'order',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'config' => 'array',
    ];

    public function getTable(): string
    {
        return (string) config('madcms.tables.form_actions', parent::getTable());
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo((string) config('madcms.models.form'), 'cms_form_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany((string) config('madcms.models.form_action_log'), 'cms_form_action_id');
    }
}
