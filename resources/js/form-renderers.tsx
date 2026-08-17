import { useForm, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Fragment, type CSSProperties, type FormEvent } from 'react';

import type { RuntimeModule, RuntimePlacement } from './runtime';
import { mergeContent, moduleClass, moduleStyle, safeLinkHref } from './runtime';
import type {
    BuilderHost,
    CmsFormDefinition,
    CmsRecord,
    FormControlRenderProps,
    FormLabelRenderProps,
    FormSubmitRenderProps,
    ModuleRendererProps,
    ModuleTypeDefinition,
} from './types';

export const FORM_MODULE_RENDERER_TYPES = ['form-embed'] as const;

export type FormModuleRendererType = (typeof FORM_MODULE_RENDERER_TYPES)[number];

export type CmsFormRendererProps = {
    form?: CmsFormDefinition;
    pageId?: number | null;
    disabled?: boolean;
    host?: BuilderHost;
};

export type FormEmbedModuleRendererProps = {
    placement: RuntimePlacement & { module_type: FormModuleRendererType };
    module?: RuntimeModule;
    forms: CmsFormDefinition[];
    pageId?: number | null;
    viewport?: 'desktop' | 'tablet' | 'mobile';
    disabled?: boolean;
    host?: BuilderHost;
};

function fieldOptions(field: FormControlRenderProps['field']) {
    return (field.options || []).map((option) => (typeof option === 'string' ? { label: option, value: option } : option));
}

export function DefaultFormControl({ field, value, controlId, errorId, onChange }: FormControlRenderProps) {
    const invalid = Boolean(errorId);

    if (field.type === 'textarea') {
        return (
            <textarea
                id={controlId}
                name={field.name}
                value={String(value || '')}
                onChange={(event) => onChange(event.target.value)}
                placeholder={field.placeholder || ''}
                required={field.required}
                aria-invalid={invalid}
                aria-describedby={errorId}
                className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                style={{
                    borderRadius: 'var(--madcms-form-field-radius, 0.375rem)',
                    backgroundColor: 'var(--madcms-form-field-background, #fff)',
                    color: 'var(--madcms-form-text, #0f172a)',
                }}
            />
        );
    }

    if (field.type === 'select') {
        return (
            <select
                id={controlId}
                name={field.name}
                value={String(value || '')}
                onChange={(event) => onChange(event.target.value)}
                required={field.required}
                aria-invalid={invalid}
                aria-describedby={errorId}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
                style={{
                    borderRadius: 'var(--madcms-form-field-radius, 0.375rem)',
                    backgroundColor: 'var(--madcms-form-field-background, #fff)',
                    color: 'var(--madcms-form-text, #0f172a)',
                }}
            >
                <option value="">Select...</option>
                {fieldOptions(field).map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    }

    if (field.type === 'radio') {
        return (
            <div role="radiogroup" aria-label={field.label} aria-invalid={invalid} aria-describedby={errorId} className="space-y-2">
                {fieldOptions(field).map((option, index) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm">
                        <input
                            type="radio"
                            name={field.name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={(event) => onChange(event.target.value)}
                            required={field.required && index === 0}
                        />
                        <span>{option.label}</span>
                    </label>
                ))}
            </div>
        );
    }

    if (field.type === 'checkbox' || field.type === 'consent') {
        return (
            <label htmlFor={controlId} className="flex items-start gap-3 text-sm">
                <input
                    id={controlId}
                    name={field.name}
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(event) => onChange(event.target.checked)}
                    required={field.required}
                    aria-invalid={invalid}
                    aria-describedby={errorId}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300"
                />
                <span>{field.help_text || field.label}</span>
            </label>
        );
    }

    if (field.type === 'hidden') {
        return <input type="hidden" name={field.name} value={String(value || '')} onChange={(event) => onChange(event.target.value)} />;
    }

    const type = field.type === 'phone' ? 'tel' : field.type;
    const autoComplete = field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.name === 'name' ? 'name' : undefined;

    return (
        <input
            id={controlId}
            name={field.name}
            type={type}
            value={String(value || '')}
            onChange={(event) => onChange(event.target.value)}
            placeholder={field.placeholder || ''}
            required={field.required}
            autoComplete={autoComplete}
            aria-invalid={invalid}
            aria-describedby={errorId}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"
            style={{
                borderRadius: 'var(--madcms-form-field-radius, 0.375rem)',
                backgroundColor: 'var(--madcms-form-field-background, #fff)',
                color: 'var(--madcms-form-text, #0f172a)',
            }}
        />
    );
}

export function DefaultFormLabel({ field, controlId }: FormLabelRenderProps) {
    return (
        <label htmlFor={controlId} className="text-sm font-medium text-slate-700" style={{ color: 'var(--madcms-form-text, #334155)' }}>
            {field.label}
        </label>
    );
}

export function DefaultFormSubmit({ label, processing, disabled }: FormSubmitRenderProps) {
    return (
        <button
            type="submit"
            className="cms-builder-button inline-flex h-10 items-center justify-center gap-2 rounded-full bg-slate-950 px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50"
            style={{
                backgroundColor: 'var(--madcms-form-button-background, #020617)',
                color: 'var(--madcms-form-button-text, #fff)',
                borderRadius: 'var(--madcms-form-button-radius, 999px)',
            }}
            disabled={processing || disabled}
        >
            {label} <ArrowRight className="h-4 w-4" />
        </button>
    );
}

export function CmsFormRenderer({ form, pageId, disabled = false, host }: CmsFormRendererProps) {
    const initial = Object.fromEntries(
        (form?.fields || []).map((field) => [field.name, field.type === 'checkbox' || field.type === 'consent' ? false : '']),
    );
    const { data, setData, post, processing, errors } = useForm({
        ...initial,
        _page_id: pageId || '',
        _form_started_at: String(Date.now()),
        website: '',
    });

    if (!form) {
        return <div className="rounded-xl border border-dashed p-5 text-sm text-slate-500">Select a form in the module settings.</div>;
    }

    const visual = form.style || {};
    const visualStyle = {
        '--madcms-form-text': String(visual.textColor || '#334155'),
        '--madcms-form-field-radius': String(visual.fieldRadius || '0.375rem'),
        '--madcms-form-field-background': String(visual.fieldBackgroundColor || '#ffffff'),
        '--madcms-form-button-background': String(visual.buttonBackgroundColor || '#020617'),
        '--madcms-form-button-text': String(visual.buttonTextColor || '#ffffff'),
        '--madcms-form-button-radius': String(visual.buttonRadius || '999px'),
        backgroundColor: visual.backgroundColor ? String(visual.backgroundColor) : undefined,
        color: String(visual.textColor || '#334155'),
        padding: visual.padding ? String(visual.padding) : undefined,
        borderRadius: visual.borderRadius ? String(visual.borderRadius) : undefined,
        gap: visual.gap ? String(visual.gap) : undefined,
    } as CSSProperties;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        if (disabled) return;

        post(host?.resolveFormSubmitUrl?.(form, pageId) || `/forms/${form.id}`, { preserveScroll: true });
    };

    return (
        <form
            onSubmit={submit}
            aria-label={form.name}
            aria-busy={processing}
            className="grid gap-4 text-slate-900 md:grid-cols-2 [&_input]:!border-slate-300 [&_textarea]:!border-slate-300"
            style={visualStyle}
        >
            <input type="hidden" name="_form_started_at" value={String((data as Record<string, unknown>)._form_started_at || '')} readOnly />
            <input
                type="text"
                name="website"
                value={String((data as Record<string, unknown>).website || '')}
                onChange={(event) => setData('website' as never, event.target.value as never)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
            />
            {form.fields.map((field) => {
                const controlId = `cms-form-${form.id}-${field.name.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
                const error = (errors as Record<string, string>)[field.name];
                const errorId = error ? `${controlId}-error` : undefined;
                const controlProps: FormControlRenderProps = {
                    field,
                    value: (data as Record<string, unknown>)[field.name],
                    controlId,
                    errorId,
                    onChange: (value) => setData(field.name as never, value as never),
                };

                return (
                    <div
                        key={field.name}
                        className={`space-y-2 ${field.layout?.width === 'full' || field.type === 'textarea' ? 'md:col-span-2' : ''}`}
                    >
                        {field.type !== 'hidden' &&
                            field.type !== 'checkbox' &&
                            field.type !== 'consent' &&
                            (host?.renderFormLabel ? (
                                <Fragment>{host.renderFormLabel({ field, controlId: field.type === 'radio' ? undefined : controlId })}</Fragment>
                            ) : (
                                <DefaultFormLabel field={field} controlId={field.type === 'radio' ? undefined : controlId} />
                            ))}
                        {host?.renderFormControl ? (
                            <Fragment>{host.renderFormControl(controlProps)}</Fragment>
                        ) : (
                            <DefaultFormControl {...controlProps} />
                        )}
                        {error && (
                            <div id={errorId} className="text-destructive text-sm" role="alert">
                                {error}
                            </div>
                        )}
                    </div>
                );
            })}
            <div className="md:col-span-2">
                {host?.renderFormSubmit ? (
                    <Fragment>{host.renderFormSubmit({ label: form.submit_label, processing, disabled })}</Fragment>
                ) : (
                    <DefaultFormSubmit label={form.submit_label} processing={processing} disabled={disabled} />
                )}
            </div>
        </form>
    );
}

export function FormEmbedModuleRenderer({ placement, module, forms, pageId, viewport, disabled = false, host }: FormEmbedModuleRendererProps) {
    const content = mergeContent(placement, module);
    const className = moduleClass(placement, module, !viewport);
    const style = moduleStyle(placement, module, viewport);
    const form = forms.find((item) => item.id === Number(content.form_id));
    const contactItems = Array.isArray(content.contact_items) ? content.contact_items : [];
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;

    return (
        <section className={`bg-slate-50 py-20 ${className}`} style={style}>
            <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
                <div>
                    <p className="text-sm font-semibold tracking-[0.28em] text-blue-700 uppercase">{content.eyebrow}</p>
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-950">{content.title}</h2>
                    <p className="mt-3 leading-7 text-slate-600">{content.description}</p>
                    {contactItems.length > 0 && (
                        <div className="mt-6 space-y-3 text-sm text-slate-600">
                            {contactItems.map((item: CmsRecord, index: number) => (
                                <div key={String(item.label || index)} className="flex gap-3">
                                    <span className="font-semibold text-slate-950">{String(item.label || '')}</span>
                                    {item.href ? (
                                        <a href={safeLinkHref(String(item.href))} className="text-blue-700 hover:text-blue-900">
                                            {String(item.text || '')}
                                        </a>
                                    ) : (
                                        <span>{String(item.text || '')}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{flash.success}</div>
                    )}
                    <CmsFormRenderer form={form} pageId={pageId} disabled={disabled} host={host} />
                </div>
            </div>
        </section>
    );
}

export function RegisteredFormModuleRenderer({ placement, module, forms, pageId, viewport, formsDisabled, host }: ModuleRendererProps) {
    if (!FORM_MODULE_RENDERER_TYPES.includes(placement.module_type as FormModuleRendererType)) return null;

    return (
        <FormEmbedModuleRenderer
            placement={placement as FormEmbedModuleRendererProps['placement']}
            module={module}
            forms={forms}
            pageId={pageId}
            viewport={viewport}
            disabled={formsDisabled}
            host={host}
        />
    );
}

export const FORM_MODULE_DEFINITIONS: ModuleTypeDefinition[] = [
    {
        type: 'form-embed',
        label: 'Form',
        category: 'forms',
        renderer: RegisteredFormModuleRenderer,
    },
];
