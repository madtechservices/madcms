<?php

namespace MadTechServices\MadCms\Contracts;

use MadTechServices\MadCms\Models\CmsForm;

interface FormDefinitionManager
{
    /** @return array<string, array<int, string>> */
    public function validationRules(): array;

    /** @param array<string, mixed> $data */
    public function create(array $data, ?int $userId = null): CmsForm;

    /** @param array<string, mixed> $data */
    public function update(CmsForm $form, array $data, ?int $userId = null): CmsForm;

    public function duplicate(CmsForm $form, ?int $userId = null): CmsForm;
}
