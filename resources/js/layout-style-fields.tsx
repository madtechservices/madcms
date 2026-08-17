import type { ReactNode } from 'react';

import type { CmsRecord } from './types';

export type LayoutStyleNode = 'placement' | 'section' | 'row' | 'column';

export type LayoutStyleOption = { label: string; value: string };

export type LayoutStyleField = {
    key: string;
    label: string;
    type?: 'text' | 'select' | 'media' | 'color' | 'spacing';
    placeholder?: string;
    defaultValue?: string;
    options?: LayoutStyleOption[];
};

export type LayoutStyleControlProps = {
    id: string;
    field: LayoutStyleField;
    value: string;
    onChange: (value: string) => void;
};

export type LayoutStyleFieldsHost = {
    renderLabel?: (label: string, controlId: string) => ReactNode;
    renderControl?: (props: LayoutStyleControlProps) => ReactNode;
    renderMediaUpload?: (uploadKey: string, onSelect: (url: string) => void) => ReactNode;
};

export type LayoutStyleFieldsProps = {
    node: LayoutStyleNode;
    style?: CmsRecord;
    advancedClasses?: string;
    advancedClassesPlaceholder?: string;
    controlIdPrefix?: string;
    uploadKey?: string;
    presetControls?: ReactNode;
    responsiveControls?: ReactNode;
    responsiveLabel?: string;
    visibility?: Record<string, boolean | undefined>;
    host?: LayoutStyleFieldsHost;
    onStyleChange: (key: string, value: string) => void;
    onAdvancedClassesChange?: (value: string) => void;
    onVisibilityChange?: (device: 'mobile' | 'tablet' | 'desktop', value: boolean) => void;
};

const textAlignment: LayoutStyleOption[] = [
    { value: '', label: 'Default' },
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
];

const backgroundSize: LayoutStyleOption[] = [
    { value: '', label: 'Default' },
    { value: 'cover', label: 'Cover' },
    { value: 'contain', label: 'Contain' },
    { value: 'auto', label: 'Auto' },
];

const backgroundPosition: LayoutStyleOption[] = [
    { value: '', label: 'Default' },
    { value: 'center', label: 'Center' },
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'left', label: 'Left' },
    { value: 'right', label: 'Right' },
];

const backgroundRepeat: LayoutStyleOption[] = [
    { value: '', label: 'Default' },
    { value: 'no-repeat', label: 'No repeat' },
    { value: 'repeat', label: 'Repeat' },
    { value: 'repeat-x', label: 'Repeat horizontal' },
    { value: 'repeat-y', label: 'Repeat vertical' },
];

const fontWeight: LayoutStyleOption[] = [
    { value: '', label: 'Default' },
    { value: '400', label: 'Regular' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semibold' },
    { value: '700', label: 'Bold' },
];

const spacing: LayoutStyleOption[] = [
    { value: '', label: 'Default' },
    { value: '0', label: 'None' },
    { value: '2rem', label: 'Small' },
    { value: '4rem', label: 'Medium' },
    { value: '6rem', label: 'Large' },
    { value: '8rem', label: 'Extra large' },
];

const sharedFields: LayoutStyleField[] = [
    { key: 'backgroundColor', label: 'Background', placeholder: '#ffffff' },
    { key: 'textColor', label: 'Text colour', placeholder: '#0f172a' },
    { key: 'textAlign', label: 'Text align', type: 'select', options: textAlignment },
    { key: 'backgroundImage', label: 'Background image', type: 'media' },
    { key: 'backgroundSize', label: 'Background size', type: 'select', options: backgroundSize },
    { key: 'backgroundPosition', label: 'Background position', type: 'select', options: backgroundPosition },
    { key: 'backgroundRepeat', label: 'Background repeat', type: 'select', options: backgroundRepeat },
];

export const LAYOUT_STYLE_SCHEMAS: Record<LayoutStyleNode, LayoutStyleField[]> = {
    placement: [
        { key: 'backgroundColor', label: 'Background', type: 'color', placeholder: '#ffffff', defaultValue: '#ffffff' },
        { key: 'textColor', label: 'Text colour', type: 'color', placeholder: '#0f172a', defaultValue: '#0f172a' },
        { key: 'accentColor', label: 'Accent colour', type: 'color', placeholder: '#2563eb', defaultValue: '#2563eb' },
        { key: 'backgroundImage', label: 'Background image', type: 'media', placeholder: '/storage/backgrounds/hero.jpg' },
        { key: 'backgroundSize', label: 'Background size', type: 'select', options: backgroundSize },
        { key: 'backgroundPosition', label: 'Background position', type: 'select', options: backgroundPosition },
        { key: 'backgroundRepeat', label: 'Background repeat', type: 'select', options: backgroundRepeat },
        { key: 'paddingTop', label: 'Padding top', type: 'spacing', options: spacing, placeholder: 'Custom, e.g. 5rem' },
        { key: 'paddingBottom', label: 'Padding bottom', type: 'spacing', options: spacing, placeholder: 'Custom, e.g. 5rem' },
        { key: 'marginTop', label: 'Margin top', type: 'spacing', options: spacing, placeholder: 'Custom, e.g. 2rem' },
        { key: 'marginBottom', label: 'Margin bottom', type: 'spacing', options: spacing, placeholder: 'Custom, e.g. 2rem' },
        { key: 'maxWidth', label: 'Max width', placeholder: 'none' },
        { key: 'borderRadius', label: 'Radius', placeholder: '0' },
        { key: 'borderWidth', label: 'Border', placeholder: '1px' },
        { key: 'borderColor', label: 'Border colour', placeholder: '#e2e8f0' },
        {
            key: 'shadow',
            label: 'Shadow',
            type: 'select',
            options: [
                { value: '', label: 'None' },
                { value: 'sm', label: 'Small' },
                { value: 'md', label: 'Medium' },
                { value: 'lg', label: 'Large' },
            ],
        },
        { key: 'textAlign', label: 'Text align', type: 'select', options: textAlignment },
        { key: 'fontSize', label: 'Font size', placeholder: 'e.g. 1rem' },
        { key: 'lineHeight', label: 'Line height', placeholder: 'e.g. 1.6' },
        { key: 'fontWeight', label: 'Font weight', type: 'select', options: fontWeight },
        {
            key: 'buttonBackgroundColor',
            label: 'Button background',
            type: 'color',
            placeholder: '#020617',
            defaultValue: '#020617',
        },
        { key: 'buttonTextColor', label: 'Button text', type: 'color', placeholder: '#ffffff', defaultValue: '#ffffff' },
        { key: 'buttonRadius', label: 'Button radius', placeholder: '999px' },
        { key: 'buttonPadding', label: 'Button padding', placeholder: '0.75rem 1.25rem' },
    ],
    section: [
        { key: 'backgroundColor', label: 'Background', type: 'color', placeholder: '#ffffff', defaultValue: '#ffffff' },
        { key: 'textColor', label: 'Text colour', type: 'color', placeholder: '#0f172a', defaultValue: '#0f172a' },
        { key: 'textAlign', label: 'Text alignment', type: 'select', options: textAlignment },
        { key: 'backgroundImage', label: 'Background image', type: 'media', placeholder: '/storage/backgrounds/section.jpg' },
        { key: 'backgroundSize', label: 'Background size', type: 'select', options: backgroundSize },
        { key: 'backgroundPosition', label: 'Background position', type: 'select', options: backgroundPosition },
        { key: 'backgroundRepeat', label: 'Background repeat', type: 'select', options: backgroundRepeat },
        { key: 'paddingTop', label: 'Padding top', type: 'select', options: spacing },
        { key: 'paddingBottom', label: 'Padding bottom', type: 'select', options: spacing },
        { key: 'maxWidth', label: 'Max width', placeholder: 'e.g. 1200px' },
        { key: 'fontSize', label: 'Font size', placeholder: 'e.g. 1rem' },
        { key: 'lineHeight', label: 'Line height', placeholder: 'e.g. 1.6' },
        { key: 'fontWeight', label: 'Font weight', type: 'select', options: fontWeight },
    ],
    row: [
        {
            key: 'gap',
            label: 'Column gap',
            type: 'select',
            defaultValue: 'gap-6',
            options: [
                { value: 'gap-0', label: 'None' },
                { value: 'gap-3', label: 'Small' },
                { value: 'gap-6', label: 'Medium' },
                { value: 'gap-10', label: 'Large' },
                { value: 'gap-16', label: 'Extra large' },
            ],
        },
        {
            key: 'alignItems',
            label: 'Align items',
            type: 'select',
            options: [
                { value: '', label: 'Default' },
                { value: 'start', label: 'Top' },
                { value: 'center', label: 'Center' },
                { value: 'end', label: 'Bottom' },
                { value: 'stretch', label: 'Stretch' },
            ],
        },
        ...sharedFields,
        { key: 'marginTop', label: 'Margin top', placeholder: 'e.g. 2rem' },
        { key: 'marginBottom', label: 'Margin bottom', placeholder: 'e.g. 2rem' },
        { key: 'fontSize', label: 'Font size', placeholder: 'e.g. 1rem' },
        { key: 'lineHeight', label: 'Line height', placeholder: 'e.g. 1.6' },
        { key: 'fontWeight', label: 'Font weight', type: 'select', options: fontWeight },
    ],
    column: [
        ...sharedFields,
        { key: 'padding', label: 'Padding', placeholder: 'e.g. 1.5rem' },
        { key: 'marginTop', label: 'Margin top', placeholder: 'e.g. 2rem' },
        { key: 'marginBottom', label: 'Margin bottom', placeholder: 'e.g. 2rem' },
        { key: 'fontSize', label: 'Font size', placeholder: 'e.g. 1rem' },
        { key: 'lineHeight', label: 'Line height', placeholder: 'e.g. 1.6' },
        { key: 'fontWeight', label: 'Font weight', type: 'select', options: fontWeight },
    ],
};

function NativeControl({ id, field, value, onChange }: LayoutStyleControlProps) {
    if (field.type === 'spacing') {
        return (
            <>
                <select
                    id={`${id}-preset`}
                    aria-label={`${field.label} preset`}
                    value={(field.options || []).some((option) => option.value === value) ? value : '__custom'}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                >
                    {!(field.options || []).some((option) => option.value === value) && <option value="__custom">Custom</option>}
                    {(field.options || []).map((option) => (
                        <option key={option.value || 'default'} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <input
                    id={id}
                    value={value}
                    placeholder={field.placeholder}
                    onChange={(event) => onChange(event.target.value)}
                    className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                />
            </>
        );
    }

    if (field.type === 'select') {
        return (
            <select
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
                {(field.options || []).map((option) => (
                    <option key={option.value || 'default'} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    }

    if (field.type === 'color') {
        return (
            <div className="flex gap-2">
                <input
                    aria-label={`${field.label} picker`}
                    type="color"
                    value={value || field.defaultValue || '#ffffff'}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-10 w-14 rounded-md border border-slate-300 bg-white p-1"
                />
                <input
                    id={id}
                    value={value}
                    placeholder={field.placeholder}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                />
            </div>
        );
    }

    return (
        <input
            id={id}
            value={value}
            placeholder={field.placeholder}
            onChange={(event) => onChange(event.target.value)}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
        />
    );
}

export function LayoutStyleFields({
    node,
    style = {},
    advancedClasses = '',
    advancedClassesPlaceholder,
    controlIdPrefix = `${node}-style`,
    uploadKey = `${node}-background`,
    presetControls,
    responsiveControls,
    responsiveLabel = 'Device overrides',
    visibility = {},
    host,
    onStyleChange,
    onAdvancedClassesChange,
    onVisibilityChange,
}: LayoutStyleFieldsProps) {
    const label = (text: string, controlId: string) =>
        host?.renderLabel?.(text, controlId) || (
            <label htmlFor={controlId} className="text-sm font-medium text-slate-900">
                {text}
            </label>
        );
    const control = (props: LayoutStyleControlProps) => host?.renderControl?.(props) || <NativeControl {...props} />;
    const wrapperClass =
        node === 'placement'
            ? 'rounded-lg border border-slate-200 p-3'
            : node === 'section'
              ? 'mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4'
              : `mb-3 rounded-lg border border-slate-200 p-3 ${node === 'column' ? 'bg-slate-50' : 'bg-white'}`;

    return (
        <div className={wrapperClass} data-style-node={node}>
            {node === 'placement' && <div className="mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">Style controls</div>}
            {presetControls}
            <div className={`grid gap-3 ${node === 'placement' || node === 'section' ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
                {LAYOUT_STYLE_SCHEMAS[node].map((field) => {
                    const controlId = `${controlIdPrefix}-${field.key}`;
                    const value = String(style[field.key] ?? (field.type === 'color' ? '' : field.defaultValue) ?? '');

                    return (
                        <div key={field.key}>
                            {label(field.label, controlId)}
                            {control({ id: controlId, field, value, onChange: (next) => onStyleChange(field.key, next) })}
                            {field.type === 'media' && host?.renderMediaUpload?.(uploadKey, (url) => onStyleChange(field.key, url))}
                        </div>
                    );
                })}
                {onAdvancedClassesChange && (
                    <div className={node === 'section' ? 'md:col-span-3' : undefined}>
                        {label('Advanced classes', `${controlIdPrefix}-advancedClasses`)}
                        {control({
                            id: `${controlIdPrefix}-advancedClasses`,
                            field: {
                                key: 'advancedClasses',
                                label: 'Advanced classes',
                                placeholder: advancedClassesPlaceholder || `Optional ${node} classes`,
                            },
                            value: advancedClasses,
                            onChange: onAdvancedClassesChange,
                        })}
                    </div>
                )}
            </div>
            {node === 'placement' && onVisibilityChange && (
                <div className="mt-3 rounded-md border bg-white p-3">
                    <div className="text-sm font-medium text-slate-900">Device visibility</div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm">
                        {(['mobile', 'tablet', 'desktop'] as const).map((device) => (
                            <label key={device} className="flex items-center gap-2 capitalize">
                                <input
                                    type="checkbox"
                                    checked={visibility[device] !== false}
                                    onChange={(event) => onVisibilityChange(device, event.target.checked)}
                                />
                                {device}
                            </label>
                        ))}
                    </div>
                </div>
            )}
            {node === 'placement' && responsiveControls && (
                <div className="mt-3 rounded-md border border-blue-200 bg-blue-50/50 p-3">
                    <div className="mb-3">
                        <div className="text-sm font-medium text-slate-900 capitalize">{responsiveLabel}</div>
                        <p className="mt-1 text-xs text-slate-600">These values only apply at the selected device breakpoint.</p>
                    </div>
                    {responsiveControls}
                </div>
            )}
        </div>
    );
}
