<?php

namespace MadTechServices\MadCms\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

interface FormAdminQuery
{
    public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    public function editorData(Model $form): array;
}
