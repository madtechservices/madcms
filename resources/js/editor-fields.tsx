import { ArrowDown, ArrowUp, Copy, Trash2 } from 'lucide-react';
import { Fragment, type ChangeEvent, type ReactNode } from 'react';

import type { ModuleEditorField, ModuleEditorSchema, ModuleEditorSubfield } from './editor-schemas';
import type { CmsRecord } from './types';

type EditableField = ModuleEditorField | ModuleEditorSubfield;

export type EditorFieldControlProps = {
    field: EditableField;
    value: unknown;
    forms: EditorFormOption[];
    controlId: string;
    uploadKey: string;
    onChange: (value: unknown) => void;
};

export type EditorFormOption = { id: number; name: string };

export type EditorFieldActionProps = {
    label: string;
    icon?: ReactNode;
    children?: ReactNode;
    disabled?: boolean;
    size?: 'sm' | 'icon';
    onClick: () => void;
};

export type SchemaModuleFieldsHost = {
    renderLabel?: (label: string, fieldKey: string) => ReactNode;
    renderControl?: (props: EditorFieldControlProps) => ReactNode;
    renderAction?: (props: EditorFieldActionProps) => ReactNode;
};

export type SchemaModuleFieldsProps = {
    schema?: ModuleEditorSchema;
    content: CmsRecord;
    forms?: EditorFormOption[];
    uploadKeyPrefix?: string;
    host?: SchemaModuleFieldsHost;
    onChange: (key: string, value: unknown) => void;
};

function moveItem<T>(items: T[], index: number, offset: number) {
    const target = index + offset;
    if (target < 0 || target >= items.length) return items;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
}

function NativeAction({ label, icon, children, disabled, size = 'sm', onClick }: EditorFieldActionProps) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            aria-label={label}
            className={`inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 ${size === 'icon' ? 'h-9 w-9' : 'h-9 px-3'}`}
        >
            {icon}
            {children}
        </button>
    );
}

function NativeControl({ field, value, forms, controlId, onChange }: EditorFieldControlProps) {
    const type = field.type || 'text';
    const change = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(event.target.value);
    const className = 'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm';

    if (type === 'textarea' || type === 'rich-text')
        return <textarea id={controlId} value={String(value ?? '')} onChange={change} className={`${className} min-h-24 py-2`} />;
    if (type === 'checkbox')
        return <input id={controlId} type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />;
    if (type === 'select' && 'options' in field)
        return (
            <select id={controlId} value={String(value ?? '')} onChange={change} className={className}>
                {(field.options || []).map((option) => (
                    <option key={String(option.value)} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    if (type === 'form')
        return (
            <select id={controlId} value={String(value ?? '')} onChange={change} className={className}>
                <option value="">Select a form</option>
                {forms.map((form) => (
                    <option key={form.id} value={form.id}>
                        {form.name}
                    </option>
                ))}
            </select>
        );
    return (
        <input
            id={controlId}
            value={String(value ?? '')}
            onChange={change}
            className={className}
            type={type === 'number' ? 'number' : type === 'url' || type === 'media' ? 'url' : 'text'}
            placeholder={'placeholder' in field ? field.placeholder : undefined}
        />
    );
}

function fieldValue(content: CmsRecord, field: ModuleEditorField) {
    if (content[field.key] !== undefined) return content[field.key];
    for (const alias of field.aliases || []) if (content[alias] !== undefined) return content[alias];
    return field.defaultValue ?? '';
}

export function SchemaModuleFields({ schema, content, forms = [], uploadKeyPrefix = 'module', host, onChange }: SchemaModuleFieldsProps) {
    if (!schema)
        return <div className="text-sm text-slate-500">This module type does not have guided fields yet. Use the advanced JSON editor below.</div>;

    const controlId = (suffix: string) => `${uploadKeyPrefix}-${suffix}`.replace(/[^a-zA-Z0-9_-]/g, '-');
    const label = (text: string, key: string) =>
        host?.renderLabel?.(text, controlId(key)) || (
            <label htmlFor={controlId(key)} className="text-sm font-medium text-slate-900">
                {text}
            </label>
        );
    const control = (field: EditableField, value: unknown, update: (next: unknown) => void, suffix = field.key) => {
        const props = { field, value, forms, controlId: controlId(suffix), uploadKey: `${uploadKeyPrefix}-${suffix}`, onChange: update };
        return host?.renderControl ? host.renderControl(props) : <NativeControl {...props} />;
    };
    const action = (props: EditorFieldActionProps) => (host?.renderAction ? host.renderAction(props) : <NativeAction {...props} />);

    return (
        <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-3">
            <div className="mb-3 text-xs font-semibold tracking-wider text-blue-700 uppercase">Content fields</div>
            <div className="grid gap-3 md:grid-cols-2">
                {schema.fields.map((field) => {
                    const value = fieldValue(content, field);

                    if (field.type === 'string-list') {
                        const items = Array.isArray(value) ? value.map(String) : [];
                        return (
                            <div key={field.key} className="rounded-lg border border-slate-200 bg-white p-3 md:col-span-2">
                                <div className="flex items-center justify-between gap-3">
                                    {label(field.label, field.key)}
                                    {action({
                                        label: `Add ${field.label} item`,
                                        children: 'Add',
                                        onClick: () => onChange(field.key, [...items, '']),
                                    })}
                                </div>
                                <div className="mt-3 space-y-2">
                                    {items.map((item, index) => (
                                        <div key={`${field.key}-${index}`} className="flex gap-2">
                                            <div className="min-w-0 flex-1">
                                                {control(
                                                    { key: field.key, label: field.label, type: 'text' },
                                                    item,
                                                    (next) =>
                                                        onChange(
                                                            field.key,
                                                            items.map((current, itemIndex) => (itemIndex === index ? String(next ?? '') : current)),
                                                        ),
                                                    `${field.key}-${index}`,
                                                )}
                                            </div>
                                            {action({
                                                label: `Move ${field.label} item up`,
                                                icon: <ArrowUp className="h-4 w-4" />,
                                                disabled: index === 0,
                                                size: 'icon',
                                                onClick: () => onChange(field.key, moveItem(items, index, -1)),
                                            })}
                                            {action({
                                                label: `Move ${field.label} item down`,
                                                icon: <ArrowDown className="h-4 w-4" />,
                                                disabled: index === items.length - 1,
                                                size: 'icon',
                                                onClick: () => onChange(field.key, moveItem(items, index, 1)),
                                            })}
                                            {action({
                                                label: `Duplicate ${field.label} item`,
                                                icon: <Copy className="h-4 w-4" />,
                                                size: 'icon',
                                                onClick: () => {
                                                    const next = [...items];
                                                    next.splice(index + 1, 0, item);
                                                    onChange(field.key, next);
                                                },
                                            })}
                                            {action({
                                                label: `Remove ${field.label} item`,
                                                icon: <Trash2 className="h-4 w-4" />,
                                                size: 'icon',
                                                onClick: () =>
                                                    onChange(
                                                        field.key,
                                                        items.filter((_, itemIndex) => itemIndex !== index),
                                                    ),
                                            })}
                                        </div>
                                    ))}
                                    {items.length === 0 && (
                                        <div className="rounded border border-dashed p-3 text-xs text-slate-500">
                                            No {field.label.toLowerCase()} yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    if (field.type === 'object-list') {
                        const items = Array.isArray(value) ? (value as CmsRecord[]) : [];
                        const emptyItem = (field.defaultValue && typeof field.defaultValue === 'object' ? field.defaultValue : {}) as CmsRecord;
                        return (
                            <div key={field.key} className="rounded-lg border border-slate-200 bg-white p-3 md:col-span-2">
                                <div className="flex items-center justify-between gap-3">
                                    {label(field.label, field.key)}
                                    {action({
                                        label: `Add ${field.label} item`,
                                        children: 'Add',
                                        onClick: () => onChange(field.key, [...items, structuredClone(emptyItem)]),
                                    })}
                                </div>
                                <div className="mt-3 space-y-3">
                                    {items.map((item, index) => (
                                        <div key={`${field.key}-${index}`} className="rounded-md border bg-slate-50 p-3">
                                            <div className="grid gap-3 md:grid-cols-2">
                                                {(field.fields || []).map((subfield) => (
                                                    <div
                                                        key={subfield.key}
                                                        className={subfield.type === 'textarea' || subfield.type === 'media' ? 'md:col-span-2' : ''}
                                                    >
                                                        {label(subfield.label, `${field.key}-${index}-${subfield.key}`)}
                                                        {control(
                                                            subfield,
                                                            item?.[subfield.key] ?? '',
                                                            (next) =>
                                                                onChange(
                                                                    field.key,
                                                                    items.map((current, itemIndex) =>
                                                                        itemIndex === index ? { ...current, [subfield.key]: next } : current,
                                                                    ),
                                                                ),
                                                            `${field.key}-${index}-${subfield.key}`,
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {[
                                                    action({
                                                        label: `Move ${field.label} item up`,
                                                        icon: <ArrowUp className="h-4 w-4" />,
                                                        disabled: index === 0,
                                                        size: 'icon',
                                                        onClick: () => onChange(field.key, moveItem(items, index, -1)),
                                                    }),
                                                    action({
                                                        label: `Move ${field.label} item down`,
                                                        icon: <ArrowDown className="h-4 w-4" />,
                                                        disabled: index === items.length - 1,
                                                        size: 'icon',
                                                        onClick: () => onChange(field.key, moveItem(items, index, 1)),
                                                    }),
                                                    action({
                                                        label: `Duplicate ${field.label} item`,
                                                        icon: <Copy className="h-4 w-4" />,
                                                        children: 'Duplicate',
                                                        onClick: () => {
                                                            const next = [...items];
                                                            next.splice(index + 1, 0, structuredClone(item || emptyItem));
                                                            onChange(field.key, next);
                                                        },
                                                    }),
                                                    action({
                                                        label: `Remove ${field.label} item`,
                                                        icon: <Trash2 className="h-4 w-4" />,
                                                        children: 'Remove',
                                                        onClick: () =>
                                                            onChange(
                                                                field.key,
                                                                items.filter((_, itemIndex) => itemIndex !== index),
                                                            ),
                                                    }),
                                                ].map((node, actionIndex) => (
                                                    <Fragment key={actionIndex}>{node}</Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {items.length === 0 && (
                                        <div className="rounded border border-dashed p-3 text-xs text-slate-500">
                                            No {field.label.toLowerCase()} yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    const update = (next: unknown) => {
                        if (field.type === 'number' || field.type === 'form') {
                            onChange(field.key, next === '' ? '' : Number(next));
                            return;
                        }
                        if (field.type === 'select' && field.options?.some((option) => typeof option.value === 'number')) {
                            const selected = field.options.find((option) => String(option.value) === String(next));
                            onChange(field.key, selected?.value ?? next);
                            return;
                        }
                        onChange(field.key, next);
                    };
                    return (
                        <div key={field.key} className={field.width === 'half' ? '' : 'md:col-span-2'}>
                            {field.type === 'checkbox' ? (
                                <label className="flex items-center gap-2 text-sm">
                                    {control(field, value, update)}
                                    <span>{field.label}</span>
                                </label>
                            ) : (
                                <>
                                    {label(field.label, field.key)}
                                    {control(field, value, update)}
                                </>
                            )}
                            {field.help && <p className="mt-1 text-xs text-slate-500">{field.help}</p>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
