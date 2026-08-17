<?php

namespace MadTechServices\MadCms\Contracts;

use Illuminate\Support\Collection;

interface PageLayoutInspector
{
    public function status(?array $layout): string;

    public function moduleCount(?array $layout): int;

    public function review(?array $layout): array;

    public function filterMatches(?array $layout, string $filter): bool;

    public function publishIssues(?array $layout): array;

    public function summary(Collection $pages): array;

    public function placements(?array $layout): Collection;
}
