<?php

namespace MadTechServices\MadCms\Support;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use MadTechServices\MadCms\Contracts\PageDefinitionManager;
use MadTechServices\MadCms\Models\SitePage;
use MadTechServices\MadCms\Models\SitePageRevision;

class CmsPageDefinitionManager implements PageDefinitionManager
{
    public function validationRules(): array
    {
        $pageModel = (string) config('madcms.models.page');

        return [
            'parent_id' => ['nullable', 'integer', Rule::exists(config('madcms.tables.pages'), 'id')],
            'slug' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string'],
            'featured_image' => ['nullable', 'string', 'max:2048'],
            'content' => ['nullable', 'string'],
            'blocks' => ['nullable', 'array'],
            'seo' => ['nullable', 'array'],
            'access' => ['nullable', 'array'],
            'access.roles' => ['nullable', 'array'],
            'access.roles.*' => ['nullable', 'string', 'max:100'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['nullable', 'string', 'max:64'],
            'template' => ['nullable', 'string', 'max:64'],
            'render_context' => ['nullable', 'string', 'max:64'],
            'page_type' => ['nullable', 'string', 'max:64'],
            'status' => ['nullable', 'string', Rule::in($pageModel::$statuses)],
            'published_at' => ['nullable', 'date'],
            'unpublished_at' => ['nullable', 'date'],
            'sort_order' => ['nullable', 'integer'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', Rule::exists(config('madcms.tables.categories'), 'id')],
            'builder_layout' => ['nullable', 'array'],
            'revision_note' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function create(array $data, array $layout, ?array $categoryIds = null, ?int $userId = null): SitePage
    {
        return DB::transaction(function () use ($data, $layout, $categoryIds, $userId): SitePage {
            $note = (string) ($data['revision_note'] ?? 'Created');
            $pageData = Arr::except($data, ['builder_layout', 'category_ids', 'revision_note']);
            $pageData['slug'] = $this->uniqueSlug((string) (($pageData['slug'] ?? null) ?: ($pageData['title'] ?? 'page')));
            $pageData['created_by'] = $userId;
            $pageData['updated_by'] = $userId;
            $pageModel = (string) config('madcms.models.page');
            $page = $pageModel::create($pageData);

            $this->saveLayout($page, $layout, $userId);
            if ($categoryIds !== null) {
                $page->categories()->sync($categoryIds);
            }
            $this->snapshot($page, $userId, $note ?: 'Created');

            return $page->refresh();
        });
    }

    public function update(SitePage $page, array $data, ?array $layout = null, ?array $categoryIds = null, ?int $userId = null): SitePage
    {
        return DB::transaction(function () use ($page, $data, $layout, $categoryIds, $userId): SitePage {
            $note = (string) ($data['revision_note'] ?? 'Updated');
            $pageData = Arr::except($data, ['builder_layout', 'category_ids', 'revision_note']);
            $pageData['slug'] = $this->uniqueSlug((string) (($pageData['slug'] ?? null) ?: ($pageData['title'] ?? $page->title)), $page->id);
            $pageData['updated_by'] = $userId;
            $page->update($pageData);

            if ($layout !== null) {
                $this->saveLayout($page, $layout, $userId);
            }
            if ($categoryIds !== null) {
                $page->categories()->sync($categoryIds);
            }
            $this->snapshot($page, $userId, $note ?: 'Updated');

            return $page->refresh();
        });
    }

    public function duplicate(SitePage $page, ?int $userId = null): SitePage
    {
        return DB::transaction(function () use ($page, $userId): SitePage {
            $copy = $page->replicate(['created_at', 'updated_at']);
            $copy->title = $page->title.' (copy)';
            $copy->slug = $this->uniqueSlug($page->slug.'-copy');
            $copy->status = SitePage::STATUS_DRAFT;
            $copy->published_at = null;
            $copy->unpublished_at = null;
            $copy->created_by = $userId;
            $copy->updated_by = $userId;
            $copy->save();
            $copy->categories()->sync($page->categories()->allRelatedIds());

            $layoutModel = (string) config('madcms.models.layout');
            $page->layouts()->get()->each(fn ($layout) => $layoutModel::create([
                'site_page_id' => $copy->id,
                'status' => $layout->status,
                'layout' => $layout->layout,
                'created_by' => $userId,
                'updated_by' => $userId,
            ]));
            $this->snapshot($copy, $userId, 'Duplicated');

            return $copy->refresh();
        });
    }

    public function restore(SitePage $page, SitePageRevision $revision, ?int $userId = null): SitePage
    {
        return DB::transaction(function () use ($page, $revision, $userId): SitePage {
            $page->update([
                'title' => $revision->title,
                'subtitle' => $revision->subtitle,
                'excerpt' => $revision->excerpt,
                'content' => $revision->content,
                'blocks' => $revision->blocks,
                'seo' => $revision->seo,
                'updated_by' => $userId,
            ]);
            if ($revision->builder_layout !== null) {
                $this->saveLayout($page, $revision->builder_layout, $userId);
            }
            $this->snapshot($page, $userId, 'Restored from revision #'.$revision->id);

            return $page->refresh();
        });
    }

    public function transition(SitePage $page, array $attributes, string $note, ?int $userId = null): SitePage
    {
        return DB::transaction(function () use ($page, $attributes, $note, $userId): SitePage {
            $page->update(array_replace($attributes, ['updated_by' => $userId]));
            $this->snapshot($page, $userId, $note);

            return $page->refresh();
        });
    }

    public function snapshot(SitePage $page, ?int $userId, string $note): void
    {
        $page->unsetRelation('publishedLayout')->load('publishedLayout');
        $revisionModel = (string) config('madcms.models.page_revision');
        $revisionModel::create([
            'site_page_id' => $page->id,
            'user_id' => $userId,
            'title' => $page->title,
            'subtitle' => $page->subtitle,
            'excerpt' => $page->excerpt,
            'content' => $page->content,
            'blocks' => $page->blocks,
            'seo' => $page->seo,
            'builder_layout' => $page->publishedLayout?->layout,
            'status' => $page->status,
            'note' => $note,
        ]);
    }

    private function saveLayout(SitePage $page, array $layout, ?int $userId): void
    {
        $layoutModel = (string) config('madcms.models.layout');
        $layoutModel::updateOrCreate(
            ['site_page_id' => $page->id, 'status' => 'published'],
            ['layout' => $layout, 'created_by' => $page->created_by ?: $userId, 'updated_by' => $userId],
        );
        $page->unsetRelation('publishedLayout');
    }

    private function uniqueSlug(string $slug, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug) ?: 'page';
        $candidate = $base;
        $suffix = 2;
        $pageModel = (string) config('madcms.models.page');

        while ($pageModel::query()->where('slug', $candidate)->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))->exists()) {
            $candidate = "{$base}-{$suffix}";
            $suffix++;
        }

        return $candidate;
    }
}
