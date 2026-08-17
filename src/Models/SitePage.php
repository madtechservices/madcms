<?php

namespace MadTechServices\MadCms\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class SitePage extends Model
{
    public const STATUS_DRAFT = 'draft';

    public const STATUS_SCHEDULED = 'scheduled';

    public const STATUS_PUBLISHED = 'published';

    public const STATUS_UNPUBLISHED = 'unpublished';

    public const STATUS_ARCHIVED = 'archived';

    public static array $statuses = [
        self::STATUS_DRAFT,
        self::STATUS_SCHEDULED,
        self::STATUS_PUBLISHED,
        self::STATUS_UNPUBLISHED,
        self::STATUS_ARCHIVED,
    ];

    protected $fillable = [
        'parent_id',
        'slug',
        'page_type',
        'status',
        'render_context',
        'template',
        'title',
        'subtitle',
        'excerpt',
        'featured_image',
        'content',
        'blocks',
        'seo',
        'access',
        'tags',
        'sort_order',
        'published_at',
        'unpublished_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'blocks' => 'array',
        'seo' => 'array',
        'access' => 'array',
        'tags' => 'array',
        'published_at' => 'datetime',
        'unpublished_at' => 'datetime',
    ];

    public function getTable(): string
    {
        return (string) config('madcms.tables.pages', parent::getTable());
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(static::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(static::class, 'parent_id')->orderBy('sort_order');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(
            (string) config('madcms.models.category'),
            (string) config('madcms.tables.category_page'),
        );
    }

    public function revisions(): HasMany
    {
        return $this->hasMany((string) config('madcms.models.page_revision'))->latest();
    }

    public function layouts(): HasMany
    {
        return $this->hasMany((string) config('madcms.models.layout'));
    }

    public function searchRankings(): HasMany
    {
        return $this->hasMany((string) config('madcms.models.search_ranking'));
    }

    public function publishedLayout(): HasOne
    {
        return $this->hasOne((string) config('madcms.models.layout'))->where('status', 'published');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo((string) config('madcms.models.user'), 'created_by');
    }

    public function editor(): BelongsTo
    {
        return $this->belongsTo((string) config('madcms.models.user'), 'updated_by');
    }

    public function scopePublic(Builder $query): Builder
    {
        $now = now();

        return $query->where('status', self::STATUS_PUBLISHED)
            ->where(function (Builder $query) use ($now): void {
                $query->whereNull('published_at')->orWhere('published_at', '<=', $now);
            })
            ->where(function (Builder $query) use ($now): void {
                $query->whereNull('unpublished_at')->orWhere('unpublished_at', '>', $now);
            });
    }

    public function scopeStatus(Builder $query, ?string $status): Builder
    {
        return $status ? $query->where('status', $status) : $query;
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (! $term) {
            return $query;
        }

        return $query->where(function (Builder $query) use ($term): void {
            $query->where('title', 'like', "%{$term}%")
                ->orWhere('slug', 'like', "%{$term}%")
                ->orWhere('excerpt', 'like', "%{$term}%");
        });
    }

    public function getEffectiveStatusAttribute(): string
    {
        if ($this->status === self::STATUS_PUBLISHED && $this->published_at && $this->published_at->isFuture()) {
            return self::STATUS_SCHEDULED;
        }

        if ($this->status === self::STATUS_PUBLISHED && $this->unpublished_at && $this->unpublished_at->isPast()) {
            return self::STATUS_UNPUBLISHED;
        }

        return $this->status ?? self::STATUS_DRAFT;
    }

    public function getPathAttribute(): string
    {
        if ($this->slug === 'home' && $this->parent_id === null) {
            return '/';
        }

        $segments = [];
        $node = $this;
        $guard = 0;

        while ($node && $guard < 10) {
            array_unshift($segments, $node->slug);
            $node = $node->parent;
            $guard++;
        }

        return '/'.implode('/', array_filter($segments));
    }
}
