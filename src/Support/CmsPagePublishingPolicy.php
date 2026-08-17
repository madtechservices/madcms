<?php

namespace MadTechServices\MadCms\Support;

use Illuminate\Validation\ValidationException;
use MadTechServices\MadCms\Contracts\PageLayoutInspector;
use MadTechServices\MadCms\Contracts\PagePublishingPolicy;

class CmsPagePublishingPolicy implements PagePublishingPolicy
{
    public function __construct(private readonly PageLayoutInspector $layouts) {}

    public function prepareForCreate(array $layout, ?object $user = null): array
    {
        unset($layout['review']);
        $this->assertPublishable($layout);

        return $layout;
    }

    public function prepareForUpdate(?array $existingLayout, array $layout, ?object $user = null): array
    {
        $existingLayout ??= [];
        $existingReview = $this->layouts->review($existingLayout);
        $existingIsStaged = $this->layouts->status($existingLayout) === 'staged';
        $newIsEnabled = ($layout['enabled'] ?? true) !== false;
        $contentChanged = $this->comparable($existingLayout) !== $this->comparable($layout);
        unset($layout['review']);

        if ($existingIsStaged && $newIsEnabled) {
            if (($existingReview['status'] ?? null) !== 'reviewed') {
                $this->fail('Review the staged builder layout before enabling it publicly.');
            }
            if ($contentChanged) {
                $this->fail('The builder layout changed after review. Save it as staged and review it again before enabling.');
            }
            $this->fail('Enable reviewed staged layouts from the review preview or page review queue.');
        }

        if (! $newIsEnabled && ($existingReview['status'] ?? null) === 'reviewed' && ($contentChanged || ! $existingIsStaged)) {
            $layout['review'] = [
                'status' => 'unreviewed',
                'invalidated_at' => now()->toDateTimeString(),
                'invalidated_by' => $user?->id,
                'invalidated_by_name' => $user?->name,
            ];
        } elseif ($existingReview !== []) {
            $layout['review'] = $existingReview;
        }

        $this->assertPublishable($layout);

        return $layout;
    }

    public function markReviewed(array $layout, ?object $user = null, ?string $note = null): array
    {
        if ($this->layouts->status($layout) !== 'staged') {
            abort(422, 'Only staged builder layouts can be marked reviewed.');
        }

        $layout['review'] = [
            'status' => 'reviewed',
            'reviewed_at' => now()->toDateTimeString(),
            'reviewed_by' => $user?->id,
            'reviewed_by_name' => $user?->name,
            'note' => $note,
        ];

        return $layout;
    }

    public function enableReviewed(array $layout, ?object $user = null): array
    {
        if ($this->layouts->status($layout) !== 'staged') {
            abort(422, 'Only staged builder layouts can be enabled from review.');
        }
        if (($this->layouts->review($layout)['status'] ?? null) !== 'reviewed') {
            abort(422, 'Review the staged builder layout before enabling it publicly.');
        }

        $layout['enabled'] = true;
        $layout['review']['enabled_at'] = now()->toDateTimeString();
        $layout['review']['enabled_by'] = $user?->id;
        $layout['review']['enabled_by_name'] = $user?->name;
        $this->assertPublishable($layout);

        return $layout;
    }

    public function assertPublishable(array $layout): void
    {
        if (($layout['enabled'] ?? true) === false) {
            return;
        }

        $issues = $this->layouts->publishIssues($layout);
        if ($issues !== []) {
            $this->fail('Public builder layout cannot be enabled because '.lcfirst($issues[0]));
        }
    }

    private function comparable(array $layout): array
    {
        unset($layout['review'], $layout['enabled']);

        return $layout;
    }

    private function fail(string $message): never
    {
        throw ValidationException::withMessages(['builder_layout' => $message]);
    }
}
