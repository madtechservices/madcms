<?php

namespace MadTechServices\MadCms\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use MadTechServices\MadCms\Contracts\FormAdminQuery;
use MadTechServices\MadCms\Contracts\LayoutUsageAnalyzer;

class CmsFormAdminQuery implements FormAdminQuery
{
    public function __construct(private readonly LayoutUsageAnalyzer $usage) {}

    public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $formModel = $this->model('form');
        $forms = $formModel::query()
            ->withCount('submissions')
            ->with(['fields', 'actions'])
            ->when($filters['q'] ?? null, fn (Builder $query, string $term) => $query->where(
                fn (Builder $search) => $search
                    ->where('name', 'like', "%{$term}%")
                    ->orWhere('slug', 'like', "%{$term}%"),
            ))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        $formIds = $forms->getCollection()->pluck('id')->all();
        $usage = $this->usage->usageByForm($formIds);

        $forms->getCollection()->transform(function (Model $form) use ($usage) {
            $pages = $usage[$form->id] ?? collect();

            $form->setAttribute('usage_count', $pages->count());
            $form->setAttribute('usage_pages', $pages->take(8)->values()->all());
            $form->setAttribute('usage_more_count', max(0, $pages->count() - 8));

            return $form;
        });

        return $forms;
    }

    public function editorData(Model $form): array
    {
        $form->load(['fields', 'actions'])->loadCount('submissions');
        $pages = $this->usage->usageByForm([$form->getKey()])[$form->getKey()] ?? collect();

        return [
            'form' => array_merge($form->toArray(), [
                'usage_count' => $pages->count(),
                'usage_pages' => $pages->values()->all(),
            ]),
        ];
    }

    /** @return class-string<Model> */
    private function model(string $key): string
    {
        return (string) config("madcms.models.{$key}");
    }
}
