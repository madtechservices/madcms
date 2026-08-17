<?php

namespace MadTechServices\MadCms\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SitePageRevision extends Model
{
    protected $fillable = [
        'site_page_id',
        'user_id',
        'title',
        'subtitle',
        'excerpt',
        'content',
        'blocks',
        'seo',
        'builder_layout',
        'status',
        'note',
    ];

    protected $casts = [
        'blocks' => 'array',
        'seo' => 'array',
        'builder_layout' => 'array',
    ];

    public function getTable(): string
    {
        return (string) config('madcms.tables.page_revisions', parent::getTable());
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo((string) config('madcms.models.page'), 'site_page_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo((string) config('madcms.models.user'), 'user_id');
    }
}
