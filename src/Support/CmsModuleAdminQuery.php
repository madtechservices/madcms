<?php

namespace MadTechServices\MadCms\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use MadTechServices\MadCms\Contracts\LayoutUsageAnalyzer;
use MadTechServices\MadCms\Contracts\ModuleAdminQuery;

class CmsModuleAdminQuery implements ModuleAdminQuery
{
    public function __construct(private readonly LayoutUsageAnalyzer $usage) {}

    public function paginate(array $filters = [], int $perPage = 30): LengthAwarePaginator
    {
        $moduleModel = $this->model('module');
        $modules = $moduleModel::query()
            ->when($filters['q'] ?? null, fn (Builder $query, string $term) => $query->where(
                fn (Builder $search) => $search
                    ->where('name', 'like', "%{$term}%")
                    ->orWhere('slug', 'like', "%{$term}%"),
            ))
            ->when($filters['type'] ?? null, fn (Builder $query, string $type) => $query->where('type', $type))
            ->orderBy('category')
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        $moduleIds = $modules->getCollection()->pluck('id')->all();
        $usage = $this->usage->usageByModule($moduleIds);
        $revisionModel = $this->model('module_revision');
        $revisions = $revisionModel::query()
            ->with('user:id,name')
            ->whereIn('cms_module_id', $moduleIds)
            ->latest()
            ->get()
            ->groupBy('cms_module_id');

        $modules->getCollection()->transform(function (Model $module) use ($usage, $revisions) {
            $pages = $usage[$module->id] ?? collect();

            $module->setAttribute('usage_count', $pages->count());
            $module->setAttribute('usage_pages', $pages->take(8)->values()->all());
            $module->setAttribute('usage_more_count', max(0, $pages->count() - 8));
            $module->setAttribute('revisions', ($revisions[$module->id] ?? collect())->take(10)->map(fn (Model $revision) => [
                'id' => $revision->id,
                'note' => $revision->note,
                'name' => $revision->name,
                'type' => $revision->type,
                'user' => $revision->user?->only(['id', 'name']),
                'created_at' => $revision->created_at,
            ])->values()->all());

            return $module;
        });

        return $modules;
    }

    public function activeForms(): Collection
    {
        $formModel = $this->model('form');

        return $formModel::query()
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'submit_label', 'success_message', 'style']);
    }

    public function editorData(Model $module): array
    {
        $module->load(['revisions' => fn ($query) => $query->with('user:id,name')->latest()->limit(20)]);
        $pages = $this->usage->usageByModule([$module->getKey()])[$module->getKey()] ?? collect();

        return [
            'module' => array_merge($module->toArray(), [
                'usage_count' => $pages->count(),
                'usage_pages' => $pages->values()->all(),
            ]),
            'forms' => $this->activeForms(),
        ];
    }

    /** @return class-string<Model> */
    private function model(string $key): string
    {
        return (string) config("madcms.models.{$key}");
    }
}
