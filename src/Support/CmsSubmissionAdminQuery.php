<?php

namespace MadTechServices\MadCms\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use MadTechServices\MadCms\Contracts\SubmissionAdminQuery;

class CmsSubmissionAdminQuery implements SubmissionAdminQuery
{
    public function query(array $filters = []): Builder
    {
        $submissionModel = $this->model('form_submission');

        return $submissionModel::query()
            ->with(['form:id,name,slug', 'page:id,title,slug', 'actionLogs'])
            ->when($filters['form_id'] ?? null, fn (Builder $query, $formId) => $query->where('cms_form_id', $formId))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['q'] ?? null, fn (Builder $query, string $term) => $query->where(
                fn (Builder $search) => $search
                    ->where('payload', 'like', "%{$term}%")
                    ->orWhere('metadata', 'like', "%{$term}%"),
            ))
            ->latest();
    }

    public function paginate(array $filters = [], int $perPage = 50): LengthAwarePaginator
    {
        return $this->query($filters)->paginate($perPage)->withQueryString();
    }

    public function all(array $filters = []): Collection
    {
        return $this->query($filters)->get();
    }

    public function forms(): Collection
    {
        $formModel = $this->model('form');

        return $formModel::query()->orderBy('name')->get(['id', 'name', 'slug']);
    }

    public function find(int|string $submission): Model
    {
        $submissionModel = $this->model('form_submission');

        return $submissionModel::query()
            ->with(['form:id,name,slug', 'page:id,title,slug', 'actionLogs.action'])
            ->findOrFail($submission);
    }

    /** @return class-string<Model> */
    private function model(string $key): string
    {
        return (string) config("madcms.models.{$key}");
    }
}
