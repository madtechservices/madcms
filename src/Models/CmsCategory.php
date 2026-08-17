<?php

namespace MadTechServices\MadCms\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CmsCategory extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'description',
        'parent_id',
        'order',
        'seo',
        'access',
    ];

    protected $casts = [
        'seo' => 'array',
        'access' => 'array',
    ];

    public function getTable(): string
    {
        return (string) config('madcms.tables.categories', parent::getTable());
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(static::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(static::class, 'parent_id')->orderBy('order');
    }

    public function pages(): BelongsToMany
    {
        return $this->belongsToMany(
            (string) config('madcms.models.page'),
            (string) config('madcms.tables.category_page'),
        );
    }
}
