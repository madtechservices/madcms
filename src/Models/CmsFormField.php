<?php

namespace MadTechServices\MadCms\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CmsFormField extends Model
{
    protected $fillable = [
        'cms_form_id',
        'type',
        'label',
        'name',
        'placeholder',
        'help_text',
        'required',
        'validation_rules',
        'options',
        'layout',
        'order',
    ];

    protected $casts = [
        'required' => 'boolean',
        'validation_rules' => 'array',
        'options' => 'array',
        'layout' => 'array',
    ];

    public function getTable(): string
    {
        return (string) config('madcms.tables.form_fields', parent::getTable());
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo((string) config('madcms.models.form'), 'cms_form_id');
    }
}
