# Release Checklist

## Automated

- [ ] `composer validate --strict --no-check-publish`
- [ ] `npm install --no-package-lock`
- [ ] `npx tsc --noEmit -p tsconfig.json`
- [ ] `bash tests/clean-install.sh 11 12`
- [ ] `bash tests/archive-install.sh 11 12`
- [ ] Confirm the release tag exactly matches `madcms-package.json` and `package.json` (for example `v0.1.0-rc.1`).

## Repository

- [x] Create or update `madtechservices/madcms` on GitHub from this package directory.
- [x] Confirm Actions can run with read access and releases have `contents: write`.
- [ ] Review proprietary licensing terms before inviting third-party installation.
- [x] Push the release commit, then create and push the matching tag.

## Packagist

- [ ] Submit `https://github.com/madtechservices/madcms` to the `madtechservices` Packagist account.
- [ ] Connect the GitHub update hook.
- [ ] Confirm Packagist detects Laravel 11/12 and PHP 8.2+ constraints.
- [ ] Install the tagged release into a separate Laravel application before promoting it from release candidate to stable.
