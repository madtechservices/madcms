<?php

namespace MadTechServices\MadCms\Contracts;

use MadTechServices\MadCms\Models\SitePage;
use MadTechServices\MadCms\Models\SitePageRevision;

interface PageDefinitionManager
{
    public function validationRules(): array;

    public function create(array $data, array $layout, ?array $categoryIds = null, ?int $userId = null): SitePage;

    public function update(SitePage $page, array $data, ?array $layout = null, ?array $categoryIds = null, ?int $userId = null): SitePage;

    public function duplicate(SitePage $page, ?int $userId = null): SitePage;

    public function restore(SitePage $page, SitePageRevision $revision, ?int $userId = null): SitePage;

    public function transition(SitePage $page, array $attributes, string $note, ?int $userId = null): SitePage;

    public function snapshot(SitePage $page, ?int $userId, string $note): void;
}
