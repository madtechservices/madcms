import type { CmsRecord } from './types';

export type BuilderStarterTemplate = {
    id: string;
    name: string;
    type: string;
    summary: string;
    content: CmsRecord;
    style?: CmsRecord;
};

export const BUILDER_STARTER_ELEMENTS: BuilderStarterTemplate[] = [
    {
        id: 'starter-heading',
        name: 'Heading',
        type: 'heading',
        summary: 'Eyebrow, semantic heading level, title, and supporting copy.',
        content: { eyebrow: '', title: 'New heading', description: '', level: 2 },
    },
    {
        id: 'starter-text',
        name: 'Text block',
        type: 'text-block',
        summary: 'Rich body copy with an optional heading and call-to-action.',
        content: {
            eyebrow: '',
            title: 'New content section',
            description: '',
            html: '<p>Add your content here.</p>',
            button_label: '',
            button_href: '',
        },
    },
    {
        id: 'starter-image',
        name: 'Image',
        type: 'image',
        summary: 'Responsive image with alt text and an optional caption.',
        content: { src: '', alt: '', caption: '' },
    },
    {
        id: 'starter-gallery',
        name: 'Gallery',
        type: 'gallery',
        summary: 'A responsive image gallery with captions, alt text, and adjustable columns.',
        content: {
            title: 'Image gallery',
            description: '',
            columns: 3,
            items: [
                { src: '', alt: '', caption: '' },
                { src: '', alt: '', caption: '' },
                { src: '', alt: '', caption: '' },
            ],
        },
    },
    {
        id: 'starter-stats',
        name: 'Stats',
        type: 'stats',
        summary: 'A grid of key figures, labels, and supporting details.',
        content: {
            title: 'Results at a glance',
            description: '',
            items: [
                { value: '99.9%', label: 'Uptime', description: '' },
                { value: '< 1 hr', label: 'Response target', description: '' },
                { value: '24/7', label: 'Monitoring', description: '' },
            ],
        },
    },
    {
        id: 'starter-video',
        name: 'Video',
        type: 'video',
        summary: 'YouTube, Vimeo, or uploaded video with poster and playback controls.',
        content: {
            title: '',
            description: '',
            url: '',
            poster: '',
            caption: '',
            controls: true,
            autoplay: false,
            muted: false,
            loop: false,
        },
    },
    {
        id: 'starter-map',
        name: 'Map',
        type: 'map',
        summary: 'Embedded map with an optional heading and introduction.',
        content: { title: '', description: '', embed_url: '' },
    },
    {
        id: 'starter-embed',
        name: 'Embed',
        type: 'embed',
        summary: 'Embed an external dashboard, booking tool, document, or other trusted URL.',
        content: { title: '', description: '', url: '', height: '420px', allow_fullscreen: true },
    },
    {
        id: 'starter-icon-feature',
        name: 'Icon feature',
        type: 'icon-feature',
        summary: 'A concise feature or benefit with icon, copy, and optional link.',
        content: {
            icon: 'sparkles',
            title: 'Feature title',
            description: 'Describe this feature or benefit.',
            link_label: '',
            link_href: '',
        },
    },
    {
        id: 'starter-button',
        name: 'Button',
        type: 'button',
        summary: 'A standalone call-to-action with link, alignment, and visual variant.',
        content: { label: 'Call to action', href: '#', variant: 'primary', alignment: 'left' },
    },
    {
        id: 'starter-quote',
        name: 'Quote',
        type: 'quote',
        summary: 'A pull quote or testimonial with optional author and role.',
        content: { quote: 'Add a memorable customer or editorial quote.', author: '', role: '' },
    },
    {
        id: 'starter-divider',
        name: 'Divider',
        type: 'divider',
        summary: 'A horizontal divider with adjustable width, thickness, and colour.',
        content: { width: '100%', thickness: '1px', colour: '#cbd5e1' },
    },
    {
        id: 'starter-spacer',
        name: 'Spacer',
        type: 'spacer',
        summary: 'Controlled vertical space between components.',
        content: { height: '4rem' },
    },
    {
        id: 'starter-carousel',
        name: 'Slider',
        type: 'carousel',
        summary: 'Horizontal image and content slides with optional links.',
        content: {
            eyebrow: '',
            title: 'Featured content',
            description: '',
            items: [{ image: '', alt: '', title: 'First slide', description: '', href: '' }],
        },
    },
    {
        id: 'starter-form',
        name: 'Form',
        type: 'form-embed',
        summary: 'Embed any CMS form with editable introduction and contact details.',
        content: { eyebrow: '', title: 'Get in touch', description: '', form_id: '', contact_items: [] },
    },
    {
        id: 'starter-hero',
        name: 'Hero',
        type: 'hero',
        summary: 'Large page introduction with two actions and proof points.',
        content: {
            eyebrow: '',
            title: 'A clear page headline',
            description: 'Add a concise introduction for this page.',
            primary_label: 'Get started',
            primary_href: '#contact',
            secondary_label: 'Learn more',
            secondary_href: '#content',
            proof_points: [],
        },
    },
];
