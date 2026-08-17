<?php

namespace MadTechServices\MadCms\Support;

use Illuminate\Support\Collection;
use MadTechServices\MadCms\Contracts\PageLayoutInspector;

class CmsPageLayoutInspector implements PageLayoutInspector
{
    public function status(?array $layout): string
    {
        $sections = $layout['sections'] ?? [];

        if (! is_array($sections) || $sections === []) {
            return 'empty';
        }

        return ($layout['enabled'] ?? true) === false ? 'staged' : 'enabled';
    }

    public function moduleCount(?array $layout): int
    {
        return $this->placements($layout)->count();
    }

    public function review(?array $layout): array
    {
        return is_array($layout['review'] ?? null) ? $layout['review'] : [];
    }

    public function filterMatches(?array $layout, string $filter): bool
    {
        $status = $this->status($layout);

        if (in_array($filter, ['enabled', 'staged', 'empty'], true)) {
            return $status === $filter;
        }

        if ($status !== 'staged') {
            return false;
        }

        $reviewed = ($this->review($layout)['status'] ?? null) === 'reviewed';

        return match ($filter) {
            'staged-reviewed' => $reviewed,
            'staged-unreviewed' => ! $reviewed,
            default => false,
        };
    }

    public function publishIssues(?array $layout): array
    {
        $placements = $this->placements($layout);
        $issues = [];
        $sections = collect($layout['sections'] ?? []);
        $visible = $placements->reject(fn (array $placement): bool => (bool) ($placement['hidden'] ?? false));

        if ($sections->isEmpty()) {
            $issues[] = 'The builder layout has no sections.';
        } elseif ($visible->isEmpty()) {
            $issues[] = 'The builder layout has no visible components.';
        }

        $duplicates = $placements->pluck('id')
            ->filter(fn ($id): bool => is_string($id) || is_numeric($id))
            ->map(fn ($id): string => trim((string) $id))
            ->filter()
            ->countBy()
            ->filter(fn (int $count): bool => $count > 1)
            ->keys();

        if ($duplicates->isNotEmpty()) {
            $issues[] = 'Component IDs are duplicated: '.$duplicates->join(', ');
        }

        $moduleIds = $placements
            ->filter(fn (array $placement): bool => ($placement['mode'] ?? 'linked') !== 'detached')
            ->pluck('module_id')->filter()->unique()->values();
        $moduleModel = (string) config('madcms.models.module');
        $modules = $moduleModel::query()->whereIn('id', $moduleIds)->where('status', 'active')->get(['id', 'content'])->keyBy('id');
        $missingModules = $moduleIds->diff($modules->keys())->values();

        if ($missingModules->isNotEmpty()) {
            $issues[] = 'Linked module IDs are missing or inactive: '.$missingModules->join(', ');
        }

        $formIds = $placements
            ->filter(fn (array $placement): bool => ($placement['module_type'] ?? null) === 'form-embed')
            ->map(function (array $placement) use ($modules) {
                if (($placement['mode'] ?? null) === 'detached') {
                    return $placement['detached_content']['form_id'] ?? null;
                }

                return $placement['content_overrides']['form_id']
                    ?? $modules->get($placement['module_id'] ?? null)?->content['form_id']
                    ?? null;
            })->filter()->unique()->values();
        $formModel = (string) config('madcms.models.form');
        $foundForms = $formModel::query()->whereIn('id', $formIds)->where('status', 'active')->pluck('id');
        $missingForms = $formIds->diff($foundForms)->values();

        if ($missingForms->isNotEmpty()) {
            $issues[] = 'Form IDs are missing or inactive: '.$missingForms->join(', ');
        }

        return $issues;
    }

    public function summary(Collection $pages): array
    {
        $summary = ['enabled' => 0, 'staged' => 0, 'staged_reviewed' => 0, 'staged_unreviewed' => 0, 'empty' => 0, 'modules' => 0];

        foreach ($pages as $page) {
            $layout = $page->publishedLayout?->layout;
            $status = $this->status($layout);
            $summary[$status]++;
            if ($status === 'staged') {
                $reviewed = ($this->review($layout)['status'] ?? null) === 'reviewed';
                $summary[$reviewed ? 'staged_reviewed' : 'staged_unreviewed']++;
            }
            $summary['modules'] += $this->moduleCount($layout);
        }

        $summary['total'] = $pages->count();

        return $summary;
    }

    public function placements(?array $layout): Collection
    {
        return collect($layout['sections'] ?? [])
            ->flatMap(fn ($section) => $section['rows'] ?? [])
            ->flatMap(fn ($row) => $row['columns'] ?? [])
            ->flatMap(fn ($column) => $column['modules'] ?? [])
            ->filter(fn ($placement): bool => is_array($placement));
    }
}
