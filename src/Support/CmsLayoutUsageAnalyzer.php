<?php

namespace MadTechServices\MadCms\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use MadTechServices\MadCms\Contracts\LayoutUsageAnalyzer;

class CmsLayoutUsageAnalyzer implements LayoutUsageAnalyzer
{
    public function usageByModule(array $moduleIds): array
    {
        return $this->usageByIds($moduleIds, fn (array $layout) => $this->linkedModuleIds($layout));
    }

    public function enabledPagesUsingModule(int $moduleId): Collection
    {
        return $this->enabledPagesUsing($moduleId, fn (array $layout) => $this->linkedModuleIds($layout));
    }

    public function usageByForm(array $formIds): array
    {
        return $this->usageByIds($formIds, fn (array $layout) => $this->formIds($layout));
    }

    public function enabledPagesUsingForm(int $formId): Collection
    {
        return $this->enabledPagesUsing($formId, fn (array $layout) => $this->formIds($layout));
    }

    public function linkedModuleIds(array $layout): array
    {
        return $this->placements($layout)
            ->filter(fn ($placement) => is_array($placement) && ($placement['mode'] ?? 'linked') !== 'detached')
            ->pluck('module_id')
            ->filter()
            ->map(fn ($moduleId) => (int) $moduleId)
            ->unique()
            ->values()
            ->all();
    }

    public function formIds(array $layout): array
    {
        $placements = $this->placements($layout)
            ->filter(fn ($placement) => is_array($placement) && ($placement['module_type'] ?? null) === 'form-embed');

        $moduleIds = $placements
            ->filter(fn ($placement) => ($placement['mode'] ?? 'linked') !== 'detached')
            ->pluck('module_id')
            ->filter()
            ->map(fn ($moduleId) => (int) $moduleId)
            ->unique()
            ->values();

        $moduleModel = $this->model('module');
        $modules = $moduleIds->isEmpty()
            ? collect()
            : $moduleModel::query()->whereIn('id', $moduleIds)->get(['id', 'content'])->keyBy('id');

        return $placements
            ->map(function (array $placement) use ($modules) {
                if (($placement['mode'] ?? null) === 'detached') {
                    return $placement['detached_content']['form_id'] ?? null;
                }

                return $placement['content_overrides']['form_id']
                    ?? $modules->get($placement['module_id'] ?? null)?->content['form_id']
                    ?? null;
            })
            ->filter()
            ->map(fn ($formId) => (int) $formId)
            ->unique()
            ->values()
            ->all();
    }

    private function usageByIds(array $ids, callable $idsInLayout): array
    {
        $ids = collect($ids)->map(fn ($id) => (int) $id)->unique()->values()->all();

        if ($ids === []) {
            return [];
        }

        $idLookup = array_flip($ids);
        $usage = [];

        $this->publishedLayouts()->each(function (Model $layout) use (&$usage, $idLookup, $idsInLayout) {
            foreach ($idsInLayout($layout->layout ?? []) as $id) {
                if (! isset($idLookup[$id]) || ! $layout->page) {
                    continue;
                }

                $usage[$id] ??= collect();
                $usage[$id]->push([
                    'id' => $layout->page->id,
                    'title' => $layout->page->title,
                    'path' => $layout->page->path,
                ]);
            }
        });

        foreach ($usage as $id => $pages) {
            $usage[$id] = $pages->unique('id')->values();
        }

        return $usage;
    }

    private function enabledPagesUsing(int $id, callable $idsInLayout): Collection
    {
        return $this->publishedLayouts()
            ->filter(fn (Model $layout) => ($layout->layout['enabled'] ?? true) !== false)
            ->filter(fn (Model $layout) => in_array($id, $idsInLayout($layout->layout ?? []), true))
            ->pluck('page')
            ->filter()
            ->unique('id')
            ->values();
    }

    private function publishedLayouts(): Collection
    {
        $layoutModel = $this->model('layout');

        return $layoutModel::query()
            ->with('page:id,title,slug,parent_id')
            ->where('status', 'published')
            ->get();
    }

    private function placements(array $layout): Collection
    {
        return collect($layout['sections'] ?? [])
            ->flatMap(fn ($section) => is_array($section) ? ($section['rows'] ?? []) : [])
            ->flatMap(fn ($row) => is_array($row) ? ($row['columns'] ?? []) : [])
            ->flatMap(fn ($column) => is_array($column) ? ($column['modules'] ?? []) : []);
    }

    /** @return class-string<Model> */
    private function model(string $key): string
    {
        return (string) config("madcms.models.{$key}");
    }
}
