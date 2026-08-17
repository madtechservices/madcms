import type { CmsRecord } from './types';

export type ModuleEditorFieldType =
    | 'text'
    | 'textarea'
    | 'rich-text'
    | 'url'
    | 'number'
    | 'select'
    | 'checkbox'
    | 'media'
    | 'form'
    | 'string-list'
    | 'object-list';

export type ModuleEditorOption = { label: string; value: string | number };
export type ModuleEditorSubfield = { key: string; label: string; type?: 'text' | 'textarea' | 'url' | 'media' };

export type ModuleEditorField = {
    key: string;
    label: string;
    type: ModuleEditorFieldType;
    placeholder?: string;
    help?: string;
    width?: 'full' | 'half';
    options?: ModuleEditorOption[];
    fields?: ModuleEditorSubfield[];
    defaultValue?: unknown;
    itemLabel?: string;
    aliases?: string[];
};

export type ModuleEditorSchema = {
    version: 1;
    type: string;
    label: string;
    fields: ModuleEditorField[];
};

const intro = (eyebrow = true): ModuleEditorField[] => [
    ...(eyebrow ? [{ key: 'eyebrow', label: 'Eyebrow', type: 'text' as const }] : []),
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
];

const objectList = (key: string, label: string, fields: ModuleEditorSubfield[], defaultValue: CmsRecord): ModuleEditorField => ({
    key,
    label,
    itemLabel: label,
    type: 'object-list',
    fields,
    defaultValue,
});

const schemas: ModuleEditorSchema[] = [
    {
        version: 1,
        type: 'hero',
        label: 'Hero',
        fields: [
            ...intro(),
            { key: 'primary_label', label: 'Primary button label', type: 'text', width: 'half' },
            { key: 'primary_href', label: 'Primary button URL', type: 'url', width: 'half' },
            { key: 'secondary_label', label: 'Secondary button label', type: 'text', width: 'half' },
            { key: 'secondary_href', label: 'Secondary button URL', type: 'url', width: 'half' },
            objectList(
                'proof_points',
                'Proof points',
                [
                    { key: 'label', label: 'Label' },
                    { key: 'text', label: 'Text', type: 'textarea' },
                ],
                {
                    label: '',
                    text: '',
                },
            ),
        ],
    },
    {
        version: 1,
        type: 'logo-grid',
        label: 'Logo grid',
        fields: [...intro(false), { key: 'brands', label: 'Logos / platforms', type: 'string-list' }],
    },
    {
        version: 1,
        type: 'service-cards',
        label: 'Service cards',
        fields: [
            ...intro(),
            objectList(
                'items',
                'Service cards',
                [
                    { key: 'slug', label: 'Slug' },
                    { key: 'shortTitle', label: 'Card title' },
                    { key: 'description', label: 'Description', type: 'textarea' },
                    { key: 'href', label: 'Link URL', type: 'url' },
                    { key: 'link_label', label: 'Link label' },
                ],
                { slug: '', shortTitle: '', description: '', href: '', link_label: 'Learn more' },
            ),
        ],
    },
    {
        version: 1,
        type: 'testimonial-grid',
        label: 'Testimonials',
        fields: [
            ...intro(),
            objectList(
                'items',
                'Testimonials',
                [
                    { key: 'quote', label: 'Quote', type: 'textarea' },
                    { key: 'name', label: 'Name' },
                    { key: 'role', label: 'Role' },
                    { key: 'company', label: 'Company' },
                ],
                { quote: '', name: '', role: '', company: '' },
            ),
        ],
    },
    {
        version: 1,
        type: 'portal-cta',
        label: 'Portal CTA',
        fields: [
            ...intro(),
            { key: 'button_label', label: 'Button label', type: 'text', width: 'half' },
            { key: 'button_href', label: 'Button URL', type: 'url', width: 'half' },
            objectList(
                'items',
                'Dashboard items',
                [
                    { key: 'label', label: 'Label' },
                    { key: 'value', label: 'Value' },
                ],
                { label: '', value: '' },
            ),
        ],
    },
    {
        version: 1,
        type: 'feature-split',
        label: 'Feature split',
        fields: [...intro(false), { key: 'items', label: 'Checklist items', type: 'string-list' }],
    },
    {
        version: 1,
        type: 'form-embed',
        label: 'Form',
        fields: [
            ...intro(),
            { key: 'form_id', label: 'Form', type: 'form' },
            objectList(
                'contact_items',
                'Contact rows',
                [
                    { key: 'label', label: 'Label' },
                    { key: 'text', label: 'Text' },
                    { key: 'href', label: 'Link URL', type: 'url' },
                ],
                { label: '', text: '', href: '' },
            ),
        ],
    },
    {
        version: 1,
        type: 'faq',
        label: 'FAQ',
        fields: [
            ...intro(),
            objectList(
                'items',
                'FAQs',
                [
                    { key: 'question', label: 'Question' },
                    { key: 'answer', label: 'Answer', type: 'textarea' },
                ],
                { question: '', answer: '' },
            ),
        ],
    },
    {
        version: 1,
        type: 'text-block',
        label: 'Text block',
        fields: [
            ...intro(),
            { key: 'html', label: 'Body content', type: 'rich-text', aliases: ['body', 'text'] },
            { key: 'button_label', label: 'Button label', type: 'text', width: 'half' },
            { key: 'button_href', label: 'Button URL', type: 'url', width: 'half' },
        ],
    },
    {
        version: 1,
        type: 'heading',
        label: 'Heading',
        fields: [
            ...intro(),
            {
                key: 'level',
                label: 'Heading level',
                type: 'select',
                options: [
                    { label: 'H1 - page title', value: 1 },
                    { label: 'H2 - section heading', value: 2 },
                    { label: 'H3 - subsection', value: 3 },
                    { label: 'H4', value: 4 },
                    { label: 'H5', value: 5 },
                    { label: 'H6', value: 6 },
                ],
            },
        ],
    },
    {
        version: 1,
        type: 'button',
        label: 'Button',
        fields: [
            { key: 'label', label: 'Button label', type: 'text', width: 'half' },
            { key: 'href', label: 'Link URL', type: 'url', width: 'half' },
            { key: 'variant', label: 'Variant', type: 'select', options: ['primary', 'outline', 'text'].map((value) => ({ label: value, value })) },
            { key: 'alignment', label: 'Alignment', type: 'select', options: ['left', 'center', 'right'].map((value) => ({ label: value, value })) },
        ],
    },
    {
        version: 1,
        type: 'quote',
        label: 'Quote',
        fields: [
            { key: 'quote', label: 'Quote', type: 'textarea' },
            { key: 'author', label: 'Author', type: 'text', width: 'half' },
            { key: 'role', label: 'Role / company', type: 'text', width: 'half' },
        ],
    },
    {
        version: 1,
        type: 'divider',
        label: 'Divider',
        fields: [
            { key: 'width', label: 'Width', type: 'text' },
            { key: 'thickness', label: 'Thickness', type: 'text' },
            { key: 'colour', label: 'Colour', type: 'text' },
            { key: 'style', label: 'Line style', type: 'select', options: ['solid', 'dashed', 'dotted'].map((value) => ({ label: value, value })) },
        ],
    },
    { version: 1, type: 'spacer', label: 'Spacer', fields: [{ key: 'height', label: 'Height', type: 'text', placeholder: '4rem' }] },
    {
        version: 1,
        type: 'image',
        label: 'Image',
        fields: [
            { key: 'src', label: 'Image URL', type: 'media', aliases: ['url'] },
            { key: 'alt', label: 'Alt text', type: 'text' },
            { key: 'caption', label: 'Caption', type: 'text' },
        ],
    },
    {
        version: 1,
        type: 'gallery',
        label: 'Gallery',
        fields: [
            ...intro(false),
            { key: 'columns', label: 'Columns', type: 'select', options: [2, 3, 4].map((value) => ({ label: String(value), value })) },
            objectList(
                'items',
                'Gallery images',
                [
                    { key: 'src', label: 'Image URL', type: 'media' },
                    { key: 'alt', label: 'Alt text' },
                    { key: 'caption', label: 'Caption', type: 'textarea' },
                ],
                { src: '', alt: '', caption: '' },
            ),
        ],
    },
    {
        version: 1,
        type: 'stats',
        label: 'Stats',
        fields: [
            ...intro(false),
            objectList(
                'items',
                'Statistics',
                [
                    { key: 'value', label: 'Value' },
                    { key: 'label', label: 'Label' },
                    { key: 'description', label: 'Description', type: 'textarea' },
                ],
                { value: '', label: '', description: '' },
            ),
        ],
    },
    {
        version: 1,
        type: 'video',
        label: 'Video',
        fields: [
            ...intro(false),
            { key: 'url', label: 'Video URL', type: 'url', aliases: ['src'] },
            { key: 'poster', label: 'Poster image URL', type: 'media' },
            { key: 'caption', label: 'Caption', type: 'text' },
            { key: 'controls', label: 'Show controls', type: 'checkbox', defaultValue: true },
            { key: 'autoplay', label: 'Autoplay', type: 'checkbox', defaultValue: false },
            { key: 'muted', label: 'Muted', type: 'checkbox', defaultValue: false },
            { key: 'loop', label: 'Loop', type: 'checkbox', defaultValue: false },
        ],
    },
    {
        version: 1,
        type: 'icon-feature',
        label: 'Icon feature',
        fields: [
            ...intro(false),
            {
                key: 'icon',
                label: 'Icon',
                type: 'select',
                options: ['sparkles', 'shield', 'cloud', 'globe', 'zap', 'check', 'message', 'lock', 'chart'].map((value) => ({
                    label: value,
                    value,
                })),
            },
            { key: 'link_label', label: 'Link label', type: 'text' },
            { key: 'link_href', label: 'Link URL', type: 'url' },
        ],
    },
    { version: 1, type: 'map', label: 'Map', fields: [...intro(false), { key: 'embed_url', label: 'Map embed URL', type: 'url' }] },
    {
        version: 1,
        type: 'embed',
        label: 'Embed',
        fields: [
            ...intro(false),
            { key: 'url', label: 'Embed URL', type: 'url', aliases: ['embed_url'] },
            { key: 'height', label: 'Height', type: 'text' },
            { key: 'allow_fullscreen', label: 'Allow fullscreen', type: 'checkbox', defaultValue: true },
        ],
    },
    {
        version: 1,
        type: 'carousel',
        label: 'Carousel',
        fields: [
            ...intro(),
            objectList(
                'items',
                'Carousel slides',
                [
                    { key: 'image', label: 'Image URL', type: 'media' },
                    { key: 'alt', label: 'Alt text' },
                    { key: 'title', label: 'Title' },
                    { key: 'description', label: 'Description', type: 'textarea' },
                    { key: 'href', label: 'Link URL', type: 'url' },
                ],
                { image: '', alt: '', title: '', description: '', href: '' },
            ),
        ],
    },
];

export const CORE_MODULE_EDITOR_SCHEMAS = Object.fromEntries(schemas.map((schema) => [schema.type, schema])) as Record<string, ModuleEditorSchema>;

export function editorSchemaFor(type: string) {
    return CORE_MODULE_EDITOR_SCHEMAS[type];
}
