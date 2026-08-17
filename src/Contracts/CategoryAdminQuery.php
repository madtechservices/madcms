<?php

namespace MadTechServices\MadCms\Contracts;

use Illuminate\Support\Collection;

interface CategoryAdminQuery
{
    public function visibleTo(?object $user): Collection;
}
