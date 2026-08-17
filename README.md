# MAD CMS

MAD CMS is a reusable Laravel page builder, module system, and form builder maintained by MAD Tech Services.

## Package Identity

- Composer: `madtechservices/madcms`
- Namespace: `MadTechServices\MadCms`
- Product name: MAD CMS

## Current Development State

The `0.1.0-rc.1` package is a release candidate extracted from the production MAD Tech Services website. It can run in standalone `package` mode or safe `hybrid` mode. Package discovery, configuration, diagnostics, extension registries, CMS models, access/category services, page/form/module/submission administration, public form processing, the verified migration sequence, frontend runtime, 22 renderers, visual page builder, and standalone administration screens are package-owned. The production host retains its branded theme and optional rich-text/media adapters.

This boundary is intentional. Installing the development package must not replace existing routes, rerun existing migrations, or alter published content.

## Local Installation

The host application uses a Composer path repository while extraction is in progress:

```bash
composer require madtechservices/madcms:@dev
php artisan madcms:install
php artisan madcms:status
```

`madcms:install` publishes configuration by default. It does not migrate the database or replace application files. Pass `--frontend` only when the host wants a local copy of the versioned TypeScript contract.

For a clean standalone Laravel installation, set `MADCMS_MODE=package` before migrating. Package mode enables the bundled CMS migrations and resolves relationships directly to package models. Hybrid mode keeps package migrations disabled and resolves relationships through available host compatibility models.

Package mode also registers `POST /forms/{form}` through the package public form controller. Hybrid mode leaves route registration disabled so an existing application can retain its current route and controller adapter without duplication.

Compatibility is verified against clean Laravel 11 and Laravel 12 applications with disposable SQLite databases:

```bash
npm run test:clean-install
```

Release CI also builds the Composer distribution archive and installs that archive into clean applications. This catches missing runtime, frontend, migration, or published-stub files that a source-directory install cannot detect:

```bash
npm run test:archive
```

The check covers Composer discovery, package-mode migrations, frontend publishing, diagnostics, and the public form route. Laravel 11's supported framework line is currently affected by upstream security advisories, so only that disposable fixture disables Composer's advisory installation block; MAD CMS and the production website retain their normal dependency policy.

Module and form mutation routes are independently opt-in. Set `MADCMS_REGISTER_ADMIN_MUTATIONS=true` only when the host is ready for package-owned create, update, duplicate, restore, and delete endpoints. Their prefix, route-name prefix, and middleware are configurable under `madcms.routes`; the default permission middleware uses `cms-modules-manage` and `cms-forms-manage`.

The same opt-in route group includes category mutations and form-submission export, status, bulk, delete, and action-retry endpoints. Their permission middleware is independently configurable.

The versioned TypeScript contract can be published without activating or replacing the host builder:

```bash
php artisan madcms:install --frontend
```

This publishes the versioned types, registry, runtime utilities, starter schemas, canvas, component library, property panel, editor schemas and fields, responsive and layout style controls, core renderers, and standalone administration screens to `resources/js/vendor/madcms`. The package frontend is a release candidate: the MAD website imports these assets directly while supplying its existing panel, input, button, link, rich-text, media-upload, form-control, and theme adapters.

## Extraction Rules

1. Move one subsystem at a time and keep application compatibility classes where required.
2. Keep existing table names and data intact.
3. Package routes and migrations remain disabled until the corresponding application-owned code has been removed.
4. MAD branding, business content, and the current public theme remain in the website or a separate optional theme package.
5. Run PHP feature tests, authenticated builder browser tests, public responsive tests, and the production frontend build before changing ownership of another subsystem.

## Intended Distribution

After extraction, tagged releases will be published from `madtechservices/madcms` on GitHub and Packagist. The package manifest in `madcms-package.json` is intended for the future MAD Laravel package manager.

The package directory contains repository-ready GitHub Actions. CI validates clean installs across Laravel 11/12 and supported PHP versions plus the standalone frontend TypeScript contract. A `v*` tag is released only when it matches `madcms-package.json`; Packagist can then consume the GitHub tag through its standard webhook.

To install the optional standalone Inertia administration shell:

```bash
composer require inertiajs/inertia-laravel:^2.0
php artisan madcms:install --admin-ui
```

The host frontend also needs the package peer dependencies:

```bash
npm install @inertiajs/react @dnd-kit/core @dnd-kit/sortable lucide-react react react-dom
```

Then set `MADCMS_REGISTER_ADMIN_PRESENTATION=true`. The UI defaults to `/madcms`, uses `MadCms/*` Inertia component names, and remains independently configurable from the `/cms` data and mutation routes. `--admin-ui` refuses to publish when the optional server-side Inertia dependency is missing.

The published Inertia pages are placed in `resources/js/pages/MadCms`; ensure the host's Inertia page resolver includes that directory. The published package components are under `resources/js/vendor/madcms`, which must also be included in the host's Tailwind source scan so editor and renderer classes are generated.

Set `MADCMS_REGISTER_ADMIN_MUTATIONS=true` as well to save through the standalone editors. With mutation routes disabled, edit screens remain available for inspection but visibly switch to read-only mode rather than submitting to a missing route. The Pages collection links to package-owned create/edit screens. The visual editor includes responsive previews, sections, rows, columns, reusable master modules, detached page elements, guided content fields, design controls, scoped CSS, page metadata, categories, and SEO settings. New layouts begin staged with public builder rendering disabled. The Modules collection has matching create/edit screens with guided content/design fields, linked-page usage context, revision notes, and a live renderer preview. The Forms collection provides ordered fields and actions, type-specific email/autoresponder/webhook settings, spam controls, appearance settings, and a disabled live preview.

## Extending Module Types

Module types are resolved through a shared singleton so add-on packages do not need to modify MAD CMS controllers. A Laravel service provider can register its server-side type during `boot`:

```php
use MadTechServices\MadCms\Contracts\ModuleTypeRegistry;

public function boot(ModuleTypeRegistry $modules): void
{
    $modules->register('booking-calendar', [
        'label' => 'Booking calendar',
        'category' => 'forms',
    ]);
}
```

The React editor/renderer registry contract is available now. All 22 core renderers and their editor schemas are package-owned, and third-party modules can extend the registry without changing MAD CMS source.

Form field and action types use matching registries. Custom actions can provide a class implementing `MadTechServices\MadCms\Contracts\FormActionHandler` in the action definition; execution and success/failure logging then run through the package action runner.

Form and module definition managers provide reusable create, update, duplicate, slug, child synchronisation, snapshot, and revision-restore operations. Host admin controllers can retain their own permissions and Inertia responses while delegating persistence to these package services.

The `LayoutUsageAnalyzer` resolves linked module and embedded form usage across section, row, and column layouts. It distinguishes enabled public layouts from staged layouts so host controllers can protect active dependencies without preventing staged design work.

`ModuleAdminQuery` and `FormAdminQuery` provide reusable filtered pagination, usage summaries, revision summaries, and active form choices. The package mutation controllers own create, update, duplicate, revision restore, dependency protection, and delete behavior. A host can keep its own Blade, Livewire, Inertia, or API presentation while reusing this backend.

`PageAdminQuery` provides visibility-aware page pagination, builder/review filters, catalogue summaries, and editor bootstrap data. `PageLayoutInspector` is the shared implementation for builder status, component counts, staged-review state, duplicate identities, and inactive linked module/form publish blockers. The MAD website delegates those live checks to the package while retaining its publishing workflow and Inertia presentation.

`PageDefinitionManager` transactionally owns page metadata and slug persistence, category synchronisation, published layout storage, duplication, status transitions, revision snapshots, and revision restoration. Hosts remain responsible for validating requests and applying publishing/review policy before invoking these operations.

`PagePublishingPolicy` owns the default staged-review lifecycle, review invalidation, guarded enablement, and public-layout dependency checks. It is container-bound and replaceable. `PageMutationController` combines that policy with the definition manager for opt-in JSON or redirect-based page writes.

Set `MADCMS_REGISTER_ADMIN_API=true` to register authenticated, permission-aware JSON index routes for modules, forms, submissions, categories, and extension registries. This read-side contract is independent from `MADCMS_REGISTER_ADMIN_MUTATIONS`, so a host can adopt package data endpoints before enabling package-owned writes. Both remain disabled by default in hybrid mode.

```text
GET /cms/pages
GET /cms/pages/{page}
GET /cms/modules
GET /cms/forms
GET /cms/form-submissions
GET /cms/categories
GET /cms/registries
```

With `MADCMS_REGISTER_ADMIN_MUTATIONS=true`, the package also registers page create/update/delete, duplicate, publish/unpublish/archive, revision restore, builder review, and guarded builder enable routes. Route prefixes, names, authentication, and page authorization middleware remain configurable.

`SubmissionAdminQuery` and the package submission controller provide filtered dashboards, CSV export, status changes, bulk actions, deletion, and failed-action retries. `AccessManager`, `CategoryAdminQuery`, and the category mutation controller provide role-aware visibility and category administration without requiring the host to use the MAD website presentation.

The frontend entrypoint exports the stable builder layout, section, row, column, placement, module, form, renderer, editor, and host-adapter types. `createModuleRegistry` is the extension point for third-party React renderers and editors.

Reusable content renderers accept a typed `BuilderHost` adapter for framework-specific behavior. Hosts can provide client-side links, shared button links, rich-text sanitization, brand artwork, form controls, labels, submit buttons, and form action URLs without forking package components. Rich text is deliberately omitted when no sanitizer is supplied; unsafe HTML is never rendered as a fallback.

Designed collection sections use generic item and icon adapters. This lets a host enrich service or testimonial data from its own catalogue while the reusable package owns the semantic markup and responsive layout. The `BuilderCanvas` similarly accepts module and action render callbacks, so it can run with native controls or a host design system without depending on MAD website components.

The package module-library utilities own search, category grouping, content summaries, picker ordering, layout target discovery, and active-target fallback. `CanvasComponentPicker` and `CanvasPropertiesPanel` provide native standalone controls plus adapters for a host panel shell, search input, and action buttons. A separate versioned editor-schema registry covers every core renderer type with scalar, select, checkbox, media, form, rich-text, string-list, and object-list fields; keeping it separate prevents editor metadata entering public-page bundles. `SchemaModuleFields` renders those schemas, including nested repeaters and item actions, with accessible native controls or host adapters for an application's design system, rich-text editor, and media picker.

`LayoutStyleFields` owns placement, section, row, and column style schemas and their guided controls. It includes colour pairs, background media, spacing presets/custom values, layout alignment, borders, typography, button styling, device visibility, and responsive override composition. Hosts may inject design-system fields, media selection, saved presets, and breakpoint controls without duplicating the schema.

`MadCmsAdminShell` and the Pages, Modules, Forms, Submissions, and Categories components provide the presentation-neutral administration layer. They include create/edit screens, category management, submission detail/status workflows, search, totals, pagination, and empty states. `MadCmsPageEditor` composes the same package canvas, registry, renderers, picker, property panel, field schemas, and styling controls used by an integrated host, so standalone sites do not receive a reduced article editor. `MadCmsModuleEditor` uses those same schemas, styles, and renderers for reusable master-module editing.

`AdvancedStyleFields` adds an optional, clearly marked admin surface for utility classes and component-scoped CSS. The public runtime rewrites selectors to the placement scope, supports `:host` for the component wrapper, and does not accept executable HTML or scripts through these controls.

The package public form renderer owns field iteration, stable control IDs, validation errors, field widths, honeypot and timing values, disabled preview behavior, Inertia submission, success messages, and form-embed section rendering. Accessible native text, email, phone, textarea, select, radio, checkbox, consent, and hidden controls are included for hosts that do not provide their own design-system adapters.

Package subpath exports are available for hosts that only need part of the frontend:

```ts
import { createModuleRegistry } from '@madtechservices/madcms/registry';
import { AdvancedStyleFields } from '@madtechservices/madcms/advanced-style-fields';
import { MadCmsAdminShell } from '@madtechservices/madcms/admin-shell';
import { MadCmsPagesCollection } from '@madtechservices/madcms/admin-collections';
import { MadCmsFormEditor } from '@madtechservices/madcms/admin-form-editor';
import { MadCmsModuleEditor } from '@madtechservices/madcms/admin-module-editor';
import { MadCmsPageEditor } from '@madtechservices/madcms/admin-page-editor';
import { CmsFormRenderer, DefaultFormControl } from '@madtechservices/madcms/form-renderers';
import { BuilderCanvas } from '@madtechservices/madcms/builder-canvas';
import { SchemaModuleFields } from '@madtechservices/madcms/editor-fields';
import { CORE_MODULE_EDITOR_SCHEMAS, editorSchemaFor } from '@madtechservices/madcms/editor-schemas';
import { LayoutStyleFields } from '@madtechservices/madcms/layout-style-fields';
import { CanvasComponentPicker, groupLibraryModules } from '@madtechservices/madcms/module-library';
import { CanvasPropertiesPanel } from '@madtechservices/madcms/property-panel';
import { ResponsiveStyleControls } from '@madtechservices/madcms/responsive-style-controls';
import { CoreModuleRenderer, coreModuleRegistry } from '@madtechservices/madcms/renderers';
import { SectionModuleRenderer } from '@madtechservices/madcms/section-renderers';
import { moduleClass, safeLinkHref } from '@madtechservices/madcms/runtime';
import { BUILDER_STARTER_ELEMENTS } from '@madtechservices/madcms/schemas';
import type { BuilderHost, BuilderLayout } from '@madtechservices/madcms/types';
```

The MAD website's local path integration maps `@madcms/*` directly to the package source during extraction. The `0.1.0-rc.1` release distributes frontend source with the Composer package; other hosts should publish it with `madcms:install --frontend` or `madcms:install --admin-ui` and import from `resources/js/vendor/madcms`. The npm manifest is a frontend contract and CI workspace, not a separately published npm package in this release.
