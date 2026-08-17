import { ArrowRight, BarChart3, CheckCircle2, Cloud, Globe2, LockKeyhole, MessageSquareText, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';

import type { RuntimeModule, RuntimePlacement } from './runtime';
import { mergeContent, moduleClass, moduleStyle, safeLinkHref, safeMediaUrl } from './runtime';
import type { BuilderHost, ModuleRendererProps, ModuleTypeDefinition } from './types';

export const CONTENT_MODULE_RENDERER_TYPES = ['hero', 'logo-grid', 'text-block', 'heading', 'button', 'icon-feature', 'carousel'] as const;

export type ContentModuleRendererType = (typeof CONTENT_MODULE_RENDERER_TYPES)[number];

export type ContentModuleRendererProps = {
    placement: RuntimePlacement & { module_type: ContentModuleRendererType };
    module?: RuntimeModule;
    viewport?: 'desktop' | 'tablet' | 'mobile';
    host?: BuilderHost;
};

function renderLink(host: BuilderHost | undefined, href: string, children: ReactNode, className: string) {
    if (host?.renderLink) return <Fragment>{host.renderLink(href, children, { className })}</Fragment>;

    return (
        <a href={href} className={className}>
            {children}
        </a>
    );
}

function renderButtonLink(
    host: BuilderHost | undefined,
    href: string,
    children: ReactNode,
    className: string,
    options: { navigation?: 'client' | 'document'; size?: 'default' | 'sm' | 'lg'; variant?: 'default' | 'outline' } = {},
) {
    if (host?.renderButtonLink) return <Fragment>{host.renderButtonLink(href, children, { className, ...options })}</Fragment>;

    return renderLink(
        host,
        href,
        children,
        `inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors ${options.size === 'lg' ? 'h-11 px-8' : 'h-10 px-4 py-2'} ${className}`,
    );
}

function featureIcon(name?: string) {
    const icons: Record<string, typeof Sparkles> = {
        sparkles: Sparkles,
        shield: ShieldCheck,
        cloud: Cloud,
        globe: Globe2,
        zap: Zap,
        check: CheckCircle2,
        message: MessageSquareText,
        lock: LockKeyhole,
        chart: BarChart3,
    };

    return icons[String(name || 'sparkles').toLowerCase()] || Sparkles;
}

export function ContentModuleRenderer({ placement, module, viewport, host }: ContentModuleRendererProps) {
    const content = mergeContent(placement, module);
    const className = moduleClass(placement, module, !viewport);
    const style = moduleStyle(placement, module, viewport);

    if (placement.module_type === 'hero') {
        const proofPoints = Array.isArray(content.proof_points) ? content.proof_points : [];
        const icons = [ShieldCheck, Cloud, Globe2];

        return (
            <section className={`relative overflow-hidden bg-white ${className}`} style={style}>
                <div className="absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,.18),transparent_46%),linear-gradient(180deg,#f8fafc,rgba(255,255,255,0))]" />
                <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
                    {content.eyebrow && (
                        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                            <Sparkles className="h-4 w-4 text-blue-600" /> {content.eyebrow}
                        </div>
                    )}
                    <h1 className="mx-auto mt-8 max-w-5xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-7xl lg:text-8xl">
                        {content.title}
                    </h1>
                    {content.description && <p className="mx-auto mt-7 max-w-3xl text-xl leading-9 text-slate-600">{content.description}</p>}
                    <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                        {renderButtonLink(
                            host,
                            safeLinkHref(content.primary_href, '#contact'),
                            <>
                                {content.primary_label || 'Start a conversation'} <ArrowRight className="h-4 w-4" />
                            </>,
                            'cms-builder-button rounded-full bg-slate-950 px-8 text-white hover:bg-slate-800',
                            { navigation: 'document', size: 'lg' },
                        )}
                        {renderButtonLink(
                            host,
                            safeLinkHref(content.secondary_href, '/services'),
                            content.secondary_label || 'Explore services',
                            'cms-builder-button rounded-full px-8',
                            { size: 'lg', variant: 'outline' },
                        )}
                    </div>

                    {proofPoints.length > 0 && (
                        <div className="mx-auto mt-16 grid max-w-5xl gap-4 text-left md:grid-cols-3">
                            {proofPoints.map((item: Record<string, any>, index: number) => {
                                const Icon = icons[index % icons.length];

                                return (
                                    <div
                                        key={item.label || index}
                                        className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
                                    >
                                        <Icon className="h-7 w-7 text-blue-700" />
                                        <h3 className="mt-5 text-lg font-semibold text-slate-950">{item.label}</h3>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        );
    }

    if (placement.module_type === 'logo-grid') {
        const brands = Array.isArray(content.brands) ? content.brands : [];

        return (
            <section className={`border-y border-slate-200 bg-white py-16 ${className}`} style={style}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm font-medium tracking-[0.28em] text-slate-500 uppercase">{content.title}</p>
                    <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                        {brands.map((brand) => {
                            const name = String(brand);

                            return (
                                <div
                                    key={name}
                                    className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center shadow-sm"
                                >
                                    {host?.renderBrandMark ? (
                                        <Fragment>{host.renderBrandMark(name, { size: 40 })}</Fragment>
                                    ) : (
                                        <div
                                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700"
                                            aria-hidden="true"
                                        >
                                            {name.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="text-sm font-semibold text-slate-800">{name}</div>
                                </div>
                            );
                        })}
                    </div>
                    {content.description && (
                        <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-6 text-slate-500">{content.description}</p>
                    )}
                </div>
            </section>
        );
    }

    if (placement.module_type === 'text-block') {
        const body = content.html || content.body || content.text || '';
        const safeBody = host?.sanitizeRichText ? host.sanitizeRichText(body) : '';

        return (
            <section className={`bg-white py-20 ${className}`} style={style}>
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {content.eyebrow && <p className="text-sm font-semibold tracking-[0.28em] text-blue-700 uppercase">{content.eyebrow}</p>}
                    {content.title && <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{content.title}</h2>}
                    {content.description && <p className="mt-5 text-lg leading-8 text-slate-600">{content.description}</p>}
                    {safeBody && <div className="mt-8 space-y-5 text-lg leading-9 text-slate-700" dangerouslySetInnerHTML={{ __html: safeBody }} />}
                    {content.button_label &&
                        renderButtonLink(
                            host,
                            safeLinkHref(content.button_href),
                            <>
                                {content.button_label} <ArrowRight className="h-4 w-4" />
                            </>,
                            'cms-builder-button mt-8 rounded-full bg-slate-950 px-8 text-white hover:bg-slate-800',
                        )}
                </div>
            </section>
        );
    }

    if (placement.module_type === 'heading') {
        const level = Math.min(6, Math.max(1, Number(content.level || 2)));
        const headingClasses: Record<number, string> = {
            1: 'text-5xl sm:text-7xl',
            2: 'text-4xl sm:text-5xl',
            3: 'text-3xl sm:text-4xl',
            4: 'text-2xl sm:text-3xl',
            5: 'text-xl sm:text-2xl',
            6: 'text-lg sm:text-xl',
        };
        const headingClassName = `font-semibold tracking-tight text-slate-950 ${headingClasses[level]}`;
        const heading =
            level === 1 ? (
                <h1 className={headingClassName}>{content.title}</h1>
            ) : level === 2 ? (
                <h2 className={headingClassName}>{content.title}</h2>
            ) : level === 3 ? (
                <h3 className={headingClassName}>{content.title}</h3>
            ) : level === 4 ? (
                <h4 className={headingClassName}>{content.title}</h4>
            ) : level === 5 ? (
                <h5 className={headingClassName}>{content.title}</h5>
            ) : (
                <h6 className={headingClassName}>{content.title}</h6>
            );

        return (
            <section className={`bg-white py-12 ${className}`} style={style}>
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {content.eyebrow && <p className="mb-3 text-sm font-semibold tracking-[0.28em] text-blue-700 uppercase">{content.eyebrow}</p>}
                    {heading}
                    {content.description && <p className="mt-4 text-lg leading-8 text-slate-600">{content.description}</p>}
                </div>
            </section>
        );
    }

    if (placement.module_type === 'button') {
        const alignmentClass = content.alignment === 'center' ? 'justify-center' : content.alignment === 'right' ? 'justify-end' : 'justify-start';
        const variantClass =
            content.variant === 'outline'
                ? 'border border-slate-300 bg-white text-slate-950 hover:bg-slate-50'
                : content.variant === 'text'
                  ? 'bg-transparent text-blue-700 hover:bg-blue-50'
                  : 'bg-slate-950 text-white hover:bg-slate-800';

        return (
            <section className={`bg-white py-8 ${className}`} style={style}>
                <div className={`mx-auto flex max-w-7xl px-4 sm:px-6 lg:px-8 ${alignmentClass}`}>
                    {renderLink(
                        host,
                        safeLinkHref(content.href),
                        content.label || 'Button',
                        `cms-builder-button inline-flex min-h-11 items-center justify-center rounded-md px-6 py-3 text-sm font-semibold transition ${variantClass}`,
                    )}
                </div>
            </section>
        );
    }

    if (placement.module_type === 'icon-feature') {
        const Icon = featureIcon(content.icon);

        return (
            <section className={`bg-white py-16 ${className}`} style={style}>
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="border border-slate-200 bg-white p-7 shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                            <Icon className="h-6 w-6" />
                        </div>
                        {content.title && <h2 className="mt-5 text-2xl font-semibold text-slate-950">{content.title}</h2>}
                        {content.description && <p className="mt-3 leading-7 text-slate-600">{content.description}</p>}
                        {content.link_label &&
                            renderLink(
                                host,
                                safeLinkHref(content.link_href),
                                <>
                                    {content.link_label} <ArrowRight className="h-4 w-4" />
                                </>,
                                'mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700',
                            )}
                    </div>
                </div>
            </section>
        );
    }

    if (placement.module_type === 'carousel') {
        const items = Array.isArray(content.items) ? content.items : [];

        return (
            <section className={`bg-white py-20 ${className}`} style={style}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {(content.eyebrow || content.title || content.description) && (
                        <div className="max-w-3xl">
                            {content.eyebrow && <p className="text-sm font-semibold tracking-[0.28em] text-blue-700 uppercase">{content.eyebrow}</p>}
                            {content.title && <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{content.title}</h2>}
                            {content.description && <p className="mt-4 text-lg leading-8 text-slate-600">{content.description}</p>}
                        </div>
                    )}
                    <div className="mt-10 flex snap-x gap-5 overflow-x-auto pb-4">
                        {items.map((item: Record<string, any>, index: number) => (
                            <article
                                key={item.title || index}
                                className="min-w-[280px] snap-start overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm sm:min-w-[360px]"
                            >
                                {(item.image || item.src) && (
                                    <img
                                        src={safeMediaUrl(item.image || item.src)}
                                        alt={item.alt || item.title || ''}
                                        className="h-48 w-full object-cover"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                )}
                                <div className="p-6">
                                    {item.title && <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>}
                                    {item.description && <p className="mt-3 leading-7 text-slate-600">{item.description}</p>}
                                    {item.href &&
                                        renderLink(
                                            host,
                                            safeLinkHref(item.href),
                                            <>
                                                Learn more <ArrowRight className="h-4 w-4" />
                                            </>,
                                            'mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700',
                                        )}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return null;
}

export function RegisteredContentModuleRenderer({ placement, module, viewport, host }: ModuleRendererProps) {
    if (!CONTENT_MODULE_RENDERER_TYPES.includes(placement.module_type as ContentModuleRendererType)) return null;

    return <ContentModuleRenderer placement={placement as ContentModuleRendererProps['placement']} module={module} viewport={viewport} host={host} />;
}

export const CONTENT_MODULE_DEFINITIONS: ModuleTypeDefinition[] = CONTENT_MODULE_RENDERER_TYPES.map((type) => ({
    type,
    label: type
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
    category: 'content',
    renderer: RegisteredContentModuleRenderer,
}));
