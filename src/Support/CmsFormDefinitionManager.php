<?php

namespace MadTechServices\MadCms\Support;

use Illuminate\Support\Str;
use MadTechServices\MadCms\Contracts\FormDefinitionManager;
use MadTechServices\MadCms\Models\CmsForm;

class CmsFormDefinitionManager implements FormDefinitionManager
{
    public function validationRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', 'string', 'in:active,draft,archived'],
            'submit_label' => ['required', 'string', 'max:120'],
            'success_message' => ['nullable', 'string', 'max:1000'],
            'spam_settings' => ['nullable', 'array'],
            'style' => ['nullable', 'array'],
            'fields' => ['nullable', 'array'],
            'fields.*.type' => ['required_with:fields', 'string', 'max:50'],
            'fields.*.label' => ['required_with:fields', 'string', 'max:255'],
            'fields.*.name' => ['required_with:fields', 'string', 'max:100'],
            'fields.*.placeholder' => ['nullable', 'string', 'max:255'],
            'fields.*.help_text' => ['nullable', 'string', 'max:1000'],
            'fields.*.required' => ['nullable', 'boolean'],
            'fields.*.validation_rules' => ['nullable', 'array'],
            'fields.*.options' => ['nullable', 'array'],
            'fields.*.layout' => ['nullable', 'array'],
            'actions' => ['nullable', 'array'],
            'actions.*.type' => ['required_with:actions', 'string', 'max:60'],
            'actions.*.enabled' => ['nullable', 'boolean'],
            'actions.*.config' => ['nullable', 'array'],
        ];
    }

    public function create(array $data, ?int $userId = null): CmsForm
    {
        [$attributes, $fields, $actions] = $this->split($data);
        $attributes['slug'] = $this->uniqueSlug((string) (($attributes['slug'] ?? null) ?: $attributes['name']));
        $attributes['created_by'] = $userId;
        $attributes['updated_by'] = $userId;

        $formModel = (string) config('madcms.models.form');
        $form = $formModel::create($attributes);
        $this->syncChildren($form, $fields, $actions);

        return $form;
    }

    public function update(CmsForm $form, array $data, ?int $userId = null): CmsForm
    {
        [$attributes, $fields, $actions] = $this->split($data);
        $attributes['slug'] = $this->uniqueSlug((string) (($attributes['slug'] ?? null) ?: $attributes['name']), $form->id);
        $attributes['updated_by'] = $userId;

        $form->update($attributes);
        $this->syncChildren($form, $fields, $actions);

        return $form->refresh();
    }

    public function duplicate(CmsForm $form, ?int $userId = null): CmsForm
    {
        $form->loadMissing(['fields', 'actions']);

        $copy = $form->replicate(['created_at', 'updated_at']);
        $copy->name = $form->name.' (copy)';
        $copy->slug = $this->uniqueSlug($form->slug.'-copy');
        $copy->status = 'draft';
        $copy->created_by = $userId;
        $copy->updated_by = $userId;
        $copy->save();

        $this->syncChildren(
            $copy,
            $form->fields->map(fn ($field): array => $field->only($this->fieldAttributes()))->all(),
            $form->actions->map(fn ($action): array => $action->only($this->actionAttributes()))->all(),
        );

        return $copy->refresh();
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array{0: array<string, mixed>, 1: array<int, array<string, mixed>>, 2: array<int, array<string, mixed>>}
     */
    private function split(array $data): array
    {
        $fields = is_array($data['fields'] ?? null) ? $data['fields'] : [];
        $actions = is_array($data['actions'] ?? null) ? $data['actions'] : [];
        unset($data['fields'], $data['actions']);

        return [$data, $fields, $actions];
    }

    /**
     * @param  array<int, array<string, mixed>>  $fields
     * @param  array<int, array<string, mixed>>  $actions
     */
    private function syncChildren(CmsForm $form, array $fields, array $actions): void
    {
        $form->fields()->delete();
        foreach ($fields as $index => $field) {
            $form->fields()->create([
                'type' => $field['type'],
                'label' => $field['label'],
                'name' => Str::slug((string) $field['name'], '_'),
                'placeholder' => $field['placeholder'] ?? null,
                'help_text' => $field['help_text'] ?? null,
                'required' => (bool) ($field['required'] ?? false),
                'validation_rules' => $field['validation_rules'] ?? null,
                'options' => $field['options'] ?? null,
                'layout' => $field['layout'] ?? null,
                'order' => $index,
            ]);
        }

        $form->actions()->delete();
        foreach ($actions as $index => $action) {
            $form->actions()->create([
                'type' => $action['type'],
                'enabled' => (bool) ($action['enabled'] ?? true),
                'config' => $action['config'] ?? null,
                'order' => $index,
            ]);
        }
    }

    private function uniqueSlug(string $slug, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug) ?: 'form';
        $candidate = $base;
        $suffix = 2;
        $formModel = (string) config('madcms.models.form');

        while ($formModel::where('slug', $candidate)->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))->exists()) {
            $candidate = "{$base}-{$suffix}";
            $suffix++;
        }

        return $candidate;
    }

    /** @return list<string> */
    private function fieldAttributes(): array
    {
        return ['type', 'label', 'name', 'placeholder', 'help_text', 'required', 'validation_rules', 'options', 'layout', 'order'];
    }

    /** @return list<string> */
    private function actionAttributes(): array
    {
        return ['type', 'enabled', 'config', 'order'];
    }
}
