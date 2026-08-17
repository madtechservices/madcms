<?php

namespace MadTechServices\MadCms\Contracts;

use Illuminate\Support\Collection;

interface LayoutUsageAnalyzer
{
    /** @return array<int, Collection<int, array{id: int, title: string, path: string}>> */
    public function usageByModule(array $moduleIds): array;

    /** @return Collection<int, object> */
    public function enabledPagesUsingModule(int $moduleId): Collection;

    /** @return array<int, Collection<int, array{id: int, title: string, path: string}>> */
    public function usageByForm(array $formIds): array;

    /** @return Collection<int, object> */
    public function enabledPagesUsingForm(int $formId): Collection;

    /** @return array<int, int> */
    public function linkedModuleIds(array $layout): array;

    /** @return array<int, int> */
    public function formIds(array $layout): array;
}
