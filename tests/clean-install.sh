#!/usr/bin/env bash
set -euo pipefail

package_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
repository_type="${MADCMS_COMPOSER_REPOSITORY_TYPE:-path}"
repository_path="${MADCMS_COMPOSER_REPOSITORY_PATH:-$package_dir}"
package_constraint="${MADCMS_COMPOSER_CONSTRAINT:-@dev}"
fixture_dir=""
if (( $# > 0 )); then
    versions=("$@")
else
    versions=(11 12 13)
fi

cleanup() {
    if [[ -n "$fixture_dir" && -d "$fixture_dir" ]]; then
        rm -rf "$fixture_dir"
    fi
}
trap cleanup EXIT

for version in "${versions[@]}"; do
        fixture_dir="$(mktemp -d "/tmp/madcms-laravel-${version}-XXXXXX")"
        echo "Testing MAD CMS against Laravel ${version}..."

        composer create-project "laravel/laravel:^${version}.0" "$fixture_dir" \
            --no-interaction --prefer-dist --no-install --no-scripts --quiet

        if [[ "$version" == "11" ]]; then
            composer --working-dir="$fixture_dir" config audit.block-insecure false
        fi

        composer --working-dir="$fixture_dir" install --no-interaction --prefer-dist --no-progress --quiet
        if [[ "$repository_type" != "packagist" ]]; then
            composer --working-dir="$fixture_dir" config repositories.madcms "$repository_type" "$repository_path"
        fi
        composer --working-dir="$fixture_dir" require "madtechservices/madcms:${package_constraint}" \
            --no-interaction --with-all-dependencies --no-progress --quiet
        composer --working-dir="$fixture_dir" require inertiajs/inertia-laravel:^2.0 \
            --no-interaction --with-all-dependencies --no-progress --quiet

        touch "$fixture_dir/database/database.sqlite"
        export APP_ENV=testing
        export MADCMS_MODE=package
        export MADCMS_REGISTER_ADMIN_API=true
        export MADCMS_REGISTER_ADMIN_MUTATIONS=true
        export MADCMS_REGISTER_ADMIN_PRESENTATION=true
        export DB_CONNECTION=sqlite
        export DB_DATABASE="$fixture_dir/database/database.sqlite"

        php "$fixture_dir/artisan" madcms:install --admin-ui --force --no-interaction >/dev/null
        php "$fixture_dir/artisan" migrate:fresh --force --no-interaction >/dev/null
        php "$fixture_dir/artisan" madcms:status --json >/dev/null
        php "$fixture_dir/artisan" route:list --name=forms.submit --json \
            | php -r '$routes = json_decode(stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR); exit(count($routes) === 1 && $routes[0]["method"] === "POST" ? 0 : 1);'
        php "$fixture_dir/artisan" route:list --name=cms.modules.index --json \
            | php -r '$routes = json_decode(stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR); exit(count($routes) === 1 && $routes[0]["method"] === "GET|HEAD" ? 0 : 1);'
        php "$fixture_dir/artisan" route:list --name=cms.pages.store --json \
            | php -r '$routes = json_decode(stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR); exit(count($routes) === 1 && $routes[0]["method"] === "POST" ? 0 : 1);'
        php "$fixture_dir/artisan" route:list --name=madcms.ui.pages --json \
            | php -r '$routes = array_values(array_filter(json_decode(stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR), fn ($route) => $route["name"] === "madcms.ui.pages")); exit(count($routes) === 1 && $routes[0]["uri"] === "madcms/pages" ? 0 : 1);'
        php "$fixture_dir/artisan" route:list --name=madcms.ui.pages.create --json \
            | php -r '$routes = array_values(array_filter(json_decode(stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR), fn ($route) => $route["name"] === "madcms.ui.pages.create")); exit(count($routes) === 1 && $routes[0]["uri"] === "madcms/pages/create" ? 0 : 1);'
        php "$fixture_dir/artisan" route:list --name=madcms.ui.modules.create --json \
            | php -r '$routes = array_values(array_filter(json_decode(stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR), fn ($route) => $route["name"] === "madcms.ui.modules.create")); exit(count($routes) === 1 && $routes[0]["uri"] === "madcms/modules/create" ? 0 : 1);'
        php "$fixture_dir/artisan" route:list --name=madcms.ui.forms.create --json \
            | php -r '$routes = array_values(array_filter(json_decode(stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR), fn ($route) => $route["name"] === "madcms.ui.forms.create")); exit(count($routes) === 1 && $routes[0]["uri"] === "madcms/forms/create" ? 0 : 1);'
        php "$fixture_dir/artisan" route:list --name=madcms.ui.submissions.show --json \
            | php -r '$routes = array_values(array_filter(json_decode(stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR), fn ($route) => $route["name"] === "madcms.ui.submissions.show")); exit(count($routes) === 1 && $routes[0]["uri"] === "madcms/submissions/{submission}" ? 0 : 1);'

        test -f "$fixture_dir/resources/js/vendor/madcms/index.ts"
        test -f "$fixture_dir/resources/js/vendor/madcms/advanced-style-fields.tsx"
        test -f "$fixture_dir/resources/js/vendor/madcms/admin-shell.tsx"
        test -f "$fixture_dir/resources/js/vendor/madcms/admin-collections.tsx"
        test -f "$fixture_dir/resources/js/vendor/madcms/admin-page-editor.tsx"
        test -f "$fixture_dir/resources/js/vendor/madcms/admin-module-editor.tsx"
        test -f "$fixture_dir/resources/js/vendor/madcms/admin-form-editor.tsx"
        test -f "$fixture_dir/resources/js/vendor/madcms/admin-category-manager.tsx"
        test -f "$fixture_dir/resources/js/vendor/madcms/admin-submission-detail.tsx"
        test -f "$fixture_dir/resources/js/pages/MadCms/Pages.tsx"
        test -f "$fixture_dir/resources/js/pages/MadCms/PageEdit.tsx"
        test -f "$fixture_dir/resources/js/pages/MadCms/ModuleEdit.tsx"
        test -f "$fixture_dir/resources/js/pages/MadCms/FormEdit.tsx"
        test -f "$fixture_dir/resources/js/pages/MadCms/SubmissionShow.tsx"
        test -f "$fixture_dir/resources/js/pages/MadCms/Categories.tsx"
        test -f "$fixture_dir/resources/js/vendor/madcms/editor-fields.tsx"
        test -f "$fixture_dir/resources/js/vendor/madcms/layout-style-fields.tsx"
        test -f "$fixture_dir/resources/js/vendor/madcms/responsive-style-controls.tsx"

        framework_version="$(php "$fixture_dir/artisan" --version)"
        echo "MAD CMS clean install passed on ${framework_version}."

        rm -rf "$fixture_dir"
        fixture_dir=""
done
