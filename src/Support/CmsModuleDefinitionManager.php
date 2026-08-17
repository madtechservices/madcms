<?php

namespace MadTechServices\MadCms\Support;

use Illuminate\Support\Str;
use MadTechServices\MadCms\Contracts\ModuleDefinitionManager;
use MadTechServices\MadCms\Models\CmsModule;
use MadTechServices\MadCms\Models\CmsModuleRevision;

class CmsModuleDefinitionManager implements ModuleDefinitionManager
{
    public function validationRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:80'],
            'category' => ['required', 'string', 'max:80'],
            'status' => ['required', 'string', 'in:active,draft,archived'],
            'content' => ['nullable', 'array'],
            'style' => ['nullable', 'array'],
            'settings' => ['nullable', 'array'],
            'advanced_classes' => ['nullable', 'string', 'max:2000'],
            'custom_css' => ['nullable', 'string', 'max:10000'],
            'revision_note' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function create(array $data, ?int $userId = null): CmsModule
    {
        $note = (string) ($data['revision_note'] ?? 'Created');
        unset($data['revision_note']);
        $data['slug'] = $this->uniqueSlug((string) (($data['slug'] ?? null) ?: $data['name']));
        $data['created_by'] = $userId;
        $data['updated_by'] = $userId;

        $moduleModel = (string) config('madcms.models.module');
        $module = $moduleModel::create($data);
        $this->snapshot($module, $userId, $note ?: 'Created');

        return $module;
    }

    public function update(CmsModule $module, array $data, ?int $userId = null): CmsModule
    {
        $note = (string) ($data['revision_note'] ?? 'Updated');
        unset($data['revision_note']);
        $data['slug'] = $this->uniqueSlug((string) (($data['slug'] ?? null) ?: $data['name']), $module->id);
        $data['updated_by'] = $userId;

        $module->update($data);
        $this->snapshot($module, $userId, $note ?: 'Updated');

        return $module->refresh();
    }

    public function duplicate(CmsModule $module, ?int $userId = null): CmsModule
    {
        $copy = $module->replicate(['created_at', 'updated_at']);
        $copy->name = $module->name.' (copy)';
        $copy->slug = $this->uniqueSlug($module->slug.'-copy');
        $copy->created_by = $userId;
        $copy->updated_by = $userId;
        $copy->save();

        $this->snapshot($copy, $userId, 'Duplicated');

        return $copy->refresh();
    }

    public function restore(CmsModule $module, CmsModuleRevision $revision, ?int $userId = null): CmsModule
    {
        $module->update([
            'name' => $revision->name,
            'type' => $revision->type,
            'content' => $revision->content,
            'style' => $revision->style,
            'settings' => $revision->settings,
            'advanced_classes' => $revision->advanced_classes,
            'custom_css' => $revision->custom_css,
            'updated_by' => $userId,
        ]);

        $this->snapshot($module, $userId, 'Restored from revision #'.$revision->id);

        return $module->refresh();
    }

    private function uniqueSlug(string $slug, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug) ?: 'module';
        $candidate = $base;
        $suffix = 2;
        $moduleModel = (string) config('madcms.models.module');

        while ($moduleModel::where('slug', $candidate)->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))->exists()) {
            $candidate = "{$base}-{$suffix}";
            $suffix++;
        }

        return $candidate;
    }

    private function snapshot(CmsModule $module, ?int $userId, string $note): void
    {
        $revisionModel = (string) config('madcms.models.module_revision');
        $revisionModel::create([
            'cms_module_id' => $module->id,
            'user_id' => $userId,
            'name' => $module->name,
            'type' => $module->type,
            'content' => $module->content,
            'style' => $module->style,
            'settings' => $module->settings,
            'advanced_classes' => $module->advanced_classes,
            'custom_css' => $module->custom_css,
            'note' => $note,
        ]);
    }
}
