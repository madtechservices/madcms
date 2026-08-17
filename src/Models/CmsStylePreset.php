<?php

namespace MadTechServices\MadCms\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CmsStylePreset extends Model
{
    protected $fillable = [
        'name',
        'target',
        'style',
        'created_by',
    ];

    protected $casts = [
        'style' => 'array',
    ];

    public function getTable(): string
    {
        return (string) config('madcms.tables.style_presets', parent::getTable());
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo((string) config('madcms.models.user'), 'created_by');
    }
}
