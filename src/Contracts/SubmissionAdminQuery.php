<?php

namespace MadTechServices\MadCms\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

interface SubmissionAdminQuery
{
    public function query(array $filters = []): Builder;

    public function paginate(array $filters = [], int $perPage = 50): LengthAwarePaginator;

    public function all(array $filters = []): Collection;

    public function forms(): Collection;

    public function find(int|string $submission): Model;
}
