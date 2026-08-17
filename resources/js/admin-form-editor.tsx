import { router } from '@inertiajs/react';
import { ArrowDown, ArrowLeft, ArrowUp, Check, Copy, Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { MadCmsAdminShell, type MadCmsAdminShellHost } from './admin-shell';
import { DefaultFormControl, DefaultFormLabel, DefaultFormSubmit } from './form-renderers';
import type { CmsFormFieldDefinition, CmsRecord } from './types';

type EditableField = CmsFormFieldDefinition & {
    placeholder?: string | null;
    help_text?: string | null;
    validation_rules?: string[] | null;
    layout?: CmsRecord | null;
};
type EditableAction = { id?: number; type: string; enabled?: boolean; config?: CmsRecord | null };
type FormRecord = CmsRecord & {
    id?: number;
    name?: string;
    slug?: string;
    description?: string | null;
    status?: string;
    submit_label?: string;
    success_message?: string | null;
    spam_settings?: CmsRecord | null;
    style?: CmsRecord | null;
    fields?: EditableField[];
    actions?: EditableAction[];
    usage_count?: number;
    submissions_count?: number;
};
type TypeDefinition = { label?: string; description?: string };

export type MadCmsFormEditorProps = {
    form: FormRecord;
    fieldTypes?: Record<string, TypeDefinition> | string[];
    actionTypes?: Record<string, TypeDefinition> | string[];
    mode?: 'create' | 'edit';
    basePath?: string;
    mutationBasePath?: string;
    mutationsEnabled?: boolean;
    errors?: Record<string, string>;
    host?: MadCmsAdminShellHost;
};

const definitions = (value: Record<string, TypeDefinition> | string[]) =>
    Array.isArray(value) ? Object.fromEntries(value.map((type) => [type, {}])) : value;
const typeLabel = (type: string, definition?: TypeDefinition) =>
    definition?.label || type.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const move = <T,>(items: T[], index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= items.length) return items;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
};

export function MadCmsFormEditor({
    form: initialForm,
    fieldTypes = [],
    actionTypes = [],
    mode = initialForm.id ? 'edit' : 'create',
    basePath = '/madcms',
    mutationBasePath = '/cms',
    mutationsEnabled = true,
    errors = {},
    host,
}: MadCmsFormEditorProps) {
    const [form, setForm] = useState<FormRecord>(() => ({
        ...initialForm,
        fields: initialForm.fields || [],
        actions: initialForm.actions || [],
        spam_settings: initialForm.spam_settings || {},
        style: initialForm.style || {},
    }));
    const [tab, setTab] = useState<'fields' | 'actions' | 'appearance'>('fields');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const fieldDefinitions = definitions(fieldTypes);
    const actionDefinitions = definitions(actionTypes);
    const fieldTypeNames = Object.keys(fieldDefinitions);
    const actionTypeNames = Object.keys(actionDefinitions);
    const fields = form.fields || [];
    const actions = form.actions || [];
    const style = form.style || {};
    const spam = form.spam_settings || {};
    const fieldClass = 'mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm';

    const changed = (next: FormRecord) => {
        setForm(next);
        setSaved(false);
    };
    const updateField = (index: number, values: Partial<EditableField>) =>
        changed({ ...form, fields: fields.map((field, fieldIndex) => (fieldIndex === index ? { ...field, ...values } : field)) });
    const updateAction = (index: number, values: Partial<EditableAction>) =>
        changed({ ...form, actions: actions.map((action, actionIndex) => (actionIndex === index ? { ...action, ...values } : action)) });
    const updateActionConfig = (index: number, key: string, value: unknown) => {
        const action = actions[index];
        updateAction(index, { config: { ...(action.config || {}), [key]: value } });
    };
    const addField = () => {
        const type = fieldTypeNames[0] || 'text';
        const number = fields.length + 1;
        changed({
            ...form,
            fields: [
                ...fields,
                {
                    type,
                    label: `Field ${number}`,
                    name: `field_${number}`,
                    placeholder: '',
                    help_text: '',
                    required: false,
                    options: [],
                    layout: { width: 'half' },
                },
            ],
        });
    };
    const addAction = () => {
        const type = actionTypeNames[0] || 'database';
        changed({ ...form, actions: [...actions, { type, enabled: true, config: {} }] });
    };
    const save = () => {
        if (!mutationsEnabled) return;
        setSaving(true);
        const options = { preserveScroll: true, onSuccess: () => setSaved(true), onFinish: () => setSaving(false) };
        if (mode === 'create') router.post(`${mutationBasePath}/forms`, form as never, options);
        else router.put(`${mutationBasePath}/forms/${form.id}`, form as never, options);
    };
    const actionsHeader = (
        <>
            <a
                href={`${basePath}/forms`}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium"
            >
                <ArrowLeft className="h-4 w-4" /> Forms
            </a>
            <button
                type="button"
                onClick={save}
                disabled={!mutationsEnabled || saving || !form.name || !form.submit_label}
                title={mutationsEnabled ? 'Save form' : 'Enable MAD CMS admin mutations to save'}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
                {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
            </button>
        </>
    );
    const actionInput = (index: number, key: string, label: string, multiline = false, placeholder = '') => (
        <label className="text-sm font-medium">
            {label}
            {multiline ? (
                <textarea
                    className={`${fieldClass} min-h-24 py-2`}
                    value={String(actions[index].config?.[key] || '')}
                    placeholder={placeholder}
                    onChange={(event) => updateActionConfig(index, key, event.target.value)}
                />
            ) : (
                <input
                    className={fieldClass}
                    value={String(actions[index].config?.[key] || '')}
                    placeholder={placeholder}
                    onChange={(event) => updateActionConfig(index, key, event.target.value)}
                />
            )}
        </label>
    );

    return (
        <MadCmsAdminShell
            activeSection="forms"
            title={String(form.name || 'New form')}
            description="Build fields, validation, storage, email notifications, and follow-up actions."
            actions={actionsHeader}
            host={host}
        >
            {!mutationsEnabled && (
                <div className="mb-4 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    This editor is read-only because package admin mutations are disabled.
                </div>
            )}
            {Object.keys(errors).length > 0 && (
                <div role="alert" className="mb-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
                    <div className="font-semibold">The form could not be saved.</div>
                    <ul className="mt-1 list-disc pl-5">
                        {Object.entries(errors).map(([key, message]) => (
                            <li key={key}>{message}</li>
                        ))}
                    </ul>
                </div>
            )}
            {(form.usage_count || 0) > 0 && (
                <div className="mb-4 border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                    Embedded on {form.usage_count} page{form.usage_count === 1 ? '' : 's'}. Saved field and action changes apply to every embed.
                </div>
            )}
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="min-w-0 space-y-5">
                    <section className="grid gap-4 border border-slate-200 bg-white p-4 md:grid-cols-2">
                        <label className="text-sm font-medium">
                            Name
                            <input
                                className={fieldClass}
                                value={String(form.name || '')}
                                onChange={(event) => changed({ ...form, name: event.target.value })}
                            />
                        </label>
                        <label className="text-sm font-medium">
                            Slug
                            <input
                                className={fieldClass}
                                value={String(form.slug || '')}
                                placeholder="Generated from name"
                                onChange={(event) => changed({ ...form, slug: event.target.value })}
                            />
                        </label>
                        <label className="text-sm font-medium md:col-span-2">
                            Description
                            <textarea
                                className={`${fieldClass} min-h-20 py-2`}
                                value={String(form.description || '')}
                                onChange={(event) => changed({ ...form, description: event.target.value })}
                            />
                        </label>
                        <label className="text-sm font-medium">
                            Status
                            <select
                                className={fieldClass}
                                value={String(form.status || 'active')}
                                onChange={(event) => changed({ ...form, status: event.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                            </select>
                        </label>
                        <label className="text-sm font-medium">
                            Submit button
                            <input
                                className={fieldClass}
                                value={String(form.submit_label || '')}
                                onChange={(event) => changed({ ...form, submit_label: event.target.value })}
                            />
                        </label>
                        <label className="text-sm font-medium md:col-span-2">
                            Success message
                            <textarea
                                className={`${fieldClass} min-h-20 py-2`}
                                value={String(form.success_message || '')}
                                onChange={(event) => changed({ ...form, success_message: event.target.value })}
                            />
                        </label>
                    </section>
                    <section className="border border-slate-200 bg-white">
                        <div className="flex border-b border-slate-200 bg-slate-50 p-1">
                            {(['fields', 'actions', 'appearance'] as const).map((item) => (
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
                            {tab === 'fields' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-sm font-semibold">Fields</h2>
                                            <p className="mt-1 text-xs text-slate-500">Order and width are reflected in every form embed.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addField}
                                            className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white"
                                        >
                                            <Plus className="h-4 w-4" /> Add field
                                        </button>
                                    </div>
                                    {fields.map((field, index) => (
                                        <div key={`${field.name}-${index}`} className="border border-slate-200 bg-slate-50 p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <strong className="text-sm">{field.label || `Field ${index + 1}`}</strong>
                                                <div className="flex gap-1">
                                                    <button
                                                        type="button"
                                                        aria-label="Move field up"
                                                        disabled={index === 0}
                                                        onClick={() => changed({ ...form, fields: move(fields, index, -1) })}
                                                        className="grid h-8 w-8 place-items-center disabled:opacity-30"
                                                    >
                                                        <ArrowUp className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        aria-label="Move field down"
                                                        disabled={index === fields.length - 1}
                                                        onClick={() => changed({ ...form, fields: move(fields, index, 1) })}
                                                        className="grid h-8 w-8 place-items-center disabled:opacity-30"
                                                    >
                                                        <ArrowDown className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        aria-label="Duplicate field"
                                                        onClick={() => {
                                                            const next = [...fields];
                                                            next.splice(index + 1, 0, { ...field, name: `${field.name}_copy` });
                                                            changed({ ...form, fields: next });
                                                        }}
                                                        className="grid h-8 w-8 place-items-center"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        aria-label="Delete field"
                                                        onClick={() =>
                                                            changed({ ...form, fields: fields.filter((_, fieldIndex) => fieldIndex !== index) })
                                                        }
                                                        className="grid h-8 w-8 place-items-center text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                <label className="text-sm font-medium">
                                                    Type
                                                    <select
                                                        className={fieldClass}
                                                        value={field.type}
                                                        onChange={(event) => updateField(index, { type: event.target.value })}
                                                    >
                                                        {fieldTypeNames.map((name) => (
                                                            <option key={name} value={name}>
                                                                {typeLabel(name, fieldDefinitions[name])}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>
                                                <label className="text-sm font-medium">
                                                    Width
                                                    <select
                                                        className={fieldClass}
                                                        value={String(field.layout?.width || 'half')}
                                                        onChange={(event) =>
                                                            updateField(index, { layout: { ...(field.layout || {}), width: event.target.value } })
                                                        }
                                                    >
                                                        <option value="half">Half</option>
                                                        <option value="full">Full</option>
                                                    </select>
                                                </label>
                                                <label className="text-sm font-medium">
                                                    Label
                                                    <input
                                                        className={fieldClass}
                                                        value={field.label}
                                                        onChange={(event) => updateField(index, { label: event.target.value })}
                                                    />
                                                </label>
                                                <label className="text-sm font-medium">
                                                    Field key
                                                    <input
                                                        className={fieldClass}
                                                        value={field.name}
                                                        onChange={(event) =>
                                                            updateField(index, { name: event.target.value.replace(/[^a-zA-Z0-9_]/g, '_') })
                                                        }
                                                    />
                                                </label>
                                                <label className="text-sm font-medium">
                                                    Placeholder
                                                    <input
                                                        className={fieldClass}
                                                        value={String(field.placeholder || '')}
                                                        onChange={(event) => updateField(index, { placeholder: event.target.value })}
                                                    />
                                                </label>
                                                <label className="flex items-end gap-2 pb-2 text-sm font-medium">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!field.required}
                                                        onChange={(event) => updateField(index, { required: event.target.checked })}
                                                    />{' '}
                                                    Required
                                                </label>
                                                {['select', 'radio', 'checkbox'].includes(field.type) && (
                                                    <label className="text-sm font-medium sm:col-span-2">
                                                        Options, one per line
                                                        <textarea
                                                            className={`${fieldClass} min-h-20 py-2`}
                                                            value={(field.options || [])
                                                                .map((option) =>
                                                                    typeof option === 'string' ? option : `${option.label}|${option.value}`,
                                                                )
                                                                .join('\n')}
                                                            onChange={(event) =>
                                                                updateField(index, {
                                                                    options: event.target.value
                                                                        .split('\n')
                                                                        .map((option) => option.trim())
                                                                        .filter(Boolean),
                                                                })
                                                            }
                                                        />
                                                    </label>
                                                )}
                                                <label className="text-sm font-medium sm:col-span-2">
                                                    Help text
                                                    <input
                                                        className={fieldClass}
                                                        value={String(field.help_text || '')}
                                                        onChange={(event) => updateField(index, { help_text: event.target.value })}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {tab === 'actions' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-sm font-semibold">Submission actions</h2>
                                            <p className="mt-1 text-xs text-slate-500">Actions run in the order shown after validation.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addAction}
                                            className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white"
                                        >
                                            <Plus className="h-4 w-4" /> Add action
                                        </button>
                                    </div>
                                    {actions.map((action, index) => (
                                        <div key={`${action.type}-${index}`} className="border border-slate-200 bg-slate-50 p-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <strong className="text-sm">{typeLabel(action.type, actionDefinitions[action.type])}</strong>
                                                    <label className="flex items-center gap-2 text-xs">
                                                        <input
                                                            type="checkbox"
                                                            checked={action.enabled !== false}
                                                            onChange={(event) => updateAction(index, { enabled: event.target.checked })}
                                                        />{' '}
                                                        Enabled
                                                    </label>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        type="button"
                                                        aria-label="Move action up"
                                                        disabled={index === 0}
                                                        onClick={() => changed({ ...form, actions: move(actions, index, -1) })}
                                                        className="grid h-8 w-8 place-items-center disabled:opacity-30"
                                                    >
                                                        <ArrowUp className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        aria-label="Move action down"
                                                        disabled={index === actions.length - 1}
                                                        onClick={() => changed({ ...form, actions: move(actions, index, 1) })}
                                                        className="grid h-8 w-8 place-items-center disabled:opacity-30"
                                                    >
                                                        <ArrowDown className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        aria-label="Delete action"
                                                        onClick={() =>
                                                            changed({ ...form, actions: actions.filter((_, actionIndex) => actionIndex !== index) })
                                                        }
                                                        className="grid h-8 w-8 place-items-center text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <label className="mt-3 block text-sm font-medium">
                                                Action type
                                                <select
                                                    className={fieldClass}
                                                    value={action.type}
                                                    onChange={(event) => updateAction(index, { type: event.target.value, config: {} })}
                                                >
                                                    {actionTypeNames.map((name) => (
                                                        <option key={name} value={name}>
                                                            {typeLabel(name, actionDefinitions[name])}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                {action.type === 'email' && (
                                                    <>
                                                        {actionInput(index, 'to', 'Recipients', false, 'admin@example.com')}
                                                        {actionInput(index, 'subject', 'Subject')}
                                                        {actionInput(index, 'body', 'Email body', true)}
                                                    </>
                                                )}
                                                {action.type === 'autoresponder' && (
                                                    <>
                                                        {actionInput(index, 'to_field', 'Recipient field', false, 'email')}
                                                        {actionInput(index, 'subject', 'Subject')}
                                                        {actionInput(index, 'body', 'Email body', true)}
                                                    </>
                                                )}
                                                {action.type === 'webhook' && (
                                                    <>
                                                        {actionInput(index, 'url', 'Webhook URL', false, 'https://...')}
                                                        {actionInput(index, 'timeout', 'Timeout seconds', false, '10')}
                                                    </>
                                                )}
                                                {action.type === 'database' && (
                                                    <p className="text-sm text-slate-600 sm:col-span-2">
                                                        Stores the validated submission and request metadata in MAD CMS.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {tab === 'appearance' && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="text-sm font-medium">
                                        Background colour
                                        <input
                                            type="color"
                                            className={fieldClass}
                                            value={String(style.backgroundColor || '#ffffff')}
                                            onChange={(event) => changed({ ...form, style: { ...style, backgroundColor: event.target.value } })}
                                        />
                                    </label>
                                    <label className="text-sm font-medium">
                                        Text colour
                                        <input
                                            type="color"
                                            className={fieldClass}
                                            value={String(style.textColor || '#0f172a')}
                                            onChange={(event) => changed({ ...form, style: { ...style, textColor: event.target.value } })}
                                        />
                                    </label>
                                    <label className="text-sm font-medium">
                                        Field radius
                                        <input
                                            className={fieldClass}
                                            value={String(style.fieldRadius || '0.375rem')}
                                            onChange={(event) => changed({ ...form, style: { ...style, fieldRadius: event.target.value } })}
                                        />
                                    </label>
                                    <label className="text-sm font-medium">
                                        Button background
                                        <input
                                            type="color"
                                            className={fieldClass}
                                            value={String(style.buttonBackgroundColor || '#020617')}
                                            onChange={(event) => changed({ ...form, style: { ...style, buttonBackgroundColor: event.target.value } })}
                                        />
                                    </label>
                                    <label className="text-sm font-medium">
                                        Button text
                                        <input
                                            type="color"
                                            className={fieldClass}
                                            value={String(style.buttonTextColor || '#ffffff')}
                                            onChange={(event) => changed({ ...form, style: { ...style, buttonTextColor: event.target.value } })}
                                        />
                                    </label>
                                    <label className="text-sm font-medium">
                                        Button radius
                                        <input
                                            className={fieldClass}
                                            value={String(style.buttonRadius || '999px')}
                                            onChange={(event) => changed({ ...form, style: { ...style, buttonRadius: event.target.value } })}
                                        />
                                    </label>
                                    <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
                                        <input
                                            type="checkbox"
                                            checked={spam.honeypot_enabled !== false}
                                            onChange={(event) =>
                                                changed({ ...form, spam_settings: { ...spam, honeypot_enabled: event.target.checked } })
                                            }
                                        />{' '}
                                        Enable honeypot spam protection
                                    </label>
                                    <label className="text-sm font-medium">
                                        Minimum completion time
                                        <input
                                            type="number"
                                            min="0"
                                            className={fieldClass}
                                            value={String(spam.minimum_seconds || 0)}
                                            onChange={(event) =>
                                                changed({ ...form, spam_settings: { ...spam, minimum_seconds: Number(event.target.value) } })
                                            }
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
                <aside className="self-start border border-slate-200 bg-white xl:sticky xl:top-4">
                    <div className="border-b border-slate-200 px-4 py-3">
                        <h2 className="text-sm font-semibold">Form preview</h2>
                        <p className="mt-1 text-xs text-slate-500">Submission is disabled while editing.</p>
                    </div>
                    <div
                        className="p-5"
                        style={{
                            backgroundColor: String(style.backgroundColor || '#ffffff'),
                            color: String(style.textColor || '#0f172a'),
                            borderRadius: String(style.borderRadius || '0'),
                        }}
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            {fields.map((field, index) => {
                                const controlId = `madcms-form-preview-${index}`;
                                return (
                                    <div
                                        key={`${field.name}-${index}`}
                                        className={field.layout?.width === 'full' || field.type === 'textarea' ? 'md:col-span-2' : ''}
                                    >
                                        {!['hidden', 'checkbox', 'consent'].includes(field.type) && (
                                            <DefaultFormLabel field={field} controlId={controlId} />
                                        )}
                                        <div className="mt-1" style={{ borderRadius: String(style.fieldRadius || '0.375rem'), overflow: 'hidden' }}>
                                            <DefaultFormControl
                                                field={field}
                                                value={field.type === 'checkbox' || field.type === 'consent' ? false : ''}
                                                controlId={controlId}
                                                onChange={() => undefined}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            <div
                                className="md:col-span-2"
                                style={
                                    { '--madcms-preview-button-background': String(style.buttonBackgroundColor || '#020617') } as React.CSSProperties
                                }
                            >
                                <DefaultFormSubmit label={String(form.submit_label || 'Submit')} processing={false} disabled />
                            </div>
                        </div>
                        {fields.length === 0 && (
                            <div className="border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                                Add the first field to preview this form.
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </MadCmsAdminShell>
    );
}
