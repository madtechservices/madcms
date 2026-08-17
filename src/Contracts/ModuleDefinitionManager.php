<?php

namespace MadTechServices\MadCms\Contracts;

use MadTechServices\MadCms\Models\CmsModule;
use MadTechServices\MadCms\Models\CmsModuleRevision;

interface ModuleDefinitionManager
{
    /** @return array<string, array<int, string>> */
    public function validationRules(): array;

    /** @param array<string, mixed> $data */
    public function create(array $data, ?int $userId = null): CmsModule;

    /** @param array<string, mixed> $data */
    public function update(CmsModule $module, array $data, ?int $userId = null): CmsModule;

    public function duplicate(CmsModule $module, ?int $userId = null): CmsModule;

    public function restore(CmsModule $module, CmsModuleRevision $revision, ?int $userId = null): CmsModule;
}
