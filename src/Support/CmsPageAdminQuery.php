<?php

namespace MadTechServices\MadCms\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use MadTechServices\MadCms\Contracts\AccessManager;
use MadTechServices\MadCms\Contracts\CategoryAdminQuery;
use MadTechServices\MadCms\Contracts\PageAdminQuery;
use MadTechServices\MadCms\Contracts\PageLayoutInspector;

class CmsPageAdminQuery implements PageAdminQuery
{
    public function __construct(
        private readonly AccessManager $access,
        private readonly CategoryAdminQuery $categories,
        private readonly PageLayoutInspector $layouts,
    ) {}

    public function paginate(array $filters = [], ?object $user = null, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->visibleQuery($user);
        $builderFilter = (string) ($filters['builder'] ?? '');

        if (in_array($builderFilter, ['enabled', 'staged', 'staged-reviewed', 'staged-unreviewed', 'empty'], true)) {
            $ids = $this->visibleQuery($user)->get()->filter(
                fn (Model $page): bool => $this->layouts->filterMatches($page->publishedLayout?->layout, $builderFilter),
            )->pluck('id');
            $query->whereIn('id', $ids);
        }

        $pages = $query
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['q'] ?? null, fn (Builder $query, string $term) => $query->where(function (Builder $search) use ($term): void {
                $search->where('title', 'like', "%{$term}%")
                    ->orWhere('slug', 'like', "%{$term}%")
                    ->orWhere('excerpt', 'like', "%{$term}%");
            }))
            ->orderBy('sort_order')
            ->orderBy('title')
            ->paginate(max(1, min(100, $perPage)))
            ->withQueryString();

        $pages->getCollection()->transform(function (Model $page): Model {
            $layout = $page->publishedLayout?->layout;
            $review = $this->layouts->review($layout);
            $page->setAttribute('builder_status', $this->layouts->status($layout));
            $page->setAttribute('builder_module_count', $this->layouts->moduleCount($layout));
            $page->setAttribute('builder_reviewed_at', $review['reviewed_at'] ?? null);
            $page->setAttribute('builder_reviewed_by', $review['reviewed_by_name'] ?? null);
            $page->setAttribute('builder_publish_issue_count', count($this->layouts->publishIssues($layout)));

            return $page;
        });

        return $pages;
    }

    public function summary(?object $user = null): array
    {
        return $this->layouts->summary($this->visibleQuery($user)->get());
    }

    public function createData(?object $user = null): array
    {
        $pageModel = (string) config('madcms.models.page');

        return array_merge($this->editorOptions($user), [
            'page' => [
                'title' => '',
                'subtitle' => '',
                'slug' => '',
                'excerpt' => '',
                'content' => '',
                'status' => $pageModel::STATUS_DRAFT,
                'template' => 'builder',
                'page_type' => 'page',
                'category_ids' => [],
                'seo' => [],
            ],
            'builder_layout' => ['version' => 1, 'enabled' => false, 'sections' => []],
            'revisions' => [],
        ]);
    }

    public function editorData(Model $page, ?object $user = null): array
    {
        abort_unless($this->access->allowsPage($user, $page), 403);

        $page->load(['categories:id', 'revisions.user:id,name', 'publishedLayout']);

        return array_merge($this->editorOptions($user, $page), [
            'page' => array_merge($page->toArray(), [
                'category_ids' => $page->categories->pluck('id')->all(),
                'effective_status' => $page->effective_status,
                'path' => $page->path,
            ]),
            'builder_layout' => $page->publishedLayout?->layout,
            'revisions' => $page->revisions->map(fn (Model $revision): array => [
                'id' => $revision->id,
                'title' => $revision->title,
                'status' => $revision->status,
                'note' => $revision->note,
                'has_builder_layout' => $revision->builder_layout !== null,
                'user' => $revision->user?->only(['id', 'name']),
                'created_at' => $revision->created_at,
            ]),
        ]);
    }

    private function editorOptions(?object $user, ?Model $page = null): array
    {
        $pageModel = (string) config('madcms.models.page');
        $moduleModel = (string) config('madcms.models.module');
        $formModel = (string) config('madcms.models.form');
        $parents = $this->visibleQuery($user);
        if ($page?->getKey()) {
            $parents->whereKeyNot($page->getKey());
        }

        return [
            'modules' => $moduleModel::query()->where('status', 'active')->orderBy('category')->orderBy('name')->get([
                'id', 'name', 'slug', 'type', 'category', 'content', 'style', 'settings', 'advanced_classes', 'custom_css',
            ]),
            'forms' => $formModel::query()->with('fields')->where('status', 'active')->orderBy('name')->get([
                'id', 'name', 'slug', 'submit_label', 'success_message', 'style',
            ]),
            'categories' => $this->categories->visibleTo($user),
            'parents' => $parents->orderBy('title')->get(['id', 'title', 'slug', 'parent_id']),
            'statuses' => $pageModel::$statuses,
        ];
    }

    private function visibleQuery(?object $user): Builder
    {
        $pageModel = (string) config('madcms.models.page');

        return $this->access->applyPagesVisibleTo($pageModel::query(), $user)
            ->with(['parent:id,title,slug,parent_id', 'categories:id,title', 'publishedLayout:id,site_page_id,status,layout']);
    }
}
