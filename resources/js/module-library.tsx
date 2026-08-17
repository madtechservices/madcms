import { Box, LayoutTemplate, Plus, Search } from 'lucide-react';
import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react';

import type { CmsRecord } from './types';

export type LibraryModule = {
    id: number;
    name: string;
    slug?: string;
    type: string;
    category?: string | null;
    content?: CmsRecord | null;
};

export type LibraryModuleCard = LibraryModule & { group: string; summary: string };
export type LibraryStarter = { id: string; name: string; type: string; summary: string };
export type LibraryTarget = { value: string; label: string };
export type ActiveLibraryTarget = LibraryTarget & { sectionIndex: number; rowIndex: number; columnIndex: number; selected: boolean };

export type CanvasComponentPickerHost = {
    renderPanel?: (props: {
        eyebrow: string;
        title: string;
        subtitle?: string;
        badges?: ReactNode;
        children: ReactNode;
        onClose: () => void;
    }) => ReactNode;
    renderSearchInput?: (props: {
        value: string;
        placeholder: string;
        autoFocus: boolean;
        className: string;
        onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    }) => ReactNode;
};

export type CanvasComponentPickerProps = {
    targetLabel: string;
    modules: LibraryModule[];
    starters: LibraryStarter[];
    recentModuleIds?: number[];
    onInsertModule: (module: LibraryModule) => void;
    onInsertStarter: (starter: LibraryStarter) => void;
    onClose: () => void;
    host?: CanvasComponentPickerHost;
};

export function collectLibraryText(value: unknown): string[] {
    if (typeof value === 'string') return value.trim() ? [value.trim()] : [];
    if (Array.isArray(value)) return value.flatMap((item) => collectLibraryText(item));
    if (!value || typeof value !== 'object') return [];

    return Object.entries(value as CmsRecord)
        .filter(([key]) => !['href', 'url', 'src', 'icon', 'form_id'].includes(key))
        .flatMap(([, item]) => collectLibraryText(item));
}

export function moduleSummary(content: unknown, maxLength = 140) {
    return collectLibraryText(content).join(' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

export function moduleLibraryCategories(modules: LibraryModule[]) {
    return Array.from(new Set(modules.map((module) => module.category || module.type || 'content'))).sort((a, b) => a.localeCompare(b));
}

export function groupLibraryModules<T extends LibraryModule>(modules: T[], search = '', category = ''): Record<string, T[]> {
    const needle = search.trim().toLowerCase();

    return modules
        .filter((module) => {
            const group = module.category || module.type || 'content';
            if (category && group !== category) return false;
            if (!needle) return true;

            return [module.name, module.slug, module.type, module.category]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(needle));
        })
        .reduce<Record<string, T[]>>((groups, module) => {
            const label = module.category || module.type || 'content';
            groups[label] = groups[label] || [];
            groups[label].push(module);
            return groups;
        }, {});
}

export function libraryResultCount<T extends LibraryModule>(groups: Record<string, T[]>) {
    return Object.values(groups).reduce((count, modules) => count + modules.length, 0);
}

export function libraryModuleCards<T extends LibraryModule>(groups: Record<string, T[]>): Array<T & { group: string; summary: string }> {
    return Object.entries(groups).flatMap(([group, modules]) =>
        modules.map((module) => ({ ...module, group, summary: moduleSummary(module.content) })),
    );
}

export function canvasPickerModules<T extends LibraryModule>(modules: T[]): Array<T & { summary: string }> {
    return modules.map((module) => ({ ...module, summary: moduleSummary(module.content) }));
}

export function moduleLibraryTargets(sections: CmsRecord[]): LibraryTarget[] {
    return sections.flatMap((section, sectionIndex) => {
        const rows = Array.isArray(section.rows) ? (section.rows as CmsRecord[]) : [];

        return rows.flatMap((row, rowIndex) => {
            const rowLabel = row.label || `Row ${rowIndex + 1}`;
            const columns = Array.isArray(row.columns) ? (row.columns as CmsRecord[]) : [];

            return columns.map((column, columnIndex) => ({
                value: `${sectionIndex}:${rowIndex}:${columnIndex}`,
                label: `${section.label || `Section ${sectionIndex + 1}`} / ${rowLabel} / ${column.label || `Column ${columnIndex + 1}`} (${column.width || 'full'})`,
            }));
        });
    });
}

export function activeModuleLibraryTarget(targets: LibraryTarget[], requestedValue = ''): ActiveLibraryTarget {
    const selected = targets.some((target) => target.value === requestedValue);
    const value = selected ? requestedValue : targets[0]?.value || '';
    const [sectionIndex = 0, rowIndex = 0, columnIndex = 0] = value.split(':').map(Number);

    return {
        value,
        label: targets.find((target) => target.value === value)?.label || '',
        sectionIndex,
        rowIndex,
        columnIndex,
        selected,
    };
}

function DefaultPanel({ eyebrow, title, subtitle, badges, children, onClose }: Parameters<NonNullable<CanvasComponentPickerHost['renderPanel']>>[0]) {
    return (
        <aside className="absolute inset-y-0 right-0 z-30 flex w-full max-w-[430px] flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-xs font-semibold text-blue-700 uppercase">{eyebrow}</div>
                        <div className="mt-1 truncate text-base font-semibold text-slate-950">{title}</div>
                        {subtitle && <div className="mt-1 line-clamp-2 text-xs text-slate-500">{subtitle}</div>}
                    </div>
                    <button
                        type="button"
                        className="h-9 px-3 text-sm text-slate-600 hover:bg-slate-100"
                        onClick={onClose}
                        aria-label="Close properties"
                    >
                        Close
                    </button>
                </div>
                {badges && <div className="mt-3 flex flex-wrap gap-2">{badges}</div>}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </aside>
    );
}

export function CanvasComponentPicker({
    targetLabel,
    modules,
    starters,
    recentModuleIds = [],
    onInsertModule,
    onInsertStarter,
    onClose,
    host,
}: CanvasComponentPickerProps) {
    const [mode, setMode] = useState<'elements' | 'reusable'>('elements');
    const [search, setSearch] = useState('');
    const needle = search.trim().toLowerCase();
    const filteredStarters = useMemo(
        () => starters.filter((starter) => [starter.name, starter.type, starter.summary].some((value) => value.toLowerCase().includes(needle))),
        [needle, starters],
    );
    const filteredModules = useMemo(() => {
        const recentOrder = new Map(recentModuleIds.map((id, index) => [id, index]));

        return modules
            .filter((module) =>
                [module.name, module.type, module.category, moduleSummary(module.content)]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(needle)),
            )
            .sort((a, b) => {
                const aRecent = recentOrder.get(a.id);
                const bRecent = recentOrder.get(b.id);
                if (aRecent !== undefined || bRecent !== undefined) {
                    if (aRecent === undefined) return 1;
                    if (bRecent === undefined) return -1;
                    return aRecent - bRecent;
                }
                return a.name.localeCompare(b.name);
            });
    }, [modules, needle, recentModuleIds]);
    const resultCount = mode === 'elements' ? filteredStarters.length : filteredModules.length;
    const badges = (
        <>
            {(['elements', 'reusable'] as const).map((item) => {
                const Icon = item === 'elements' ? LayoutTemplate : Box;
                return (
                    <button
                        key={item}
                        type="button"
                        onClick={() => setMode(item)}
                        className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2 text-xs font-medium ${mode === item ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                    >
                        <Icon className="h-3.5 w-3.5" /> {item === 'elements' ? 'Elements' : 'Reusable'}
                    </button>
                );
            })}
        </>
    );
    const body = (
        <div className="p-4">
            <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                {host?.renderSearchInput ? (
                    host.renderSearchInput({
                        value: search,
                        onChange: (event) => setSearch(event.target.value),
                        placeholder: mode === 'elements' ? 'Search page elements...' : 'Search reusable modules...',
                        className: 'pl-9',
                        autoFocus: true,
                    })
                ) : (
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={mode === 'elements' ? 'Search page elements...' : 'Search reusable modules...'}
                        className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 pl-9 text-sm"
                        autoFocus
                    />
                )}
            </div>
            <div className="mt-2 text-xs text-slate-500">
                {resultCount} {mode === 'elements' ? 'element' : 'module'}
                {resultCount === 1 ? '' : 's'}
            </div>
            <div className="mt-3 grid gap-2 pb-1 sm:grid-cols-2">
                {(mode === 'elements' ? filteredStarters : filteredModules).map((item) => (
                    <button
                        key={`${mode}-${item.id}`}
                        type="button"
                        onClick={() => (mode === 'elements' ? onInsertStarter(item as LibraryStarter) : onInsertModule(item as LibraryModule))}
                        className="border border-slate-200 bg-white p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="text-sm font-semibold text-slate-950">{item.name}</div>
                            <Plus className="h-4 w-4 shrink-0 text-indigo-600" />
                        </div>
                        <div className="mt-1 text-[11px] font-medium text-indigo-700 uppercase">
                            {'category' in item && item.category ? item.category : item.type}
                        </div>
                        <div className="mt-2 line-clamp-2 text-xs text-slate-600">
                            {'summary' in item && item.summary ? item.summary : 'Reusable module'}
                        </div>
                    </button>
                ))}
                {resultCount === 0 && (
                    <div className="col-span-full border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                        No matching {mode === 'elements' ? 'elements' : 'modules'}.
                    </div>
                )}
            </div>
        </div>
    );

    if (host?.renderPanel)
        return (
            <>{host.renderPanel({ eyebrow: 'Component library', title: 'Add component', subtitle: targetLabel, badges, children: body, onClose })}</>
        );
    return (
        <DefaultPanel eyebrow="Component library" title="Add component" subtitle={targetLabel} badges={badges} onClose={onClose}>
            {body}
        </DefaultPanel>
    );
}
