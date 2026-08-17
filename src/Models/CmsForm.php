<?php

namespace MadTechServices\MadCms\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class CmsForm extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'status',
        'submit_label',
        'success_message',
        'spam_settings',
        'style',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'spam_settings' => 'array',
        'style' => 'array',
    ];

    protected static function booted(): void
    {
        static::saving(function (CmsForm $form): void {
            if (! $form->slug) {
                $form->slug = Str::slug($form->name);
            }
        });
    }

    public function getTable(): string
    {
        return (string) config('madcms.tables.forms', parent::getTable());
    }

    public function fields(): HasMany
    {
        return $this->hasMany((string) config('madcms.models.form_field'))->orderBy('order');
    }

    public function actions(): HasMany
    {
        return $this->hasMany((string) config('madcms.models.form_action'))->orderBy('order');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany((string) config('madcms.models.form_submission'));
    }
}
