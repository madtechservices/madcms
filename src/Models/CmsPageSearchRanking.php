<?php

namespace MadTechServices\MadCms\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CmsPageSearchRanking extends Model
{
    protected $fillable = [
        'site_page_id',
        'keyword',
        'position',
        'clicks',
        'impressions',
        'ctr',
        'engine',
        'source',
        'url',
        'checked_at',
        'metadata',
    ];

    protected $casts = [
        'position' => 'decimal:2',
        'clicks' => 'integer',
        'impressions' => 'integer',
        'ctr' => 'decimal:4',
        'checked_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function getTable(): string
    {
        return (string) config('madcms.tables.search_rankings', parent::getTable());
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo((string) config('madcms.models.page'), 'site_page_id');
    }
}
