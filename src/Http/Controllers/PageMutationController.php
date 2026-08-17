<?php

namespace MadTechServices\MadCms\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use MadTechServices\MadCms\Contracts\AccessManager;
use MadTechServices\MadCms\Contracts\PageDefinitionManager;
use MadTechServices\MadCms\Contracts\PagePublishingPolicy;
use Symfony\Component\HttpFoundation\Response;

class PageMutationController
{
    public function store(Request $request, PageDefinitionManager $pages, PagePublishingPolicy $publishing): Response
    {
        $data = $request->validate($pages->validationRules());
        $layout = $publishing->prepareForCreate(
            $data['builder_layout'] ?? ['version' => 1, 'enabled' => false, 'sections' => []],
            $request->user(),
        );
        $page = $pages->create($data, $layout, $data['category_ids'] ?? null, $request->user()?->id);

        if (! $request->expectsJson() && config('madcms.routes.register_admin_presentation', false)) {
            $route = config('madcms.routes.presentation_name_prefix', 'madcms.ui.').'pages.edit';
            if (app('router')->has($route)) {
                return redirect()->route($route, $page)->with('success', 'Page created.');
            }
        }

        return $this->result($request, 'Page created.', ['page' => $page], 201);
    }

    public function update(Request $request, int|string $page, PageDefinitionManager $pages, PagePublishingPolicy $publishing, AccessManager $access): Response
    {
        $record = $this->page($page);
        abort_unless($access->allowsPage($request->user(), $record), 403);
        $data = $request->validate($pages->validationRules());
        $layout = null;
        if ($request->has('builder_layout')) {
            $record->loadMissing('publishedLayout');
            $layout = $publishing->prepareForUpdate($record->publishedLayout?->layout, $data['builder_layout'], $request->user());
        }
        $record = $pages->update($record, $data, $layout, $request->has('category_ids') ? $data['category_ids'] ?? [] : null, $request->user()?->id);

        return $this->result($request, 'Page saved.', ['page' => $record]);
    }

    public function duplicate(Request $request, int|string $page, PageDefinitionManager $pages, AccessManager $access): Response
    {
        $record = $this->page($page);
        abort_unless($access->allowsPage($request->user(), $record), 403);
        $copy = $pages->duplicate($record, $request->user()?->id);

        return $this->result($request, 'Page duplicated.', ['page' => $copy], 201);
    }

    public function destroy(Request $request, int|string $page, AccessManager $access): Response
    {
        $record = $this->page($page);
        abort_unless($access->allowsPage($request->user(), $record), 403);
        $record->delete();

        return $this->result($request, 'Page deleted.');
    }

    public function publish(Request $request, int|string $page, PageDefinitionManager $pages, AccessManager $access): Response
    {
        $record = $this->page($page);
        abort_unless($access->allowsPage($request->user(), $record), 403);
        $record = $pages->transition($record, ['status' => 'published', 'published_at' => $request->date('published_at') ?? now()], 'Published', $request->user()?->id);

        return $this->result($request, 'Page published.', ['page' => $record]);
    }

    public function unpublish(Request $request, int|string $page, PageDefinitionManager $pages, AccessManager $access): Response
    {
        $record = $this->page($page);
        abort_unless($access->allowsPage($request->user(), $record), 403);
        $record = $pages->transition($record, ['status' => 'unpublished', 'unpublished_at' => now()], 'Unpublished', $request->user()?->id);

        return $this->result($request, 'Page unpublished.', ['page' => $record]);
    }

    public function archive(Request $request, int|string $page, PageDefinitionManager $pages, AccessManager $access): Response
    {
        $record = $this->page($page);
        abort_unless($access->allowsPage($request->user(), $record), 403);
        $record = $pages->transition($record, ['status' => 'archived'], 'Archived', $request->user()?->id);

        return $this->result($request, 'Page archived.', ['page' => $record]);
    }

    public function restoreRevision(Request $request, int|string $page, int|string $revision, PageDefinitionManager $pages, AccessManager $access): Response
    {
        $record = $this->page($page);
        abort_unless($access->allowsPage($request->user(), $record), 403);
        $revisionModel = (string) config('madcms.models.page_revision');
        $snapshot = $revisionModel::query()->findOrFail($revision);
        abort_unless($snapshot->site_page_id === $record->id, 404);
        $record = $pages->restore($record, $snapshot, $request->user()?->id);

        return $this->result($request, 'Revision restored.', ['page' => $record]);
    }

    public function markReviewed(Request $request, int|string $page, PagePublishingPolicy $publishing, AccessManager $access): Response
    {
        $record = $this->page($page);
        abort_unless($access->allowsPage($request->user(), $record), 403);
        $data = $request->validate(['note' => ['nullable', 'string', 'max:240']]);
        $layout = $this->layout($record);
        $layout->update(['layout' => $publishing->markReviewed($layout->layout ?: [], $request->user(), $data['note'] ?? null), 'updated_by' => $request->user()?->id]);

        return $this->result($request, 'Builder layout marked reviewed.');
    }

    public function enableReviewed(Request $request, int|string $page, PageDefinitionManager $pages, PagePublishingPolicy $publishing, AccessManager $access): Response
    {
        $record = $this->page($page);
        abort_unless($access->allowsPage($request->user(), $record), 403);
        $layout = $this->layout($record);
        $layout->update(['layout' => $publishing->enableReviewed($layout->layout ?: [], $request->user()), 'updated_by' => $request->user()?->id]);
        $pages->snapshot($record, $request->user()?->id, 'Enabled reviewed public builder layout');

        return $this->result($request, 'Reviewed builder layout enabled publicly.');
    }

    private function page(int|string $id)
    {
        $pageModel = (string) config('madcms.models.page');

        return $pageModel::query()->findOrFail($id);
    }

    private function layout($page)
    {
        $layoutModel = (string) config('madcms.models.layout');

        return $layoutModel::query()->where('site_page_id', $page->id)->where('status', 'published')->firstOrFail();
    }

    private function result(Request $request, string $message, array $data = [], int $status = 200): Response
    {
        if ($request->expectsJson()) {
            return new JsonResponse(array_merge(['message' => $message], $data), $status);
        }

        return back()->with('success', $message);
    }
}
