import { router } from '@inertiajs/react';
import { ArrowLeft, Check, Save } from 'lucide-react';
import { useState } from 'react';

import { MadCmsAdminShell, type MadCmsAdminShellHost } from './admin-shell';
import { AdvancedStyleFields } from './advanced-style-fields';
import { SchemaModuleFields } from './editor-fields';
import { editorSchemaFor } from './editor-schemas';
import { LayoutStyleFields } from './layout-style-fields';
import { coreModuleRegistry } from './renderers';
import { BUILDER_STARTER_ELEMENTS } from './schemas';
import type { BuilderStyle, CmsFormDefinition, CmsModuleDefinition, CmsRecord, ModulePlacement } from './types';

type ModuleRecord = CmsRecord & {
    id?: number;
    name?: string;
    slug?: string;
    type?: string;
    category?: string;
    status?: string;
    content?: CmsRecord | null;
    style?: BuilderStyle | null;
    settings?: CmsRecord | null;
    advanced_classes?: string | null;
    custom_css?: string | null;
    usage_count?: number;
    usage_pages?: CmsRecord[];
    revision_note?: string;
};

type ModuleTypeDefinition = { label?: string; category?: string; default_content?: CmsRecord; default_style?: BuilderStyle };

export type MadCmsModuleEditorProps = {
    module: ModuleRecord;
    forms?: CmsFormDefinition[];
    types?: Record<string, ModuleTypeDefinition> | string[];
    mode?: 'create' | 'edit';
    basePath?: string;
    mutationBasePath?: string;
    mutationsEnabled?: boolean;
    errors?: Record<string, string>;
    host?: MadCmsAdminShellHost;
};

const labelFor = (type: string, definition?: ModuleTypeDefinition) =>
    definition?.label || type.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export function MadCmsModuleEditor({
    module: initialModule,
    forms = [],
    types = {},
    mode = initialModule.id ? 'edit' : 'create',
    basePath = '/madcms',
    mutationBasePath = '/cms',
    mutationsEnabled = true,
    errors = {},
    host,
}: MadCmsModuleEditorProps) {
    const [module, setModule] = useState<ModuleRecord>(() => ({
        ...initialModule,
        content: initialModule.content || {},
        style: initialModule.style || {},
        settings: initialModule.settings || {},
    }));
    const [tab, setTab] = useState<'content' | 'design'>('content');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const typeDefinitions: Record<string, ModuleTypeDefinition> = Array.isArray(types) ? Object.fromEntries(types.map((type) => [type, {}])) : types;
    const typeNames = Object.keys(typeDefinitions);
    const type = String(module.type || typeNames[0] || 'text-block');
    const rendererDefinition = coreModuleRegistry.get(type);
    const Renderer = rendererDefinition?.renderer;
    const previewModule: CmsModuleDefinition = {
        id: Number(module.id || 0),
        name: String(module.name || 'Untitled module'),
        type,
        category: String(module.category || rendererDefinition?.category || 'content'),
        content: module.content || {},
        style: module.style || {},
        settings: module.settings || {},
        advanced_classes: module.advanced_classes,
        custom_css: module.custom_css,
    };
    const previewPlacement: ModulePlacement = {
        id: 'madcms-module-preview',
        mode: 'linked',
        module_id: previewModule.id,
        module_name: previewModule.name,
        module_type: type,
    };
    const fieldClass = 'mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm';

    const changeType = (nextType: string) => {
        const definition = typeDefinitions[nextType] || {};
        const frontend = coreModuleRegistry.get(nextType);
        const starter = BUILDER_STARTER_ELEMENTS.find((item) => item.type === nextType);
        setModule({
            ...module,
            type: nextType,
            category: definition.category || frontend?.category || module.category || 'content',
            content: definition.default_content || frontend?.defaultContent || starter?.content || {},
            style: definition.default_style || frontend?.defaultStyle || starter?.style || {},
        });
        setSaved(false);
    };

    const save = () => {
        if (!mutationsEnabled) return;
        setSaving(true);
        const options = { preserveScroll: true, onSuccess: () => setSaved(true), onFinish: () => setSaving(false) };
        if (mode === 'create') router.post(`${mutationBasePath}/modules`, module as never, options);
        else router.put(`${mutationBasePath}/modules/${module.id}`, module as never, options);
    };

    const actions = (
        <>
            <a
                href={`${basePath}/modules`}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium"
            >
                <ArrowLeft className="h-4 w-4" /> Modules
            </a>
            <button
                type="button"
                onClick={save}
                disabled={!mutationsEnabled || saving || !module.name || !module.type}
                title={mutationsEnabled ? 'Save module' : 'Enable MAD CMS admin mutations to save'}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
                {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
            </button>
        </>
    );

    return (
        <MadCmsAdminShell
            activeSection="modules"
            title={String(module.name || 'New reusable module')}
            description="Edit the master once; linked page placements inherit its content and design."
            actions={actions}
            host={host}
        >
            {!mutationsEnabled && (
                <div className="mb-4 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    This editor is read-only because package admin mutations are disabled.
                </div>
            )}
            {Object.keys(errors).length > 0 && (
                <div role="alert" className="mb-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
                    <div className="font-semibold">The module could not be saved.</div>
                    <ul className="mt-1 list-disc pl-5">
                        {Object.entries(errors).map(([key, message]) => (
                            <li key={key}>{message}</li>
                        ))}
                    </ul>
                </div>
            )}
            {(module.usage_count || 0) > 0 && (
                <div className="mb-4 border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                    Linked on {module.usage_count} page{module.usage_count === 1 ? '' : 's'}. Saved changes will update those linked placements.
                </div>
            )}
            <div className="grid gap-5 xl:grid-cols-[minmax(360px,460px)_minmax(0,1fr)]">
                <div className="space-y-4">
                    <section className="grid gap-4 border border-slate-200 bg-white p-4 sm:grid-cols-2">
                        <label className="text-sm font-medium sm:col-span-2">
                            Name
                            <input
                                className={fieldClass}
                                value={String(module.name || '')}
                                onChange={(event) => {
                                    setModule({ ...module, name: event.target.value });
                                    setSaved(false);
                                }}
                            />
                        </label>
                        <label className="text-sm font-medium">
                            Type
                            <select className={fieldClass} value={type} onChange={(event) => changeType(event.target.value)}>
                                {typeNames.map((name) => (
                                    <option key={name} value={name}>
                                        {labelFor(name, typeDefinitions[name])}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="text-sm font-medium">
                            Status
                            <select
                                className={fieldClass}
                                value={String(module.status || 'active')}
                                onChange={(event) => setModule({ ...module, status: event.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </select>
                        </label>
                        <label className="text-sm font-medium">
                            Slug
                            <input
                                className={fieldClass}
                                value={String(module.slug || '')}
                                onChange={(event) => setModule({ ...module, slug: event.target.value })}
                                placeholder="Generated from name"
                            />
                        </label>
                        <label className="text-sm font-medium">
                            Category
                            <input
                                className={fieldClass}
                                value={String(module.category || '')}
                                onChange={(event) => setModule({ ...module, category: event.target.value })}
                            />
                        </label>
                    </section>
                    <section className="border border-slate-200 bg-white">
                        <div className="flex border-b border-slate-200 bg-slate-50 p-1">
                            {(['content', 'design'] as const).map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setTab(item)}
                                    className={`h-10 flex-1 text-sm font-medium capitalize ${tab === item ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'}`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                        <div className="p-4">
                            {tab === 'content' ? (
                                <SchemaModuleFields
                                    schema={editorSchemaFor(type)}
                                    content={module.content || {}}
                                    forms={forms.map((form) => ({ id: form.id, name: form.name }))}
                                    uploadKeyPrefix={`master-${module.id || 'new'}`}
                                    onChange={(key, value) => {
                                        setModule({ ...module, content: { ...(module.content || {}), [key]: value } });
                                        setSaved(false);
                                    }}
                                />
                            ) : (
                                <div className="space-y-3">
                                    <LayoutStyleFields
                                        node="placement"
                                        style={module.style || {}}
                                        visibility={(module.style?.visibility || {}) as Record<string, boolean>}
                                        onStyleChange={(key, value) => {
                                            setModule({ ...module, style: { ...(module.style || {}), [key]: value } });
                                            setSaved(false);
                                        }}
                                        onVisibilityChange={(device, value) =>
                                            setModule({
                                                ...module,
                                                style: {
                                                    ...(module.style || {}),
                                                    visibility: { ...((module.style?.visibility as CmsRecord) || {}), [device]: value },
                                                },
                                            })
                                        }
                                    />
                                    <AdvancedStyleFields
                                        advancedClasses={String(module.advanced_classes || '')}
                                        customCss={String(module.custom_css || '')}
                                        onAdvancedClassesChange={(value) => setModule({ ...module, advanced_classes: value })}
                                        onCustomCssChange={(value) => setModule({ ...module, custom_css: value })}
                                    />
                                </div>
                            )}
                        </div>
                    </section>
                    <label className="block text-sm font-medium">
                        Revision note
                        <input
                            className={fieldClass}
                            value={String(module.revision_note || '')}
                            onChange={(event) => setModule({ ...module, revision_note: event.target.value })}
                            placeholder="Optional note for this change"
                        />
                    </label>
                </div>
                <section className="min-w-0 border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <h2 className="text-sm font-semibold">Live preview</h2>
                        <p className="mt-1 text-xs text-slate-500">The host theme may add its own fonts and surrounding page styles.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="min-h-80 min-w-[320px]">
                            {Renderer ? (
                                <Renderer placement={previewPlacement} module={previewModule} forms={forms} editor formsDisabled />
                            ) : (
                                <div className="p-8 text-sm text-amber-900">No renderer is registered for {type}.</div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </MadCmsAdminShell>
    );
}
