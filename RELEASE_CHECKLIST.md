# Release Checklist

## Automated

- [x] `composer validate --strict --no-check-publish`
- [x] `npm install --no-package-lock`
- [x] `npx tsc --noEmit -p tsconfig.json`
- [x] `bash tests/clean-install.sh 11 12 13`
- [x] `bash tests/archive-install.sh 11 12 13`
- [x] Confirm the release tag exactly matches `madcms-package.json` and `package.json` (for example `v0.1.0-rc.2`).

## Repository

- [x] Create or update `madtechservices/madcms` on GitHub from this package directory.
- [x] Confirm Actions can run with read access and releases have `contents: write`.
- [ ] Review proprietary licensing terms before inviting third-party installation.
- [x] Push the release commit, then create and push the matching tag.

## Packagist

- [x] Submit `https://github.com/madtechservices/madcms` to the `madtechservices` Packagist account.
- [x] Connect the GitHub update hook.
- [x] Confirm Packagist detects Laravel 11/12/13 and PHP constraints.
- [x] Install the tagged release into a separate Laravel application before promoting it from release candidate to stable.
