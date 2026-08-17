<?php

namespace MadTechServices\MadCms\Contracts;

interface PagePublishingPolicy
{
    public function prepareForCreate(array $layout, ?object $user = null): array;

    public function prepareForUpdate(?array $existingLayout, array $layout, ?object $user = null): array;

    public function markReviewed(array $layout, ?object $user = null, ?string $note = null): array;

    public function enableReviewed(array $layout, ?object $user = null): array;

    public function assertPublishable(array $layout): void;
}
