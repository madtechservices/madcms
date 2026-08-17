<?php

namespace MadTechServices\MadCms\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

interface ModuleAdminQuery
{
    public function paginate(array $filters = [], int $perPage = 30): LengthAwarePaginator;

    public function activeForms(): Collection;

    public function editorData(Model $module): array;
}
