import { ClipboardCopy, ClipboardPaste, Copy, Eye, EyeOff, Link2, MoveLeft, MoveRight, Trash2, Unlink } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';

export type PropertyPanelActionProps = {
    label: string;
    title?: string;
    icon?: ReactNode;
    children?: ReactNode;
    disabled?: boolean;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'icon';
    onClick: () => void;
};

export type PropertyPanelHost = {
    renderPanel?: (props: {
        eyebrow: string;
        title: string;
        subtitle?: string;
        badges?: ReactNode;
        children: ReactNode;
        footer?: ReactNode;
        onClose: () => void;
    }) => ReactNode;
    renderAction?: (props: PropertyPanelActionProps) => ReactNode;
};

export type CanvasPropertiesPanelProps = {
    title: string;
    locationLabel: string;
    mode: 'linked' | 'detached';
    hidden: boolean;
    activeTab: 'content' | 'design';
    contentFields: ReactNode;
    designFields: ReactNode;
    canMoveBackward: boolean;
    canMoveForward: boolean;
    onSelectTab: (tab: 'content' | 'design') => void;
    onToggleHidden: () => void;
    onDuplicate: () => void;
    onCopy: () => void;
    onPaste: () => void;
    onDetach: () => void;
    onRelink: () => void;
    onMoveBackward: () => void;
    onMoveForward: () => void;
    onRemove: () => void;
    onSelectParent: (type: 'section' | 'row' | 'column') => void;
    onClose: () => void;
    host?: PropertyPanelHost;
};

function NativeAction({ label, title, icon, children, disabled, onClick, size = 'sm', variant = 'outline' }: PropertyPanelActionProps) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            aria-label={label}
            title={title}
            className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium disabled:opacity-50 ${size === 'icon' ? 'h-9 w-9 px-0' : 'h-9'} ${variant === 'default' ? 'border-slate-950 bg-slate-950 text-white' : variant === 'ghost' ? 'border-transparent bg-transparent text-slate-700 hover:bg-slate-100' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
        >
            {icon}
            {children}
        </button>
    );
}

function NativePanel({ title, subtitle, badges, children, footer }: Parameters<NonNullable<PropertyPanelHost['renderPanel']>>[0]) {
    return (
        <aside
            className="absolute inset-y-0 right-0 z-30 flex w-full max-w-[430px] flex-col border-l border-slate-200 bg-white shadow-2xl"
            aria-label={`Properties for ${title}`}
        >
            <div className="border-b border-slate-200 px-4 py-3">
                <div className="text-xs font-semibold text-blue-700 uppercase">Component properties</div>
                <div className="mt-1 truncate text-base font-semibold text-slate-950">{title}</div>
                {subtitle && <div className="mt-1 line-clamp-2 text-xs text-slate-500">{subtitle}</div>}
                {badges && <div className="mt-3 flex flex-wrap gap-2">{badges}</div>}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="border-t border-slate-200 bg-slate-50 p-3">{footer}</div>}
        </aside>
    );
}

export function CanvasPropertiesPanel({
    title,
    locationLabel,
    mode,
    hidden,
    activeTab,
    contentFields,
    designFields,
    canMoveBackward,
    canMoveForward,
    onSelectTab,
    onToggleHidden,
    onDuplicate,
    onCopy,
    onPaste,
    onDetach,
    onRelink,
    onMoveBackward,
    onMoveForward,
    onRemove,
    onSelectParent,
    onClose,
    host,
}: CanvasPropertiesPanelProps) {
    const action = (props: PropertyPanelActionProps) => (host?.renderAction ? host.renderAction(props) : <NativeAction {...props} />);
    const badges = (
        <>
            <span
                className={`rounded-full px-2 py-1 text-[11px] font-medium ${mode === 'detached' ? 'bg-violet-100 text-violet-800' : 'bg-emerald-100 text-emerald-800'}`}
            >
                {mode === 'detached' ? 'Page-only' : 'Linked master'}
            </span>
            <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${hidden ? 'bg-slate-200 text-slate-700' : 'bg-blue-50 text-blue-700'}`}>
                {hidden ? 'Hidden' : 'Visible'}
            </span>
        </>
    );
    const footer = (
        <>
            <div className="mb-2 flex flex-wrap gap-2">
                {(['section', 'row', 'column'] as const).map((type) => (
                    <Fragment key={type}>
                        {action({
                            label: type.charAt(0).toUpperCase() + type.slice(1),
                            children: type.charAt(0).toUpperCase() + type.slice(1),
                            size: 'sm',
                            onClick: () => onSelectParent(type),
                        })}
                    </Fragment>
                ))}
            </div>
            <div className="flex flex-wrap gap-2">
                {action({
                    label: hidden ? 'Show component' : 'Hide component',
                    title: hidden ? 'Show component' : 'Hide component',
                    icon: hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />,
                    size: 'icon',
                    onClick: onToggleHidden,
                })}
                {action({
                    label: 'Move component backward',
                    title: 'Move backward',
                    icon: <MoveLeft className="h-4 w-4" />,
                    disabled: !canMoveBackward,
                    size: 'icon',
                    onClick: onMoveBackward,
                })}
                {action({
                    label: 'Move component forward',
                    title: 'Move forward',
                    icon: <MoveRight className="h-4 w-4" />,
                    disabled: !canMoveForward,
                    size: 'icon',
                    onClick: onMoveForward,
                })}
                {action({ label: 'Duplicate component', title: 'Duplicate', icon: <Copy className="h-4 w-4" />, size: 'icon', onClick: onDuplicate })}
                {action({ label: 'Copy component', title: 'Copy', icon: <ClipboardCopy className="h-4 w-4" />, size: 'icon', onClick: onCopy })}
                {action({
                    label: 'Paste component after this one',
                    title: 'Paste after',
                    icon: <ClipboardPaste className="h-4 w-4" />,
                    size: 'icon',
                    onClick: onPaste,
                })}
                {mode === 'detached'
                    ? action({
                          label: 'Re-link component to master',
                          title: 'Re-link to master',
                          icon: <Link2 className="h-4 w-4" />,
                          size: 'icon',
                          onClick: onRelink,
                      })
                    : action({
                          label: 'Customize component for this page',
                          title: 'Customize for this page',
                          icon: <Unlink className="h-4 w-4" />,
                          size: 'icon',
                          onClick: onDetach,
                      })}
                {action({ label: 'Remove component', title: 'Remove', icon: <Trash2 className="h-4 w-4" />, size: 'icon', onClick: onRemove })}
            </div>
        </>
    );
    const body = (
        <>
            <div className="flex border-b border-slate-200 bg-slate-50 p-1">
                {(['content', 'design'] as const).map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => onSelectTab(tab)}
                        className={`h-9 flex-1 text-sm font-medium ${activeTab === tab ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-950'}`}
                    >
                        {tab === 'content' ? 'Content' : 'Design'}
                    </button>
                ))}
            </div>
            <div className="p-4">{activeTab === 'content' ? contentFields : designFields}</div>
        </>
    );

    if (host?.renderPanel)
        return <>{host.renderPanel({ eyebrow: 'Component properties', title, subtitle: locationLabel, badges, children: body, footer, onClose })}</>;
    return (
        <NativePanel eyebrow="Component properties" title={title} subtitle={locationLabel} badges={badges} footer={footer} onClose={onClose}>
            {body}
        </NativePanel>
    );
}
