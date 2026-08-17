import type { ReactNode } from 'react';

export type ResponsiveDevice = 'mobile' | 'tablet' | 'desktop';

export type ResponsiveDeviceStyle = Record<string, unknown>;

export type ResponsiveStyleInputProps = {
    id: string;
    label: string;
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
};

export type ResponsiveStyleSelectProps = ResponsiveStyleInputProps & {
    options: Array<{ label: string; value: string }>;
};

export type ResponsiveStyleClearProps = {
    device: ResponsiveDevice;
    disabled: boolean;
    onClick: () => void;
};

export type ResponsiveStyleControlsHost = {
    renderLabel?: (label: string, controlId: string) => ReactNode;
    renderInput?: (props: ResponsiveStyleInputProps) => ReactNode;
    renderSelect?: (props: ResponsiveStyleSelectProps) => ReactNode;
    renderClear?: (props: ResponsiveStyleClearProps) => ReactNode;
};

export type ResponsiveStyleControlsProps = {
    responsive?: Record<string, ResponsiveDeviceStyle>;
    devices?: ResponsiveDevice[];
    controlIdPrefix?: string;
    host?: ResponsiveStyleControlsHost;
    onChange: (device: ResponsiveDevice, key: string, value: string) => void;
    onClear?: (device: ResponsiveDevice) => void;
};

const textFields = [
    { key: 'paddingTop', label: 'Padding top', placeholder: 'e.g. 3rem' },
    { key: 'paddingBottom', label: 'Padding bottom', placeholder: 'e.g. 3rem' },
    { key: 'marginTop', label: 'Margin top', placeholder: 'e.g. 1rem' },
    { key: 'marginBottom', label: 'Margin bottom', placeholder: 'e.g. 1rem' },
    { key: 'fontSize', label: 'Font size', placeholder: 'e.g. 1rem' },
    { key: 'lineHeight', label: 'Line height', placeholder: 'e.g. 1.6' },
] as const;

const alignmentOptions = [
    { value: '', label: 'Inherit' },
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
];

function NativeLabel({ label, controlId }: { label: string; controlId: string }) {
    return (
        <label htmlFor={controlId} className="text-sm font-medium text-slate-900">
            {label}
        </label>
    );
}

function NativeInput({ id, value, placeholder, onChange }: ResponsiveStyleInputProps) {
    return (
        <input
            id={id}
            value={value}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
        />
    );
}

function NativeSelect({ id, value, options, onChange }: ResponsiveStyleSelectProps) {
    return (
        <select
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
        >
            {options.map((option) => (
                <option key={option.value || 'inherit'} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}

function NativeClear({ disabled, onClick }: ResponsiveStyleClearProps) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className="h-8 rounded-md px-3 text-sm font-medium text-slate-600 hover:bg-white disabled:opacity-50"
        >
            Clear
        </button>
    );
}

export function ResponsiveStyleControls({
    responsive = {},
    devices = ['mobile', 'tablet', 'desktop'],
    controlIdPrefix = 'responsive-style',
    host,
    onChange,
    onClear,
}: ResponsiveStyleControlsProps) {
    const label = (text: string, controlId: string) => host?.renderLabel?.(text, controlId) || <NativeLabel label={text} controlId={controlId} />;
    const input = (props: ResponsiveStyleInputProps) => host?.renderInput?.(props) || <NativeInput {...props} />;
    const select = (props: ResponsiveStyleSelectProps) => host?.renderSelect?.(props) || <NativeSelect {...props} />;
    const clear = (props: ResponsiveStyleClearProps) => host?.renderClear?.(props) || <NativeClear {...props} />;

    return (
        <div className={`grid gap-3 ${devices.length > 1 ? 'xl:grid-cols-3' : ''}`}>
            {devices.map((device) => {
                const style = responsive[device] || {};

                return (
                    <div key={device} className="rounded-md border border-slate-200 bg-slate-50 p-3" data-responsive-device={device}>
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-semibold text-slate-600 uppercase">{device}</div>
                            {onClear &&
                                clear({
                                    device,
                                    disabled: !responsive[device],
                                    onClick: () => onClear(device),
                                })}
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {textFields.map((field) => {
                                const controlId = `${controlIdPrefix}-${device}-${field.key}`;
                                const props: ResponsiveStyleInputProps = {
                                    id: controlId,
                                    label: field.label,
                                    value: String(style[field.key] || ''),
                                    placeholder: field.placeholder,
                                    onChange: (value) => onChange(device, field.key, value),
                                };

                                return (
                                    <div key={field.key}>
                                        {label(field.label, controlId)}
                                        {input(props)}
                                    </div>
                                );
                            })}
                            <div className="sm:col-span-2">
                                {label('Text align', `${controlIdPrefix}-${device}-textAlign`)}
                                {select({
                                    id: `${controlIdPrefix}-${device}-textAlign`,
                                    label: 'Text align',
                                    value: String(style.textAlign || ''),
                                    options: alignmentOptions,
                                    onChange: (value) => onChange(device, 'textAlign', value),
                                })}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
