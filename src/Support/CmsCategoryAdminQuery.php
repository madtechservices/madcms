<?php

namespace MadTechServices\MadCms\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use MadTechServices\MadCms\Contracts\AccessManager;
use MadTechServices\MadCms\Contracts\CategoryAdminQuery;

class CmsCategoryAdminQuery implements CategoryAdminQuery
{
    public function __construct(private readonly AccessManager $access) {}

    public function visibleTo(?object $user): Collection
    {
        $categoryModel = $this->model('category');

        return $this->access->applyVisibleTo($categoryModel::query(), $user)
            ->with('parent:id,title')
            ->orderBy('order')
            ->orderBy('title')
            ->get();
    }

    /** @return class-string<Model> */
    private function model(string $key): string
    {
        return (string) config("madcms.models.{$key}");
    }
}
