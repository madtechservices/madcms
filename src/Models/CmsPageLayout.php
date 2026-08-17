<?php

namespace MadTechServices\MadCms\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CmsPageLayout extends Model
{
    protected $fillable = [
        'site_page_id',
        'status',
        'layout',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'layout' => 'array',
    ];

    public function getTable(): string
    {
        return (string) config('madcms.tables.layouts', parent::getTable());
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo((string) config('madcms.models.page'), 'site_page_id');
    }
}
