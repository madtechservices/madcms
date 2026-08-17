import type { ComponentType, CSSProperties, ReactNode } from 'react';

export type CmsRecord = Record<string, unknown>;
export type BuilderViewport = 'desktop' | 'tablet' | 'mobile';
export type PlacementMode = 'linked' | 'detached';
export type BuilderLinkOptions = {
    className?: string;
    navigation?: 'client' | 'document';
    size?: 'default' | 'sm' | 'lg';
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
};

export type BuilderVisibility = {
    desktop?: boolean;
    tablet?: boolean;
    mobile?: boolean;
};

export type BuilderStyle = CmsRecord & {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    paddingTop?: string;
    paddingBottom?: string;
    marginTop?: string;
    marginBottom?: string;
    maxWidth?: string;
    borderRadius?: string;
    borderColor?: string;
    borderWidth?: string;
    shadow?: string;
    textAlign?: CSSProperties['textAlign'];
    visibility?: BuilderVisibility;
    responsive?: Partial<Record<BuilderViewport, BuilderStyle>>;
};

export type ModulePlacement = {
    id: string;
    mode: PlacementMode;
    module_id?: number;
    module_name?: string;
    module_type: string;
    hidden?: boolean;
    content_overrides?: CmsRecord;
    style_overrides?: BuilderStyle;
    detached_content?: CmsRecord;
    detached_style?: BuilderStyle;
    advanced_classes?: string;
    custom_css?: string;
};

export type BuilderColumn = {
    id: string;
    width?: string;
    settings?: CmsRecord;
    style?: BuilderStyle;
    modules: ModulePlacement[];
};

export type BuilderRow = {
    id: string;
    label?: string;
    settings?: CmsRecord;
    style?: BuilderStyle;
    columns: BuilderColumn[];
};

export type BuilderSection = {
    id: string;
    label?: string;
    hidden?: boolean;
    settings?: CmsRecord;
    style?: BuilderStyle;
    rows: BuilderRow[];
};

export type BuilderLayout = {
    version: number;
    enabled: boolean;
    sections: BuilderSection[];
    settings?: CmsRecord;
    review?: CmsRecord;
};

export type CmsModuleDefinition = {
    id: number;
    name: string;
    slug?: string;
    type: string;
    category?: string;
    content?: CmsRecord | null;
    style?: BuilderStyle | null;
    settings?: CmsRecord | null;
    advanced_classes?: string | null;
    custom_css?: string | null;
};

export type CmsFormFieldDefinition = {
    id?: number;
    type: string;
    label: string;
    name: string;
    placeholder?: string | null;
    help_text?: string | null;
    required?: boolean;
    options?: Array<string | { label: string; value: string }> | null;
    layout?: CmsRecord | null;
};

export type CmsFormDefinition = {
    id: number;
    name: string;
    slug?: string;
    submit_label: string;
    success_message?: string | null;
    style?: CmsRecord | null;
    fields: CmsFormFieldDefinition[];
};

export type FormControlRenderProps = {
    field: CmsFormFieldDefinition;
    value: unknown;
    controlId: string;
    errorId?: string;
    onChange: (value: unknown) => void;
};

export type FormLabelRenderProps = {
    field: CmsFormFieldDefinition;
    controlId?: string;
};

export type FormSubmitRenderProps = {
    label: string;
    processing: boolean;
    disabled: boolean;
};

export type ModuleRendererProps = {
    placement: ModulePlacement;
    module?: CmsModuleDefinition;
    forms: CmsFormDefinition[];
    pageId?: number | null;
    viewport?: BuilderViewport;
    editor?: boolean;
    formsDisabled?: boolean;
    host?: BuilderHost;
};

export type ModuleEditorProps = {
    placement: ModulePlacement;
    module?: CmsModuleDefinition;
    forms: CmsFormDefinition[];
    onChange: (placement: ModulePlacement) => void;
};

export type ModuleTypeDefinition = {
    type: string;
    label: string;
    category: string;
    description?: string;
    renderer: ComponentType<ModuleRendererProps>;
    editor?: ComponentType<ModuleEditorProps>;
    icon?: ComponentType<{ className?: string }>;
    defaultContent?: CmsRecord;
    defaultStyle?: BuilderStyle;
};

export type BuilderHost = {
    resolveRoute?: (name: string, parameters?: CmsRecord) => string;
    resolveFormSubmitUrl?: (form: CmsFormDefinition, pageId?: number | null) => string;
    renderLink?: (href: string, children: ReactNode, options?: BuilderLinkOptions) => ReactNode;
    renderButtonLink?: (href: string, children: ReactNode, options?: BuilderLinkOptions) => ReactNode;
    renderBrandMark?: (name: string, options?: { size?: number }) => ReactNode;
    resolveModuleItems?: (type: string, items: CmsRecord[], content?: CmsRecord) => CmsRecord[];
    renderModuleIcon?: (type: string, item: CmsRecord, index: number, options?: { className?: string }) => ReactNode;
    renderFormControl?: (props: FormControlRenderProps) => ReactNode;
    renderFormLabel?: (props: FormLabelRenderProps) => ReactNode;
    renderFormSubmit?: (props: FormSubmitRenderProps) => ReactNode;
    sanitizeRichText?: (html: unknown) => string;
};
