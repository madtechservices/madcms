<?php

namespace MadTechServices\MadCms\Support;

use Illuminate\Database\Eloquent\Builder;
use MadTechServices\MadCms\Contracts\AccessManager;
use MadTechServices\MadCms\Models\SitePage;

class CmsAccessManager implements AccessManager
{
    public function rolesFrom(?array $access): array
    {
        return collect($access['roles'] ?? [])
            ->filter(fn ($role) => is_string($role) && $role !== '')
            ->values()
            ->all();
    }

    public function allows(?object $user, ?array $access): bool
    {
        $roles = $this->rolesFrom($access);

        if ($roles === []) {
            return true;
        }

        if (! $user) {
            return false;
        }

        if ($this->hasRole($user, (string) config('madcms.access.admin_role', 'admin'))) {
            return true;
        }

        return method_exists($user, 'hasAnyRole') && $user->hasAnyRole($roles);
    }

    public function applyVisibleTo(Builder $query, ?object $user): Builder
    {
        if ($user && $this->hasRole($user, (string) config('madcms.access.admin_role', 'admin'))) {
            return $query;
        }

        $roles = $this->roleNames($user);

        return $query->where(function (Builder $visible) use ($roles): void {
            $visible->whereNull('access')
                ->orWhereJsonLength('access->roles', 0);

            foreach ($roles as $role) {
                $visible->orWhereJsonContains('access->roles', $role);
            }
        });
    }

    public function applyPagesVisibleTo(Builder $query, ?object $user): Builder
    {
        $this->applyVisibleTo($query, $user);

        if ($user && $this->hasRole($user, (string) config('madcms.access.admin_role', 'admin'))) {
            return $query;
        }

        $roles = $this->roleNames($user);

        return $query->whereDoesntHave('categories', function (Builder $categoryQuery) use ($roles): void {
            $categoryQuery->where(function (Builder $blocked) use ($roles): void {
                $blocked->whereJsonLength('access->roles', '>', 0);

                foreach ($roles as $role) {
                    $blocked->whereJsonDoesntContain('access->roles', $role);
                }
            });
        });
    }

    public function allowsPage(?object $user, SitePage $page): bool
    {
        if (! $this->allows($user, $page->access)) {
            return false;
        }

        $page->loadMissing('categories');

        return $page->categories->every(fn ($category) => $this->allows($user, $category->access));
    }

    private function hasRole(object $user, string $role): bool
    {
        return method_exists($user, 'hasRole') && $user->hasRole($role);
    }

    private function roleNames(?object $user): array
    {
        if (! $user || ! method_exists($user, 'getRoleNames')) {
            return [];
        }

        return collect($user->getRoleNames())->filter()->values()->all();
    }
}
