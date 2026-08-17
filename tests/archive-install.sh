#!/usr/bin/env bash
set -euo pipefail

package_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
workspace_dir="$(mktemp -d /tmp/madcms-archive-install-XXXXXX)"
staging_dir="$workspace_dir/package"
artifact_dir="$workspace_dir/artifacts"

cleanup() {
    rm -rf "$workspace_dir"
}
trap cleanup EXIT

mkdir -p "$staging_dir" "$artifact_dir"
cp -a "$package_dir/." "$staging_dir/"
rm -rf "$staging_dir/node_modules"

version="$(php -r '$manifest = json_decode(file_get_contents($argv[1]), true, flags: JSON_THROW_ON_ERROR); echo $manifest["version"] ?? "";' "$staging_dir/madcms-package.json")"
if [[ -z "$version" ]]; then
    echo "MAD CMS distribution version is missing." >&2
    exit 1
fi

php -r '$path = $argv[1]; $composer = json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR); $composer["version"] = $argv[2]; file_put_contents($path, json_encode($composer, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES).PHP_EOL);' "$staging_dir/composer.json" "$version"

composer archive --working-dir="$staging_dir" --format=zip --dir="$artifact_dir" --quiet
archive="$(find "$artifact_dir" -maxdepth 1 -name '*.zip' -print -quit)"

if [[ -z "$archive" ]]; then
    echo "Composer did not create a MAD CMS distribution archive." >&2
    exit 1
fi

archive_listing="$(unzip -Z1 "$archive")"
for required_path in \
    composer.json \
    config/madcms.php \
    resources/js/index.ts \
    resources/js/admin-page-editor.tsx \
    resources/stubs/pages/MadCms/PageEdit.tsx \
    routes/madcms.php \
    src/MadCmsServiceProvider.php; do
    grep -Fxq "$required_path" <<< "$archive_listing" || {
        echo "Distribution archive is missing ${required_path}." >&2
        exit 1
    }
done

for excluded_path in .github/ tests/ node_modules/ RELEASE_CHECKLIST.md tsconfig.json; do
    if grep -Eq "^${excluded_path}" <<< "$archive_listing"; then
        echo "Distribution archive unexpectedly contains ${excluded_path}." >&2
        exit 1
    fi
done

MADCMS_COMPOSER_REPOSITORY_TYPE=artifact \
MADCMS_COMPOSER_REPOSITORY_PATH="$artifact_dir" \
MADCMS_COMPOSER_CONSTRAINT="$version" \
    bash "$package_dir/tests/clean-install.sh" "$@"

echo "MAD CMS ${version} distribution archive install passed."
