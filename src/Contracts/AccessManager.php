<?php

namespace MadTechServices\MadCms\Contracts;

use Illuminate\Database\Eloquent\Builder;
use MadTechServices\MadCms\Models\SitePage;

interface AccessManager
{
    public function rolesFrom(?array $access): array;

    public function allows(?object $user, ?array $access): bool;

    public function applyVisibleTo(Builder $query, ?object $user): Builder;

    public function applyPagesVisibleTo(Builder $query, ?object $user): Builder;

    public function allowsPage(?object $user, SitePage $page): bool;
}
