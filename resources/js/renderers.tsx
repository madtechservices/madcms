import type { CSSProperties } from 'react';

import { CONTENT_MODULE_DEFINITIONS } from './content-renderers';
import { FORM_MODULE_DEFINITIONS } from './form-renderers';
import { createModuleRegistry } from './registry';
import type { RuntimeModule, RuntimePlacement } from './runtime';
import { mergeContent, moduleClass, moduleStyle, safeMediaUrl, safeResponsiveCssValue, videoEmbedUrl } from './runtime';
import { SECTION_MODULE_DEFINITIONS } from './section-renderers';
import type { ModuleRendererProps, ModuleTypeDefinition } from './types';

export const CORE_MODULE_RENDERER_TYPES = ['quote', 'divider', 'spacer', 'image', 'gallery', 'stats', 'video', 'map', 'embed'] as const;

export type CoreModuleRendererType = (typeof CORE_MODULE_RENDERER_TYPES)[number];

export type CoreModuleRendererProps = {
    placement: RuntimePlacement & { module_type: CoreModuleRendererType };
    module?: RuntimeModule;
    viewport?: 'desktop' | 'tablet' | 'mobile';
};

export function CoreModuleRenderer({ placement, module, viewport }: CoreModuleRendererProps) {
    const content = mergeContent(placement, module);
    const className = moduleClass(placement, module, !viewport);
    const style = moduleStyle(placement, module, viewport);

    if (placement.module_type === 'quote') {
        return (
            <section className={`bg-white py-14 ${className}`} style={style}>
                <figure className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <blockquote className="text-2xl leading-10 font-medium text-slate-950 sm:text-3xl">
                        &ldquo;{content.quote || 'Add a quote in the component settings.'}&rdquo;
                    </blockquote>
                    {(content.author || content.role) && (
                        <figcaption className="mt-6 text-sm text-slate-600">
                            {content.author && <span className="font-semibold text-slate-900">{content.author}</span>}
                            {content.author && content.role && <span> · </span>}
                            {content.role}
                        </figcaption>
                    )}
                </figure>
            </section>
        );
    }

    if (placement.module_type === 'divider') {
        return (
            <div className={`bg-white py-6 ${className}`} style={style} role="separator">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div
                        className="mx-auto"
                        style={{
                            width: content.width || '100%',
                            borderTopWidth: content.thickness || '1px',
                            borderTopStyle: content.style || 'solid',
                            borderTopColor: content.colour || content.color || '#cbd5e1',
                        }}
                    />
                </div>
            </div>
        );
    }

    if (placement.module_type === 'spacer') {
        return <div className={className} style={{ ...style, height: content.height || '4rem' }} aria-hidden="true" />;
    }

    if (placement.module_type === 'image') {
        return (
            <section className={`bg-white py-20 ${className}`} style={style}>
                <figure className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {content.src || content.url ? (
                        <img
                            src={safeMediaUrl(content.src || content.url)}
                            alt={content.alt || ''}
                            className="w-full rounded-[2rem] border border-slate-200 object-cover shadow-sm"
                            loading="lazy"
                            decoding="async"
                        />
                    ) : (
                        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-sm text-slate-500">
                            Add an image URL in this module.
                        </div>
                    )}
                    {content.caption && <figcaption className="mt-4 text-center text-sm text-slate-500">{content.caption}</figcaption>}
                </figure>
            </section>
        );
    }

    if (placement.module_type === 'gallery') {
        const items = Array.isArray(content.items) ? content.items : [];
        const columnClassName =
            Number(content.columns) === 2
                ? 'md:grid-cols-2'
                : Number(content.columns) === 4
                  ? 'md:grid-cols-2 lg:grid-cols-4'
                  : 'md:grid-cols-2 lg:grid-cols-3';

        return (
            <section className={`bg-white py-20 ${className}`} style={style}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {(content.title || content.description) && (
                        <div className="mb-9 max-w-3xl">
                            {content.title && <h2 className="text-4xl font-semibold tracking-tight text-slate-950">{content.title}</h2>}
                            {content.description && <p className="mt-4 text-lg leading-8 text-slate-600">{content.description}</p>}
                        </div>
                    )}
                    {items.length > 0 ? (
                        <div className={`grid gap-5 ${columnClassName}`}>
                            {items.map((item: Record<string, any>, index: number) => (
                                <figure key={`${item.src || 'gallery'}-${index}`} className="min-w-0">
                                    {item.src || item.url ? (
                                        <img
                                            src={safeMediaUrl(item.src || item.url)}
                                            alt={item.alt || ''}
                                            className="aspect-[4/3] w-full rounded-lg border border-slate-200 object-cover"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    ) : (
                                        <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                                            Add an image
                                        </div>
                                    )}
                                    {item.caption && <figcaption className="mt-3 text-sm text-slate-600">{item.caption}</figcaption>}
                                </figure>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-sm text-slate-500">
                            Add gallery images in the component settings.
                        </div>
                    )}
                </div>
            </section>
        );
    }

    if (placement.module_type === 'stats') {
        const items = Array.isArray(content.items) ? content.items : [];

        return (
            <section className={`bg-slate-50 py-20 ${className}`} style={style}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {(content.title || content.description) && (
                        <div className="mb-9 max-w-3xl">
                            {content.title && <h2 className="text-4xl font-semibold tracking-tight text-slate-950">{content.title}</h2>}
                            {content.description && <p className="mt-4 text-lg leading-8 text-slate-600">{content.description}</p>}
                        </div>
                    )}
                    <dl className="grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
                        {items.map((item: Record<string, any>, index: number) => (
                            <div key={`${item.label || 'stat'}-${index}`} className="bg-white p-6">
                                <dd className="text-4xl font-semibold text-slate-950">{item.value}</dd>
                                <dt className="mt-3 text-sm font-semibold text-slate-900">{item.label}</dt>
                                {item.description && <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>}
                            </div>
                        ))}
                    </dl>
                </div>
            </section>
        );
    }

    if (placement.module_type === 'video') {
        const source = safeMediaUrl(content.url || content.src);
        const embedSource = videoEmbedUrl(source);
        const isEmbed = !!source && (/youtube\.com|youtu\.be|vimeo\.com/.test(source) || content.mode === 'embed');

        return (
            <section className={`bg-white py-20 ${className}`} style={style}>
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {(content.title || content.description) && (
                        <div className="mb-8 max-w-3xl">
                            {content.title && <h2 className="text-4xl font-semibold tracking-tight text-slate-950">{content.title}</h2>}
                            {content.description && <p className="mt-4 text-lg leading-8 text-slate-600">{content.description}</p>}
                        </div>
                    )}
                    {source ? (
                        isEmbed ? (
                            <iframe
                                title={content.title || 'Video'}
                                src={embedSource}
                                className="aspect-video w-full rounded-2xl border border-slate-200 bg-black shadow-sm"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="strict-origin-when-cross-origin"
                            />
                        ) : (
                            <video
                                src={source}
                                poster={safeMediaUrl(content.poster)}
                                controls={content.controls !== false}
                                autoPlay={content.autoplay === true}
                                muted={content.muted === true || content.autoplay === true}
                                loop={content.loop === true}
                                className="aspect-video w-full rounded-2xl border border-slate-200 bg-black object-cover shadow-sm"
                            />
                        )
                    ) : (
                        <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                            Add a video URL in this component.
                        </div>
                    )}
                    {content.caption && <p className="mt-4 text-center text-sm text-slate-500">{content.caption}</p>}
                </div>
            </section>
        );
    }

    if (placement.module_type === 'map') {
        return (
            <section className={`bg-slate-50 py-20 ${className}`} style={style}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {(content.title || content.description) && (
                        <div className="mb-8 max-w-3xl">
                            {content.title && <h2 className="text-4xl font-semibold tracking-tight text-slate-950">{content.title}</h2>}
                            {content.description && <p className="mt-4 text-lg leading-8 text-slate-600">{content.description}</p>}
                        </div>
                    )}
                    {content.embed_url ? (
                        <iframe
                            title={content.title || 'Map'}
                            src={safeMediaUrl(content.embed_url)}
                            className="h-[420px] w-full rounded-[2rem] border border-slate-200 bg-white shadow-sm"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    ) : (
                        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
                            Add a map embed URL in this module.
                        </div>
                    )}
                </div>
            </section>
        );
    }

    if (placement.module_type === 'embed') {
        const source = safeMediaUrl(content.url || content.embed_url);
        const height = safeResponsiveCssValue(content.height) || '420px';

        return (
            <section className={`bg-white py-20 ${className}`} style={style}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {(content.title || content.description) && (
                        <div className="mb-8 max-w-3xl">
                            {content.title && <h2 className="text-4xl font-semibold tracking-tight text-slate-950">{content.title}</h2>}
                            {content.description && <p className="mt-4 text-lg leading-8 text-slate-600">{content.description}</p>}
                        </div>
                    )}
                    {source ? (
                        <iframe
                            title={content.title || 'Embedded content'}
                            src={source}
                            className="w-full rounded-lg border border-slate-200 bg-white shadow-sm"
                            style={{ height } as CSSProperties}
                            loading="lazy"
                            allowFullScreen={content.allow_fullscreen !== false}
                        />
                    ) : (
                        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-sm text-slate-500">
                            Add a trusted embed URL in the component settings.
                        </div>
                    )}
                </div>
            </section>
        );
    }

    return null;
}

function RegisteredCoreModuleRenderer({ placement, module, viewport }: ModuleRendererProps) {
    if (!CORE_MODULE_RENDERER_TYPES.includes(placement.module_type as CoreModuleRendererType)) return null;

    return <CoreModuleRenderer placement={placement as CoreModuleRendererProps['placement']} module={module} viewport={viewport} />;
}

const MEDIA_UTILITY_MODULE_DEFINITIONS: ModuleTypeDefinition[] = CORE_MODULE_RENDERER_TYPES.map((type) => ({
    type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
    category: ['image', 'gallery', 'video', 'map', 'embed'].includes(type) ? 'media' : 'content',
    renderer: RegisteredCoreModuleRenderer,
}));

export const CORE_MODULE_DEFINITIONS: ModuleTypeDefinition[] = [
    ...MEDIA_UTILITY_MODULE_DEFINITIONS,
    ...CONTENT_MODULE_DEFINITIONS,
    ...FORM_MODULE_DEFINITIONS,
    ...SECTION_MODULE_DEFINITIONS,
];

export function createCoreModuleRegistry() {
    return createModuleRegistry(CORE_MODULE_DEFINITIONS);
}

export const coreModuleRegistry = createCoreModuleRegistry();
