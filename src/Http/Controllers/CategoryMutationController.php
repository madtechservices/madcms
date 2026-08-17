<?php

namespace MadTechServices\MadCms\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use MadTechServices\MadCms\Contracts\AccessManager;
use MadTechServices\MadCms\Models\CmsCategory;

class CategoryMutationController
{
    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?? Str::slug($data['title']));
        $categoryModel = (string) config('madcms.models.category');
        $categoryModel::create($data);

        return back()->with('success', 'Category created.');
    }

    public function update(Request $request, CmsCategory $category, AccessManager $access)
    {
        abort_unless($access->allows($request->user(), $category->access), 403);

        $data = $this->validated($request);
        $data['slug'] = $this->uniqueSlug(
            (string) (($data['slug'] ?? null) ?: Str::slug($data['title'])),
            $category->id,
        );
        $category->update($data);

        return back()->with('success', 'Category saved.');
    }

    public function destroy(Request $request, CmsCategory $category, AccessManager $access)
    {
        abort_unless($access->allows($request->user(), $category->access), 403);

        $category->delete();

        return back()->with('success', 'Category deleted.');
    }

    public function reorder(Request $request, AccessManager $access)
    {
        $data = $request->validate([
            'items' => ['nullable', 'array'],
            'items.*.id' => ['required', 'integer'],
            'items.*.order' => ['nullable', 'integer'],
            'items.*.parent_id' => ['nullable', 'integer'],
        ]);
        $categoryModel = (string) config('madcms.models.category');

        foreach ($data['items'] ?? [] as $item) {
            $category = $categoryModel::query()->find($item['id']);
            if (! $category || ! $access->allows($request->user(), $category->access)) {
                continue;
            }

            $category->update([
                'order' => $item['order'] ?? 0,
                'parent_id' => $item['parent_id'] ?? null,
            ]);
        }

        return response()->noContent();
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'parent_id' => ['nullable', 'integer', Rule::exists(config('madcms.tables.categories'), 'id')],
            'slug' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'order' => ['nullable', 'integer'],
            'seo' => ['nullable', 'array'],
            'access' => ['nullable', 'array'],
            'access.roles' => ['nullable', 'array'],
            'access.roles.*' => ['nullable', 'string', Rule::exists(config('madcms.access.roles_table'), 'name')],
        ]);
    }

    private function uniqueSlug(string $slug, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug) ?: 'category';
        $candidate = $base;
        $suffix = 2;
        $categoryModel = (string) config('madcms.models.category');

        while ($categoryModel::query()->where('slug', $candidate)->when(
            $ignoreId,
            fn ($query) => $query->where('id', '!=', $ignoreId),
        )->exists()) {
            $candidate = $base.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }
}
