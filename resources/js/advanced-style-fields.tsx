import type { ReactNode } from 'react';

export type AdvancedStyleControlProps = {
    id: string;
    label: string;
    multiline?: boolean;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
};

export type AdvancedStyleFieldsHost = {
    renderLabel?: (label: string, controlId: string) => ReactNode;
    renderControl?: (props: AdvancedStyleControlProps) => ReactNode;
};

export type AdvancedStyleFieldsProps = {
    advancedClasses?: string;
    customCss?: string;
    controlIdPrefix?: string;
    defaultOpen?: boolean;
    host?: AdvancedStyleFieldsHost;
    onAdvancedClassesChange: (value: string) => void;
    onCustomCssChange: (value: string) => void;
};

function NativeControl({ id, label, multiline, placeholder, value, onChange }: AdvancedStyleControlProps) {
    const className = `mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ${multiline ? 'min-h-28 font-mono text-xs' : ''}`;

    return multiline ? (
        <textarea
            id={id}
            aria-label={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className={className}
        />
    ) : (
        <input
            id={id}
            aria-label={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className={className}
        />
    );
}

export function AdvancedStyleFields({
    advancedClasses = '',
    customCss = '',
    controlIdPrefix = 'madcms-advanced-style',
    defaultOpen = false,
    host,
    onAdvancedClassesChange,
    onCustomCssChange,
}: AdvancedStyleFieldsProps) {
    const label = (text: string, id: string) =>
        host?.renderLabel?.(text, id) || (
            <label htmlFor={id} className="text-sm font-medium text-slate-900">
                {text}
            </label>
        );
    const control = (props: AdvancedStyleControlProps) => host?.renderControl?.(props) || <NativeControl {...props} />;
    const hasValues = Boolean(advancedClasses.trim() || customCss.trim());
    const classesId = `${controlIdPrefix}-classes`;
    const cssId = `${controlIdPrefix}-css`;

    return (
        <details className="rounded-lg border border-slate-200 bg-slate-50" open={defaultOpen || hasValues || undefined} data-advanced-style-fields>
            <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-900">
                Advanced styling{hasValues ? ' (active)' : ''}
            </summary>
            <div className="grid gap-3 border-t border-slate-200 p-3">
                <div>
                    {label('Advanced classes', classesId)}
                    {control({
                        id: classesId,
                        label: 'Advanced classes',
                        value: advancedClasses,
                        placeholder: 'Optional Tailwind or utility classes',
                        onChange: onAdvancedClassesChange,
                    })}
                    <p className="mt-1 text-xs text-slate-500">Applied to this component wrapper.</p>
                </div>
                <div>
                    {label('Scoped custom CSS', cssId)}
                    {control({
                        id: cssId,
                        label: 'Scoped custom CSS',
                        multiline: true,
                        value: customCss,
                        placeholder: 'CSS declarations or selectors. Use :host for this component wrapper.',
                        onChange: onCustomCssChange,
                    })}
                    <p className="mt-1 text-xs text-slate-500">CSS is scoped to this component. Scripts and HTML are not accepted here.</p>
                </div>
            </div>
        </details>
    );
}
