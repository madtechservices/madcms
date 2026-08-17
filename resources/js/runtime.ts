import type { CSSProperties } from 'react';

export type RuntimePlacement = {
    id?: string;
    mode: 'linked' | 'detached';
    content_overrides?: Record<string, any>;
    style_overrides?: Record<string, any>;
    detached_content?: Record<string, any>;
    detached_style?: Record<string, any>;
    advanced_classes?: string;
    custom_css?: string;
};

export type RuntimeModule = {
    content?: Record<string, any> | null;
    style?: Record<string, any> | null;
    advanced_classes?: string | null;
    custom_css?: string | null;
};

export function mergeContent(placement: RuntimePlacement, module?: RuntimeModule) {
    if (placement.mode === 'detached') return placement.detached_content || {};

    return { ...(module?.content || {}), ...(placement.content_overrides || {}) };
}

export function mergeStyle(placement: RuntimePlacement, module?: RuntimeModule) {
    if (placement.mode === 'detached') return placement.detached_style || {};

    const masterStyle = module?.style || {};
    const placementStyle = placement.style_overrides || {};

    return {
        ...masterStyle,
        ...placementStyle,
        visibility: {
            ...(masterStyle.visibility || {}),
            ...(placementStyle.visibility || {}),
        },
        responsive: {
            ...(masterStyle.responsive || {}),
            ...(placementStyle.responsive || {}),
        },
    };
}

export function backgroundImage(value?: string) {
    if (!value?.trim()) return undefined;
    const trimmed = value.trim().replace(/[\r\n]/g, '');
    const urlMatch = trimmed.match(/^url\((.*)\)$/i);
    const rawUrl = (urlMatch ? urlMatch[1] : trimmed).trim().replace(/^['"]|['"]$/g, '');

    if (/^(javascript|vbscript|data):/i.test(rawUrl)) return undefined;

    return `url("${rawUrl.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}")`;
}

export function safeMediaUrl(value?: string) {
    const trimmed = value?.trim().replace(/[\r\n]/g, '');
    if (!trimmed || /^(javascript|vbscript|data):/i.test(trimmed)) return undefined;
    if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !/^https?:/i.test(trimmed)) return undefined;

    return trimmed;
}

export function safeLinkHref(value?: string, fallback = '#') {
    const trimmed = value?.trim().replace(/[\r\n]/g, '');
    if (!trimmed || /^(javascript|vbscript|data):/i.test(trimmed)) return fallback;

    return trimmed;
}

export function videoEmbedUrl(value?: string) {
    const url = safeMediaUrl(value);
    if (!url) return undefined;

    const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;

    const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

    return url;
}

export function moduleStyle(placement: RuntimePlacement, module?: RuntimeModule, viewport?: 'desktop' | 'tablet' | 'mobile'): CSSProperties {
    const mergedStyle = mergeStyle(placement, module);
    const style = viewport ? { ...mergedStyle, ...(mergedStyle.responsive?.[viewport] || {}) } : mergedStyle;
    const shadowMap: Record<string, string> = {
        sm: '0 1px 2px rgba(15, 23, 42, 0.08)',
        md: '0 12px 30px rgba(15, 23, 42, 0.10)',
        lg: '0 24px 60px rgba(15, 23, 42, 0.14)',
    };

    return {
        backgroundColor: style.backgroundColor || style.background_colour,
        backgroundImage: backgroundImage(style.backgroundImage || style.background_image),
        backgroundSize: style.backgroundSize || style.background_size,
        backgroundPosition: style.backgroundPosition || style.background_position,
        backgroundRepeat: style.backgroundRepeat || style.background_repeat,
        color: style.textColor || style.text_colour,
        paddingTop: style.paddingTop || style.padding_top,
        paddingBottom: style.paddingBottom || style.padding_bottom,
        marginTop: style.marginTop || style.margin_top,
        marginBottom: style.marginBottom || style.margin_bottom,
        maxWidth: style.maxWidth || style.max_width,
        borderRadius: style.borderRadius || style.border_radius,
        borderColor: style.borderColor || style.border_colour,
        borderWidth: style.borderWidth || style.border_width,
        boxShadow: shadowMap[style.shadow] || style.boxShadow || style.box_shadow,
        textAlign: style.textAlign || style.text_align,
        fontSize: style.fontSize || style.font_size,
        lineHeight: style.lineHeight || style.line_height,
        fontWeight: style.fontWeight || style.font_weight,
        ['--cms-accent' as string]: style.accentColor || style.accent_colour,
        ['--cms-button-bg' as string]: style.buttonBackgroundColor || style.button_background_color,
        ['--cms-button-text' as string]: style.buttonTextColor || style.button_text_color,
        ['--cms-button-radius' as string]: style.buttonRadius || style.button_radius,
        ['--cms-button-padding' as string]: style.buttonPadding || style.button_padding,
    };
}

export function visibilityClass(visibility?: Record<string, boolean>) {
    if (!visibility) return '';

    const mobile = visibility.mobile !== false;
    const tablet = visibility.tablet !== false;
    const desktop = visibility.desktop !== false;

    if (!mobile && !tablet && !desktop) return 'hidden';
    if (mobile && tablet && desktop) return '';
    if (!mobile && !tablet && desktop) return 'hidden lg:block';
    if (!mobile && tablet && !desktop) return 'hidden md:block lg:hidden';
    if (!mobile && tablet && desktop) return 'hidden md:block';
    if (mobile && !tablet && !desktop) return 'block md:hidden';
    if (mobile && !tablet && desktop) return 'block md:hidden lg:block';
    if (mobile && tablet && !desktop) return 'block lg:hidden';

    return '';
}

export function moduleClass(placement: RuntimePlacement, module?: RuntimeModule, includeVisibility = true) {
    const style = mergeStyle(placement, module);

    return [
        placement.mode === 'detached' ? null : module?.advanced_classes,
        placement.advanced_classes,
        includeVisibility ? visibilityClass(style.visibility) : null,
    ]
        .filter(Boolean)
        .join(' ');
}

export function scopeCss(css: string | null | undefined, scopeClass: string) {
    if (!css?.trim()) return '';
    const value = css.trim();

    if (!value.includes('{')) return `.${scopeClass}{${value}}`;

    return value.replace(/(^|})\s*([^@}{][^{]+)\s*{/g, (_match, boundary, selector) => {
        const scopedSelector = selector
            .split(',')
            .map((part: string) => {
                const trimmed = part.trim();
                return trimmed.startsWith(`.${scopeClass}`) ? trimmed : `.${scopeClass} ${trimmed.replace(/:host|:scope/g, '').trim()}`;
            })
            .join(', ');

        return `${boundary} ${scopedSelector}{`;
    });
}

export function placementScopeClass(placement: RuntimePlacement) {
    return `cms-module-${String(placement.id || 'module').replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

export function safeResponsiveCssValue(value: unknown) {
    const cssValue = String(value || '').trim();

    if (!cssValue || /[;{}]/.test(cssValue) || /(?:url|expression)\s*\(/i.test(cssValue)) return '';

    return cssValue;
}

export function responsiveStyleCss(style: Record<string, any>, scopeClass: string) {
    const boxPropertyMap: Record<string, string> = {
        paddingTop: 'padding-top',
        paddingBottom: 'padding-bottom',
        marginTop: 'margin-top',
        marginBottom: 'margin-bottom',
        textAlign: 'text-align',
    };
    const typographyPropertyMap: Record<string, string> = {
        fontSize: 'font-size',
        lineHeight: 'line-height',
    };
    const mediaQueries = {
        mobile: '(max-width: 767px)',
        tablet: '(min-width: 768px) and (max-width: 1023px)',
        desktop: '(min-width: 1024px)',
    };

    return Object.entries(mediaQueries)
        .map(([device, mediaQuery]) => {
            const declarations = (properties: Record<string, string>) =>
                Object.entries(properties)
                    .map(([setting, property]) => {
                        const value = safeResponsiveCssValue(style.responsive?.[device]?.[setting]);
                        return value ? `${property}:${value} !important;` : '';
                    })
                    .filter(Boolean)
                    .join('');
            const boxDeclarations = declarations(boxPropertyMap);
            const typographyDeclarations = declarations(typographyPropertyMap);
            const rules = [
                boxDeclarations ? `.${scopeClass}{${boxDeclarations}}` : '',
                typographyDeclarations
                    ? `.${scopeClass},.${scopeClass} :where(h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,dt,dd){${typographyDeclarations}}`
                    : '',
            ]
                .filter(Boolean)
                .join('');

            return rules ? `@media ${mediaQuery}{${rules}}` : '';
        })
        .filter(Boolean)
        .join('\n');
}

export function scopedCssForPlacement(placement: RuntimePlacement, module?: RuntimeModule, viewport?: 'desktop' | 'tablet' | 'mobile') {
    const scopeClass = placementScopeClass(placement);
    const style = mergeStyle(placement, module);
    const effectiveStyle = viewport ? { ...style, ...(style.responsive?.[viewport] || {}) } : style;
    const buttonCss = [
        style.buttonBackgroundColor || style.button_background_color ? 'background-color: var(--cms-button-bg) !important;' : '',
        style.buttonTextColor || style.button_text_color ? 'color: var(--cms-button-text) !important;' : '',
        style.buttonRadius || style.button_radius ? 'border-radius: var(--cms-button-radius) !important;' : '',
        style.buttonPadding || style.button_padding ? 'padding: var(--cms-button-padding) !important;' : '',
    ]
        .filter(Boolean)
        .join('');
    const typographyCss = [
        safeResponsiveCssValue(effectiveStyle.fontSize || effectiveStyle.font_size)
            ? `font-size:${safeResponsiveCssValue(effectiveStyle.fontSize || effectiveStyle.font_size)} !important;`
            : '',
        safeResponsiveCssValue(effectiveStyle.lineHeight || effectiveStyle.line_height)
            ? `line-height:${safeResponsiveCssValue(effectiveStyle.lineHeight || effectiveStyle.line_height)} !important;`
            : '',
    ]
        .filter(Boolean)
        .join('');

    return [
        buttonCss ? `.${scopeClass} .cms-builder-button{${buttonCss}}` : '',
        typographyCss ? `.${scopeClass},.${scopeClass} :where(h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,dt,dd){${typographyCss}}` : '',
        !viewport ? responsiveStyleCss(style, scopeClass) : '',
        scopeCss(placement.mode === 'detached' ? null : module?.custom_css, scopeClass),
        scopeCss(placement.custom_css, scopeClass),
    ]
        .filter(Boolean)
        .join('\n');
}

export function columnClass(width?: string) {
    const map: Record<string, string> = {
        full: 'lg:col-span-12',
        '1/2': 'lg:col-span-6',
        '1/3': 'lg:col-span-4',
        '2/3': 'lg:col-span-8',
        '1/4': 'lg:col-span-3',
        '3/4': 'lg:col-span-9',
    };

    return map[width || 'full'] || map.full;
}

export function sectionStyle(section: any): CSSProperties {
    const style = section?.style || {};
    const maxWidth = style.maxWidth || style.max_width;

    return {
        backgroundColor: style.backgroundColor || style.background_colour,
        backgroundImage: backgroundImage(style.backgroundImage || style.background_image),
        backgroundSize: style.backgroundSize || style.background_size,
        backgroundPosition: style.backgroundPosition || style.background_position,
        backgroundRepeat: style.backgroundRepeat || style.background_repeat,
        color: style.textColor || style.text_colour,
        paddingTop: style.paddingTop || style.padding_top,
        paddingBottom: style.paddingBottom || style.padding_bottom,
        marginTop: style.marginTop || style.margin_top,
        marginBottom: style.marginBottom || style.margin_bottom,
        maxWidth,
        marginLeft: maxWidth ? 'auto' : undefined,
        marginRight: maxWidth ? 'auto' : undefined,
        textAlign: style.textAlign || style.text_align,
    };
}

export function layoutNodeStyle(node: any): CSSProperties {
    const style = node?.style || {};

    return {
        backgroundColor: style.backgroundColor || style.background_colour,
        backgroundImage: backgroundImage(style.backgroundImage || style.background_image),
        backgroundSize: style.backgroundSize || style.background_size,
        backgroundPosition: style.backgroundPosition || style.background_position,
        backgroundRepeat: style.backgroundRepeat || style.background_repeat,
        color: style.textColor || style.text_colour,
        padding: style.padding,
        paddingTop: style.paddingTop || style.padding_top,
        paddingBottom: style.paddingBottom || style.padding_bottom,
        marginTop: style.marginTop || style.margin_top,
        marginBottom: style.marginBottom || style.margin_bottom,
        textAlign: style.textAlign || style.text_align,
        fontSize: style.fontSize || style.font_size,
        lineHeight: style.lineHeight || style.line_height,
        fontWeight: style.fontWeight || style.font_weight,
        alignItems: style.alignItems || style.align_items,
        justifyContent: style.justifyContent || style.justify_content,
    };
}

export function rowClass(row: any) {
    const gap = row?.style?.gap || 'gap-6';

    return [row.columns?.length > 1 ? `grid ${gap} lg:grid-cols-12` : undefined, row.advanced_classes].filter(Boolean).join(' ') || undefined;
}

export function columnWrapperClass(column: any, hasMultipleColumns: boolean) {
    return [hasMultipleColumns ? columnClass(column.width) : undefined, column.advanced_classes].filter(Boolean).join(' ') || undefined;
}
