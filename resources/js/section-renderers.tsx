import { ArrowRight, BarChart3, CheckCircle2, Clock3, LockKeyhole, MessageSquareText, Quote, Sparkles, Zap } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';

import type { RuntimeModule, RuntimePlacement } from './runtime';
import { mergeContent, moduleClass, moduleStyle, safeLinkHref } from './runtime';
import type { BuilderHost, CmsRecord, ModuleRendererProps, ModuleTypeDefinition } from './types';

export const SECTION_MODULE_RENDERER_TYPES = ['service-cards', 'testimonial-grid', 'portal-cta', 'feature-split', 'faq'] as const;

export type SectionModuleRendererType = (typeof SECTION_MODULE_RENDERER_TYPES)[number];

export type SectionModuleRendererProps = {
    placement: RuntimePlacement & { module_type: SectionModuleRendererType };
    module?: RuntimeModule;
    viewport?: 'desktop' | 'tablet' | 'mobile';
    host?: BuilderHost;
};

function resolvedItems(host: BuilderHost | undefined, type: string, value: unknown, content: CmsRecord): CmsRecord[] {
    const items = Array.isArray(value) ? value.map((item) => (typeof item === 'string' ? { text: item } : item)) : [];

    return host?.resolveModuleItems?.(type, items, content) || items;
}

function renderLink(host: BuilderHost | undefined, href: string, children: ReactNode, className: string) {
    if (host?.renderLink) return <Fragment>{host.renderLink(href, children, { className })}</Fragment>;

    return (
        <a href={href} className={className}>
            {children}
        </a>
    );
}

function renderButtonLink(host: BuilderHost | undefined, href: string, children: ReactNode, className: string) {
    if (host?.renderButtonLink) return <Fragment>{host.renderButtonLink(href, children, { className, size: 'lg' })}</Fragment>;

    return (
        <a href={href} className={`inline-flex h-11 items-center justify-center gap-2 px-8 text-sm font-medium ${className}`}>
            {children}
        </a>
    );
}

export function SectionModuleRenderer({ placement, module, viewport, host }: SectionModuleRendererProps) {
    const content = mergeContent(placement, module);
    const className = moduleClass(placement, module, !viewport);
    const style = moduleStyle(placement, module, viewport);

    if (placement.module_type === 'service-cards') {
        const cards = resolvedItems(host, placement.module_type, content.items, content);

        return (
            <section className={`bg-white py-24 ${className}`} id="services" style={style}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.28em] text-blue-700 uppercase">{content.eyebrow}</p>
                            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{content.title}</h2>
                        </div>
                        <p className="text-lg leading-8 text-slate-600">{content.description}</p>
                    </div>
                    <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {cards.map((service, index) => {
                            const href = safeLinkHref(String(service.href || (service.slug ? `/services/${service.slug}` : '#')));
                            const title = String(service.shortTitle || service.short_title || service.title || 'Service');
                            const image = String(service.image || 'from-blue-500 to-cyan-400');
                            const icon = host?.renderModuleIcon?.(placement.module_type, service, index, { className: 'h-9 w-9' });

                            return (
                                <Fragment key={String(service.slug || service.href || index)}>
                                    {renderLink(
                                        host,
                                        href,
                                        <>
                                            <div
                                                className={`relative flex flex-col items-center justify-center gap-4 bg-gradient-to-br ${image} px-6 py-10 text-center text-white`}
                                            >
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.25),transparent_55%)]" />
                                                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur">
                                                    {icon || <Sparkles className="h-9 w-9" />}
                                                </div>
                                                <h3 className="relative text-xl font-semibold tracking-tight text-white">{title}</h3>
                                            </div>
                                            <div className="flex flex-1 flex-col items-center px-6 py-6 text-center">
                                                <p className="text-sm leading-6 text-slate-600">{String(service.description || '')}</p>
                                                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                                                    {String(service.link_label || 'Learn more')}{' '}
                                                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </>,
                                        'group flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl',
                                    )}
                                </Fragment>
                            );
                        })}
                    </div>
                </div>
            </section>
        );
    }

    if (placement.module_type === 'testimonial-grid') {
        const items = resolvedItems(host, placement.module_type, content.items, content);

        return (
            <section className={`bg-white py-24 ${className}`} aria-label="What clients say" style={style}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.28em] text-blue-700 uppercase">{content.eyebrow || 'What clients say'}</p>
                            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                                {content.title || 'Calmer technology. Clearer business.'}
                            </h2>
                        </div>
                        <p className="text-lg leading-8 text-slate-600">{content.description}</p>
                    </div>
                    <div className="mt-12 grid gap-6 md:grid-cols-2">
                        {items.map((item, index) => (
                            <figure key={String(item.quote || index)} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                                <Quote className="h-7 w-7 text-blue-700" />
                                <blockquote className="mt-5 text-lg leading-8 text-slate-800">&ldquo;{String(item.quote || '')}&rdquo;</blockquote>
                                <figcaption className="mt-6 text-sm text-slate-600">
                                    <span className="font-semibold text-slate-900">{String(item.name || '')}</span>
                                    {Boolean(item.role) && (
                                        <>
                                            <span className="mx-2 text-slate-300">·</span>
                                            {String(item.role)}
                                        </>
                                    )}
                                    {Boolean(item.company) && (
                                        <>
                                            <span className="mx-2 text-slate-300">·</span>
                                            {String(item.company)}
                                        </>
                                    )}
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (placement.module_type === 'portal-cta') {
        const items = resolvedItems(host, placement.module_type, content.items, content);
        const icons = [MessageSquareText, Clock3, LockKeyhole, BarChart3];

        return (
            <section className={`bg-slate-950 py-24 text-white ${className}`} style={style}>
                <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-8">
                    <div>
                        <p className="text-sm font-semibold tracking-[0.28em] text-blue-300 uppercase">{content.eyebrow}</p>
                        <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{content.title}</h2>
                        <p className="mt-6 text-lg leading-8 text-slate-300">{content.description}</p>
                        {renderButtonLink(
                            host,
                            safeLinkHref(content.button_href, '/login'),
                            content.button_label || 'Go to portal',
                            'cms-builder-button mt-9 rounded-full bg-white px-8 text-slate-950 hover:bg-slate-100',
                        )}
                    </div>
                    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl">
                        <div className="rounded-3xl bg-white p-5 text-slate-950">
                            {items.map((item, index) => {
                                const Icon = icons[index % icons.length];
                                return (
                                    <div
                                        key={String(item.label || index)}
                                        className="flex items-center justify-between border-b border-slate-100 py-4 last:border-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-5 w-5 text-blue-700" />
                                            <span className="font-medium">{String(item.label || '')}</span>
                                        </div>
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                            {String(item.value || '')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (placement.module_type === 'feature-split') {
        const items = resolvedItems(host, placement.module_type, content.items, content);

        return (
            <section className={`bg-white py-24 ${className}`} style={style}>
                <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
                    <div className="rounded-[2rem] bg-slate-100 p-3">
                        <div className="rounded-[1.5rem] bg-white p-8 shadow-sm">
                            <Zap className="h-9 w-9 text-blue-700" />
                            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950">{content.title}</h2>
                            <p className="mt-5 text-lg leading-8 text-slate-600">{content.description}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div
                                key={String(item.text || item.label || index)}
                                className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-blue-700" />
                                <p className="leading-7 text-slate-700">{String(item.text || item.label || '')}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (placement.module_type === 'faq') {
        const items = resolvedItems(host, placement.module_type, content.items, content);

        return (
            <section className={`bg-white py-24 ${className}`} id="faqs" style={style}>
                <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
                    <div>
                        <p className="text-sm font-semibold tracking-[0.28em] text-blue-700 uppercase">{content.eyebrow}</p>
                        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{content.title}</h2>
                    </div>
                    <div className="divide-y divide-slate-200 rounded-[2rem] border border-slate-200 bg-white">
                        {items.map((faq, index) => (
                            <div key={String(faq.question || index)} className="p-7">
                                <h3 className="text-lg font-semibold text-slate-950">{String(faq.question || '')}</h3>
                                <p className="mt-3 leading-7 text-slate-600">{String(faq.answer || '')}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return null;
}

export function RegisteredSectionModuleRenderer({ placement, module, viewport, host }: ModuleRendererProps) {
    if (!SECTION_MODULE_RENDERER_TYPES.includes(placement.module_type as SectionModuleRendererType)) return null;

    return <SectionModuleRenderer placement={placement as SectionModuleRendererProps['placement']} module={module} viewport={viewport} host={host} />;
}

export const SECTION_MODULE_DEFINITIONS: ModuleTypeDefinition[] = SECTION_MODULE_RENDERER_TYPES.map((type) => ({
    type,
    label: type
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
    category: type === 'testimonial-grid' ? 'testimonials' : type === 'faq' ? 'content' : 'cards',
    renderer: RegisteredSectionModuleRenderer,
}));
