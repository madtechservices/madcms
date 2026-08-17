<?php

namespace MadTechServices\MadCms\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class CmsModule extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'type',
        'category',
        'status',
        'content',
        'style',
        'settings',
        'advanced_classes',
        'custom_css',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'content' => 'array',
        'style' => 'array',
        'settings' => 'array',
    ];

    protected static function booted(): void
    {
        static::saving(function (CmsModule $module): void {
            if (! $module->slug) {
                $module->slug = Str::slug($module->name);
            }
        });
    }

    public function getTable(): string
    {
        return (string) config('madcms.tables.modules', parent::getTable());
    }

    public function revisions(): HasMany
    {
        return $this->hasMany((string) config('madcms.models.module_revision'));
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo((string) config('madcms.models.user'), 'created_by');
    }

    public function editor(): BelongsTo
    {
        return $this->belongsTo((string) config('madcms.models.user'), 'updated_by');
    }
}
