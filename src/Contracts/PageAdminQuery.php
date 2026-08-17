<?php

namespace MadTechServices\MadCms\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

interface PageAdminQuery
{
    public function paginate(array $filters = [], ?object $user = null, int $perPage = 20): LengthAwarePaginator;

    public function summary(?object $user = null): array;

    public function createData(?object $user = null): array;

    public function editorData(Model $page, ?object $user = null): array;
}
