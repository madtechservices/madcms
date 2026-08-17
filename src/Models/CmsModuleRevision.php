<?php

namespace MadTechServices\MadCms\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CmsModuleRevision extends Model
{
    protected $fillable = [
        'cms_module_id',
        'user_id',
        'name',
        'type',
        'content',
        'style',
        'settings',
        'advanced_classes',
        'custom_css',
        'note',
    ];

    protected $casts = [
        'content' => 'array',
        'style' => 'array',
        'settings' => 'array',
    ];

    public function getTable(): string
    {
        return (string) config('madcms.tables.module_revisions', parent::getTable());
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo((string) config('madcms.models.module'), 'cms_module_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo((string) config('madcms.models.user'));
    }
}
