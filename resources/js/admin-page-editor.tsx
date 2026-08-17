import { router } from '@inertiajs/react';
import { ArrowLeft, Check, Monitor, Save, Settings2, Smartphone, Tablet, Trash2 } from 'lucide-react';
import { useRef, useState, type MouseEvent } from 'react';

import { MadCmsAdminShell, type MadCmsAdminShellHost } from './admin-shell';
import { AdvancedStyleFields } from './advanced-style-fields';
import { BuilderCanvas } from './builder-canvas';
import { SchemaModuleFields } from './editor-fields';
import { editorSchemaFor } from './editor-schemas';
import { LayoutStyleFields, type LayoutStyleNode } from './layout-style-fields';
import { CanvasComponentPicker, type LibraryModule, type LibraryStarter } from './module-library';
import { CanvasPropertiesPanel } from './property-panel';
import { coreModuleRegistry } from './renderers';
import { scopedCssForPlacement } from './runtime';
import { BUILDER_STARTER_ELEMENTS } from './schemas';
import type {
    BuilderColumn,
    BuilderLayout,
    BuilderRow,
    BuilderSection,
    BuilderStyle,
    BuilderViewport,
    CmsFormDefinition,
    CmsModuleDefinition,
    CmsRecord,
    ModulePlacement,
} from './types';

type PageRecord = CmsRecord & {
    id?: number;
    title?: string;
    subtitle?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    status?: string;
    parent_id?: number | null;
    category_ids?: number[];
    seo?: CmsRecord | null;
};

type LayoutSelection = { type: 'section' | 'row' | 'column'; section: number; row?: number; column?: number };
type PlacementSelection = { section: number; row: number; column: number; placement: number };
type PickerTarget = { section: number; row: number; column: number };

export type MadCmsPageEditorProps = {
    page: PageRecord;
    builderLayout?: BuilderLayout | null;
    modules?: CmsModuleDefinition[];
    forms?: CmsFormDefinition[];
    categories?: Array<CmsRecord & { id: number; title?: string; name?: string }>;
    parents?: Array<CmsRecord & { id: number; title?: string }>;
    statuses?: string[];
    mode?: 'create' | 'edit';
    basePath?: string;
    mutationBasePath?: string;
    mutationsEnabled?: boolean;
    errors?: Record<string, string>;
    host?: MadCmsAdminShellHost;
};

const emptyLayout = (): BuilderLayout => ({ version: 1, enabled: false, sections: [] });

function copy<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function moduleFor(placement: ModulePlacement, modules: CmsModuleDefinition[]) {
    return modules.find((module) => module.id === placement.module_id);
}

function effectiveContent(placement: ModulePlacement, module?: CmsModuleDefinition): CmsRecord {
    if (placement.mode === 'detached') return { ...(placement.detached_content || {}) };
    return { ...(module?.content || {}), ...(placement.content_overrides || {}) };
}

function effectiveStyle(placement: ModulePlacement, module?: CmsModuleDefinition): BuilderStyle {
    if (placement.mode === 'detached') return { ...(placement.detached_style || {}) };
    return { ...(module?.style || {}), ...(placement.style_overrides || {}) };
}

function placementAt(layout: BuilderLayout, selection: PlacementSelection) {
    return layout.sections[selection.section]?.rows[selection.row]?.columns[selection.column]?.modules[selection.placement];
}

function columnAt(layout: BuilderLayout, target: PickerTarget) {
    return layout.sections[target.section]?.rows[target.row]?.columns[target.column];
}

function selectedLayoutNode(layout: BuilderLayout, selection: LayoutSelection): BuilderSection | BuilderRow | BuilderColumn | undefined {
    const section = layout.sections[selection.section];
    if (selection.type === 'section') return section;
    const row = section?.rows[selection.row || 0];
    if (selection.type === 'row') return row;
    return row?.columns[selection.column || 0];
}

export function MadCmsPageEditor({
    page: initialPage,
    builderLayout,
    modules = [],
    forms = [],
    categories = [],
    parents = [],
    statuses = ['draft', 'published', 'unpublished', 'archived'],
    mode = initialPage.id ? 'edit' : 'create',
    basePath = '/madcms',
    mutationBasePath = '/cms',
    mutationsEnabled = true,
    errors = {},
    host,
}: MadCmsPageEditorProps) {
    const [page, setPage] = useState<PageRecord>(() => ({
        ...initialPage,
        seo: initialPage.seo || {},
        category_ids: initialPage.category_ids || [],
    }));
    const [layout, setLayout] = useState<BuilderLayout>(() => copy(builderLayout || emptyLayout()));
    const [viewport, setViewport] = useState<BuilderViewport>('desktop');
    const [screen, setScreen] = useState<'builder' | 'settings'>('builder');
    const [placementSelection, setPlacementSelection] = useState<PlacementSelection | null>(null);
    const [layoutSelection, setLayoutSelection] = useState<LayoutSelection | null>(null);
    const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
    const [activePropertyTab, setActivePropertyTab] = useState<'content' | 'design'>('content');
    const [clipboard, setClipboard] = useState<ModulePlacement | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const idCounter = useRef(0);
    const nextId = (kind: string) => `madcms-${kind}-${Date.now()}-${++idCounter.current}`;
    const selectedPlacement = placementSelection ? placementAt(layout, placementSelection) : undefined;
    const selectedModule = selectedPlacement ? moduleFor(selectedPlacement, modules) : undefined;
    const selectedNode = layoutSelection ? selectedLayoutNode(layout, layoutSelection) : undefined;
    const selectedNodeType = layoutSelection?.type;
    const canvasWidth = viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '768px' : '390px';

    const updateLayout = (mutate: (draft: BuilderLayout) => void) => {
        setLayout((current) => {
            const draft = copy(current);
            mutate(draft);
            return draft;
        });
        setSaved(false);
    };

    const updatePlacement = (mutate: (placement: ModulePlacement) => void) => {
        if (!placementSelection) return;
        updateLayout((draft) => {
            const placement = placementAt(draft, placementSelection);
            if (placement) mutate(placement);
        });
    };

    const insertSection = (after: number) => {
        const section: BuilderSection = {
            id: nextId('section'),
            label: 'Section',
            rows: [{ id: nextId('row'), label: 'Row', columns: [{ id: nextId('column'), width: 'full', modules: [] }] }],
        };
        updateLayout((draft) => draft.sections.splice(after + 1, 0, section));
        setLayoutSelection({ type: 'section', section: after + 1 });
        setPlacementSelection(null);
    };

    const addRow = (sectionIndex: number, widths = ['full']) => {
        updateLayout((draft) => {
            draft.sections[sectionIndex].rows.push({
                id: nextId('row'),
                label: 'Row',
                columns: widths.map((width) => ({ id: nextId('column'), width, modules: [] })),
            });
        });
        const row = layout.sections[sectionIndex]?.rows.length || 0;
        setLayoutSelection({ type: 'row', section: sectionIndex, row });
        setPlacementSelection(null);
    };

    const addColumn = (sectionIndex: number, rowIndex: number) => {
        updateLayout((draft) => draft.sections[sectionIndex].rows[rowIndex].columns.push({ id: nextId('column'), width: '1/2', modules: [] }));
        setLayoutSelection({
            type: 'column',
            section: sectionIndex,
            row: rowIndex,
            column: layout.sections[sectionIndex].rows[rowIndex].columns.length,
        });
        setPlacementSelection(null);
    };

    const insertPlacement = (target: PickerTarget, placement: ModulePlacement) => {
        updateLayout((draft) => columnAt(draft, target)?.modules.push(placement));
        const placementIndex = columnAt(layout, target)?.modules.length || 0;
        setPlacementSelection({ ...target, placement: placementIndex });
        setLayoutSelection(null);
        setPickerTarget(null);
    };

    const insertModule = (target: PickerTarget, module: LibraryModule) =>
        insertPlacement(target, {
            id: nextId('component'),
            mode: 'linked',
            module_id: module.id,
            module_name: module.name,
            module_type: module.type,
            content_overrides: {},
            style_overrides: {},
        });

    const insertStarter = (target: PickerTarget, starter: LibraryStarter) => {
        const template = BUILDER_STARTER_ELEMENTS.find((item) => item.id === starter.id);
        if (!template) return;
        insertPlacement(target, {
            id: nextId('component'),
            mode: 'detached',
            module_name: template.name,
            module_type: template.type,
            detached_content: copy(template.content),
            detached_style: copy((template.style || {}) as BuilderStyle),
        });
    };

    const movePlacement = (placementId: string, section: number, row: number, column: number, beforeId?: string) => {
        updateLayout((draft) => {
            let moving: ModulePlacement | undefined;
            draft.sections.forEach((sectionItem) =>
                sectionItem.rows.forEach((rowItem) =>
                    rowItem.columns.forEach((columnItem) => {
                        const index = columnItem.modules.findIndex((placement) => placement.id === placementId);
                        if (index >= 0) [moving] = columnItem.modules.splice(index, 1);
                    }),
                ),
            );
            if (!moving) return;
            const target = draft.sections[section]?.rows[row]?.columns[column];
            const index = beforeId ? target?.modules.findIndex((placement) => placement.id === beforeId) : -1;
            target?.modules.splice(index !== undefined && index >= 0 ? index : target.modules.length, 0, moving);
        });
        setPlacementSelection(null);
    };

    const removePlacement = () => {
        if (!placementSelection) return;
        updateLayout((draft) =>
            draft.sections[placementSelection.section].rows[placementSelection.row].columns[placementSelection.column].modules.splice(
                placementSelection.placement,
                1,
            ),
        );
        setPlacementSelection(null);
    };

    const duplicatePlacement = () => {
        if (!placementSelection || !selectedPlacement) return;
        updateLayout((draft) => {
            const placements = draft.sections[placementSelection.section].rows[placementSelection.row].columns[placementSelection.column].modules;
            placements.splice(placementSelection.placement + 1, 0, { ...copy(selectedPlacement), id: nextId('component') });
        });
        setPlacementSelection({ ...placementSelection, placement: placementSelection.placement + 1 });
    };

    const moveSelected = (offset: number) => {
        if (!placementSelection) return;
        const target = placementSelection.placement + offset;
        if (target < 0) return;
        updateLayout((draft) => {
            const placements = draft.sections[placementSelection.section].rows[placementSelection.row].columns[placementSelection.column].modules;
            if (target >= placements.length) return;
            [placements[placementSelection.placement], placements[target]] = [placements[target], placements[placementSelection.placement]];
        });
        setPlacementSelection({ ...placementSelection, placement: target });
    };

    const selectPlacement = (event: MouseEvent, selection: PlacementSelection) => {
        event.preventDefault();
        event.stopPropagation();
        setPlacementSelection(selection);
        setLayoutSelection(null);
        setPickerTarget(null);
    };

    const updateNode = (mutate: (node: BuilderSection | BuilderRow | BuilderColumn) => void) => {
        if (!layoutSelection) return;
        updateLayout((draft) => {
            const node = selectedLayoutNode(draft, layoutSelection);
            if (node) mutate(node);
        });
    };

    const deleteSelectedNode = () => {
        if (!layoutSelection) return;
        updateLayout((draft) => {
            if (layoutSelection.type === 'section') draft.sections.splice(layoutSelection.section, 1);
            else if (layoutSelection.type === 'row') draft.sections[layoutSelection.section].rows.splice(layoutSelection.row || 0, 1);
            else draft.sections[layoutSelection.section].rows[layoutSelection.row || 0].columns.splice(layoutSelection.column || 0, 1);
        });
        setLayoutSelection(null);
    };

    const save = () => {
        if (!mutationsEnabled) return;
        setSaving(true);
        const payload = { ...page, builder_layout: layout };
        const options = { preserveScroll: true, onSuccess: () => setSaved(true), onFinish: () => setSaving(false) };
        if (mode === 'create') router.post(`${mutationBasePath}/pages`, payload as never, options);
        else router.put(`${mutationBasePath}/pages/${page.id}`, payload as never, options);
    };

    const pageActions = (
        <>
            <a
                href={`${basePath}/pages`}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium"
            >
                <ArrowLeft className="h-4 w-4" /> Pages
            </a>
            <button
                type="button"
                onClick={() => setScreen(screen === 'builder' ? 'settings' : 'builder')}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium"
            >
                {screen === 'builder' ? <Settings2 className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                {screen === 'builder' ? 'Page settings' : 'Back to canvas'}
            </button>
            <button
                type="button"
                onClick={save}
                disabled={saving || !page.title || !mutationsEnabled}
                title={mutationsEnabled ? 'Save page' : 'Enable MAD CMS admin mutations to save'}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
                {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
            </button>
        </>
    );

    const seo = page.seo || {};
    const fieldClass = 'mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm';

    return (
        <MadCmsAdminShell
            activeSection="pages"
            title={page.title || 'New page'}
            description="Build the page visually, then publish when it is ready."
            actions={pageActions}
            host={host}
        >
            {!mutationsEnabled && (
                <div className="mb-4 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    This editor is read-only because package admin mutations are disabled.
                </div>
            )}
            {Object.keys(errors).length > 0 && (
                <div className="mb-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
                    <div className="font-semibold">The page could not be saved.</div>
                    <ul className="mt-1 list-disc pl-5">
                        {Object.entries(errors).map(([key, message]) => (
                            <li key={key}>{message}</li>
                        ))}
                    </ul>
                </div>
            )}
            {screen === 'settings' ? (
                <div className="mx-auto max-w-5xl space-y-6">
                    <section className="grid gap-4 border border-slate-200 bg-white p-5 md:grid-cols-2">
                        <label className="text-sm font-medium">
                            Title
                            <input
                                className={fieldClass}
                                value={String(page.title || '')}
                                onChange={(event) => setPage({ ...page, title: event.target.value })}
                            />
                        </label>
                        <label className="text-sm font-medium">
                            Slug
                            <input
                                className={fieldClass}
                                value={String(page.slug || '')}
                                onChange={(event) => setPage({ ...page, slug: event.target.value })}
                                placeholder="Generated from title when blank"
                            />
                        </label>
                        <label className="text-sm font-medium md:col-span-2">
                            Subtitle
                            <input
                                className={fieldClass}
                                value={String(page.subtitle || '')}
                                onChange={(event) => setPage({ ...page, subtitle: event.target.value })}
                            />
                        </label>
                        <label className="text-sm font-medium md:col-span-2">
                            Excerpt
                            <textarea
                                className={`${fieldClass} min-h-24 py-2`}
                                value={String(page.excerpt || '')}
                                onChange={(event) => setPage({ ...page, excerpt: event.target.value })}
                            />
                        </label>
                        <label className="text-sm font-medium">
                            Status
                            <select
                                className={fieldClass}
                                value={String(page.status || 'draft')}
                                onChange={(event) => setPage({ ...page, status: event.target.value })}
                            >
                                {statuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="text-sm font-medium">
                            Parent page
                            <select
                                className={fieldClass}
                                value={String(page.parent_id || '')}
                                onChange={(event) => setPage({ ...page, parent_id: event.target.value ? Number(event.target.value) : null })}
                            >
                                <option value="">None</option>
                                {parents.map((parent) => (
                                    <option key={parent.id} value={parent.id}>
                                        {parent.title || `Page ${parent.id}`}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </section>
                    <section className="grid gap-4 border border-slate-200 bg-white p-5 md:grid-cols-2">
                        <h2 className="text-base font-semibold md:col-span-2">Search and sharing</h2>
                        <label className="text-sm font-medium">
                            Meta title
                            <input
                                className={fieldClass}
                                value={String(seo.meta_title || '')}
                                onChange={(event) => setPage({ ...page, seo: { ...seo, meta_title: event.target.value } })}
                            />
                        </label>
                        <label className="text-sm font-medium">
                            Canonical URL
                            <input
                                className={fieldClass}
                                value={String(seo.canonical_url || '')}
                                onChange={(event) => setPage({ ...page, seo: { ...seo, canonical_url: event.target.value } })}
                            />
                        </label>
                        <label className="text-sm font-medium md:col-span-2">
                            Meta description
                            <textarea
                                className={`${fieldClass} min-h-24 py-2`}
                                value={String(seo.meta_description || '')}
                                onChange={(event) => setPage({ ...page, seo: { ...seo, meta_description: event.target.value } })}
                            />
                        </label>
                    </section>
                    {categories.length > 0 && (
                        <section className="border border-slate-200 bg-white p-5">
                            <h2 className="text-base font-semibold">Categories</h2>
                            <div className="mt-3 flex flex-wrap gap-4">
                                {categories.map((category) => (
                                    <label key={category.id} className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={(page.category_ids || []).includes(category.id)}
                                            onChange={(event) =>
                                                setPage({
                                                    ...page,
                                                    category_ids: event.target.checked
                                                        ? [...(page.category_ids || []), category.id]
                                                        : (page.category_ids || []).filter((id) => id !== category.id),
                                                })
                                            }
                                        />
                                        {category.title || category.name}
                                    </label>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            ) : (
                <div className="relative min-h-[70vh] overflow-hidden border border-slate-200 bg-slate-100">
                    <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2">
                        <div className="flex items-center gap-1" aria-label="Preview size">
                            {(
                                [
                                    ['desktop', Monitor],
                                    ['tablet', Tablet],
                                    ['mobile', Smartphone],
                                ] as const
                            ).map(([device, Icon]) => (
                                <button
                                    key={device}
                                    type="button"
                                    title={`${device} preview`}
                                    aria-label={`${device} preview`}
                                    onClick={() => setViewport(device)}
                                    className={`grid h-9 w-9 place-items-center rounded-md ${viewport === device ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    <Icon className="h-4 w-4" />
                                </button>
                            ))}
                        </div>
                        <label className="flex items-center gap-2 text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={layout.enabled}
                                onChange={(event) =>
                                    updateLayout((draft) => {
                                        draft.enabled = event.target.checked;
                                    })
                                }
                            />
                            Use builder publicly
                        </label>
                    </div>
                    <div className="min-h-[65vh] overflow-x-auto p-3 sm:p-6">
                        <div
                            className="mx-auto min-h-[60vh] overflow-hidden bg-white shadow-sm transition-[width]"
                            style={{ width: canvasWidth, maxWidth: '100%' }}
                        >
                            <BuilderCanvas
                                layout={layout}
                                editorEnabled
                                selectedLayoutElementId={
                                    layoutSelection
                                        ? `${layoutSelection.type}:${layoutSelection.section}${layoutSelection.row !== undefined ? `:${layoutSelection.row}` : ''}${layoutSelection.column !== undefined ? `:${layoutSelection.column}` : ''}`
                                        : null
                                }
                                renderPlacement={(placement, section, row, column) => {
                                    const placementIndex = layout.sections[section].rows[row].columns[column].modules.findIndex(
                                        (item) => item.id === placement.id,
                                    );
                                    const selected =
                                        placementSelection?.section === section &&
                                        placementSelection.row === row &&
                                        placementSelection.column === column &&
                                        placementSelection.placement === placementIndex;
                                    const module = moduleFor(placement, modules);
                                    const definition = coreModuleRegistry.get(placement.module_type);
                                    const Renderer = definition?.renderer;
                                    return (
                                        <div
                                            draggable
                                            data-madcms-component={placement.id}
                                            onDragStart={(event) => event.dataTransfer.setData('application/x-cms-placement-id', placement.id)}
                                            onClick={(event) => selectPlacement(event, { section, row, column, placement: placementIndex })}
                                            className={`relative ${selected ? 'z-10 outline-2 outline-offset-[-2px] outline-indigo-600' : 'hover:outline hover:outline-2 hover:outline-offset-[-2px] hover:outline-indigo-200'} ${placement.hidden ? 'opacity-40' : ''}`}
                                        >
                                            {placement.custom_css && <style>{scopedCssForPlacement(placement)}</style>}
                                            {Renderer ? (
                                                <Renderer
                                                    placement={placement}
                                                    module={module}
                                                    forms={forms}
                                                    pageId={page.id}
                                                    viewport={viewport}
                                                    editor
                                                    formsDisabled
                                                />
                                            ) : (
                                                <div className="border border-dashed border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
                                                    No renderer is registered for <strong>{placement.module_type}</strong>.
                                                </div>
                                            )}
                                        </div>
                                    );
                                }}
                                onSelectLayoutElement={(type, section, row, column) => {
                                    setLayoutSelection({ type, section, row, column });
                                    setPlacementSelection(null);
                                    setPickerTarget(null);
                                }}
                                onInsertSection={insertSection}
                                onAddRow={addRow}
                                onAddColumn={addColumn}
                                onAddComponent={(section, row, column) => setPickerTarget({ section, row, column })}
                                onDropModule={(section, row, column, moduleId) => {
                                    const module = modules.find((item) => item.id === moduleId);
                                    if (module) insertModule({ section, row, column }, module);
                                }}
                                onDropStarter={(section, row, column, starterId) => {
                                    const starter = BUILDER_STARTER_ELEMENTS.find((item) => item.id === starterId);
                                    if (starter) insertStarter({ section, row, column }, starter);
                                }}
                                onMovePlacement={movePlacement}
                            />
                        </div>
                    </div>
                    {pickerTarget && (
                        <CanvasComponentPicker
                            targetLabel={`Section ${pickerTarget.section + 1}, row ${pickerTarget.row + 1}, column ${pickerTarget.column + 1}`}
                            modules={modules}
                            starters={BUILDER_STARTER_ELEMENTS}
                            onInsertModule={(module) => insertModule(pickerTarget, module)}
                            onInsertStarter={(starter) => insertStarter(pickerTarget, starter)}
                            onClose={() => setPickerTarget(null)}
                        />
                    )}
                    {selectedPlacement && placementSelection && (
                        <CanvasPropertiesPanel
                            title={selectedPlacement.module_name || selectedModule?.name || selectedPlacement.module_type}
                            locationLabel={`Section ${placementSelection.section + 1} / row ${placementSelection.row + 1} / column ${placementSelection.column + 1}`}
                            mode={selectedPlacement.mode}
                            hidden={!!selectedPlacement.hidden}
                            activeTab={activePropertyTab}
                            contentFields={
                                <SchemaModuleFields
                                    schema={editorSchemaFor(selectedPlacement.module_type)}
                                    content={effectiveContent(selectedPlacement, selectedModule)}
                                    forms={forms.map((form) => ({ id: form.id, name: form.name }))}
                                    onChange={(key, value) =>
                                        updatePlacement((placement) => {
                                            const target =
                                                placement.mode === 'detached'
                                                    ? (placement.detached_content ||= {})
                                                    : (placement.content_overrides ||= {});
                                            target[key] = value;
                                        })
                                    }
                                />
                            }
                            designFields={
                                <div className="space-y-3">
                                    <LayoutStyleFields
                                        node="placement"
                                        style={effectiveStyle(selectedPlacement, selectedModule)}
                                        visibility={
                                            effectiveStyle(selectedPlacement, selectedModule).visibility as Record<string, boolean> | undefined
                                        }
                                        onStyleChange={(key, value) =>
                                            updatePlacement((placement) => {
                                                const target =
                                                    placement.mode === 'detached'
                                                        ? (placement.detached_style ||= {})
                                                        : (placement.style_overrides ||= {});
                                                target[key] = value;
                                            })
                                        }
                                        onVisibilityChange={(device, value) =>
                                            updatePlacement((placement) => {
                                                const target =
                                                    placement.mode === 'detached'
                                                        ? (placement.detached_style ||= {})
                                                        : (placement.style_overrides ||= {});
                                                target.visibility = { ...((target.visibility as CmsRecord) || {}), [device]: value };
                                            })
                                        }
                                    />
                                    <AdvancedStyleFields
                                        advancedClasses={selectedPlacement.advanced_classes || ''}
                                        customCss={selectedPlacement.custom_css || ''}
                                        onAdvancedClassesChange={(value) =>
                                            updatePlacement((placement) => {
                                                placement.advanced_classes = value;
                                            })
                                        }
                                        onCustomCssChange={(value) =>
                                            updatePlacement((placement) => {
                                                placement.custom_css = value;
                                            })
                                        }
                                    />
                                </div>
                            }
                            canMoveBackward={placementSelection.placement > 0}
                            canMoveForward={
                                placementSelection.placement <
                                layout.sections[placementSelection.section].rows[placementSelection.row].columns[placementSelection.column].modules
                                    .length -
                                    1
                            }
                            onSelectTab={setActivePropertyTab}
                            onToggleHidden={() =>
                                updatePlacement((placement) => {
                                    placement.hidden = !placement.hidden;
                                })
                            }
                            onDuplicate={duplicatePlacement}
                            onCopy={() => setClipboard(copy(selectedPlacement))}
                            onPaste={() => {
                                if (clipboard)
                                    insertPlacement(
                                        { section: placementSelection.section, row: placementSelection.row, column: placementSelection.column },
                                        { ...copy(clipboard), id: nextId('component') },
                                    );
                            }}
                            onDetach={() =>
                                updatePlacement((placement) => {
                                    placement.detached_content = effectiveContent(placement, selectedModule);
                                    placement.detached_style = effectiveStyle(placement, selectedModule);
                                    placement.mode = 'detached';
                                })
                            }
                            onRelink={() =>
                                updatePlacement((placement) => {
                                    if (placement.module_id) {
                                        placement.mode = 'linked';
                                        delete placement.detached_content;
                                        delete placement.detached_style;
                                    }
                                })
                            }
                            onMoveBackward={() => moveSelected(-1)}
                            onMoveForward={() => moveSelected(1)}
                            onRemove={removePlacement}
                            onSelectParent={(type) => {
                                setLayoutSelection({
                                    type,
                                    section: placementSelection.section,
                                    row: type === 'section' ? undefined : placementSelection.row,
                                    column: type === 'column' ? placementSelection.column : undefined,
                                });
                                setPlacementSelection(null);
                            }}
                            onClose={() => setPlacementSelection(null)}
                        />
                    )}
                    {layoutSelection && selectedNode && selectedNodeType && (
                        <aside className="absolute inset-y-0 right-0 z-30 flex w-full max-w-[430px] flex-col border-l border-slate-200 bg-white shadow-2xl">
                            <div className="flex items-start justify-between border-b border-slate-200 p-4">
                                <div>
                                    <div className="text-xs font-semibold text-blue-700 uppercase">Layout properties</div>
                                    <h2 className="mt-1 text-base font-semibold capitalize">{selectedNodeType}</h2>
                                </div>
                                <button type="button" className="text-sm text-slate-600" onClick={() => setLayoutSelection(null)}>
                                    Close
                                </button>
                            </div>
                            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                                <label className="text-sm font-medium">
                                    Label
                                    <input
                                        className={fieldClass}
                                        value={String(('label' in selectedNode && selectedNode.label) || '')}
                                        onChange={(event) =>
                                            updateNode((node) => {
                                                if ('label' in node) node.label = event.target.value;
                                            })
                                        }
                                    />
                                </label>
                                {selectedNodeType === 'column' && (
                                    <label className="mt-4 block text-sm font-medium">
                                        Width
                                        <select
                                            className={fieldClass}
                                            value={String((selectedNode as BuilderColumn).width || 'full')}
                                            onChange={(event) =>
                                                updateNode((node) => {
                                                    (node as BuilderColumn).width = event.target.value;
                                                })
                                            }
                                        >
                                            <option value="full">Full</option>
                                            <option value="1/2">1/2</option>
                                            <option value="1/3">1/3</option>
                                            <option value="2/3">2/3</option>
                                            <option value="1/4">1/4</option>
                                            <option value="3/4">3/4</option>
                                        </select>
                                    </label>
                                )}
                                <LayoutStyleFields
                                    node={selectedNodeType as LayoutStyleNode}
                                    style={selectedNode.style || {}}
                                    onStyleChange={(key, value) =>
                                        updateNode((node) => {
                                            node.style = { ...(node.style || {}), [key]: value };
                                        })
                                    }
                                />
                            </div>
                            <div className="border-t border-slate-200 p-3">
                                <button
                                    type="button"
                                    onClick={deleteSelectedNode}
                                    className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete {selectedNodeType}
                                </button>
                            </div>
                        </aside>
                    )}
                </div>
            )}
        </MadCmsAdminShell>
    );
}
