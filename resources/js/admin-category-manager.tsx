import { router } from '@inertiajs/react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { MadCmsAdminShell, type MadCmsAdminShellHost } from './admin-shell';
import type { CmsRecord } from './types';

type CategoryRecord = CmsRecord & {
    id?: number;
    title?: string;
    slug?: string;
    description?: string | null;
    parent_id?: number | null;
    order?: number;
    access?: { roles?: string[] } | null;
};

export type MadCmsCategoryManagerProps = {
    categories?: CategoryRecord[];
    mutationBasePath?: string;
    mutationsEnabled?: boolean;
    errors?: Record<string, string>;
    host?: MadCmsAdminShellHost;
};

const blankCategory = (): CategoryRecord => ({ title: '', slug: '', description: '', parent_id: null, order: 0, access: { roles: [] } });
const inputClass = 'mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm';

function CategoryEditor({
    category: initial,
    categories,
    mutationBasePath,
    mutationsEnabled,
    onCreated,
}: {
    category: CategoryRecord;
    categories: CategoryRecord[];
    mutationBasePath: string;
    mutationsEnabled: boolean;
    onCreated?: () => void;
}) {
    const [category, setCategory] = useState(initial);
    const [saving, setSaving] = useState(false);
    const roles = category.access?.roles || [];
    const save = () => {
        if (!mutationsEnabled || !category.title) return;
        setSaving(true);
        const options = { preserveScroll: true, onSuccess: onCreated, onFinish: () => setSaving(false) };
        if (category.id) router.put(`${mutationBasePath}/categories/${category.id}`, category as never, options);
        else router.post(`${mutationBasePath}/categories`, category as never, options);
    };

    return (
        <div className="grid gap-3 border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm font-medium">
                Title
                <input
                    className={inputClass}
                    value={String(category.title || '')}
                    onChange={(event) => setCategory({ ...category, title: event.target.value })}
                />
            </label>
            <label className="text-sm font-medium">
                Slug
                <input
                    className={inputClass}
                    value={String(category.slug || '')}
                    onChange={(event) => setCategory({ ...category, slug: event.target.value })}
                    placeholder="Generated from title"
                />
            </label>
            <label className="text-sm font-medium">
                Parent
                <select
                    className={inputClass}
                    value={String(category.parent_id || '')}
                    onChange={(event) => setCategory({ ...category, parent_id: event.target.value ? Number(event.target.value) : null })}
                >
                    <option value="">None</option>
                    {categories
                        .filter((item) => item.id !== category.id)
                        .map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.title}
                            </option>
                        ))}
                </select>
            </label>
            <label className="text-sm font-medium">
                Order
                <input
                    type="number"
                    className={inputClass}
                    value={String(category.order || 0)}
                    onChange={(event) => setCategory({ ...category, order: Number(event.target.value) })}
                />
            </label>
            <label className="text-sm font-medium md:col-span-2">
                Description
                <textarea
                    className={`${inputClass} min-h-20 py-2`}
                    value={String(category.description || '')}
                    onChange={(event) => setCategory({ ...category, description: event.target.value })}
                />
            </label>
            <label className="text-sm font-medium md:col-span-2">
                Required roles
                <input
                    className={inputClass}
                    value={roles.join(', ')}
                    onChange={(event) =>
                        setCategory({
                            ...category,
                            access: {
                                ...(category.access || {}),
                                roles: event.target.value
                                    .split(',')
                                    .map((role) => role.trim())
                                    .filter(Boolean),
                            },
                        })
                    }
                    placeholder="Blank for public visibility"
                />
            </label>
            <div className="flex gap-2 md:col-span-2 xl:col-span-4">
                <button
                    type="button"
                    onClick={save}
                    disabled={!mutationsEnabled || saving || !category.title}
                    className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-700 px-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : category.id ? 'Save category' : 'Create category'}
                </button>
                {category.id && (
                    <button
                        type="button"
                        disabled={!mutationsEnabled}
                        onClick={() => {
                            if (window.confirm(`Delete ${category.title}?`))
                                router.delete(`${mutationBasePath}/categories/${category.id}`, { preserveScroll: true });
                        }}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 disabled:opacity-50"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
}

export function MadCmsCategoryManager({
    categories = [],
    mutationBasePath = '/cms',
    mutationsEnabled = true,
    errors = {},
    host,
}: MadCmsCategoryManagerProps) {
    const [creating, setCreating] = useState(false);
    return (
        <MadCmsAdminShell
            activeSection="categories"
            title="Categories"
            description="Organise pages and control category visibility."
            actions={
                <button
                    type="button"
                    onClick={() => setCreating((value) => !value)}
                    className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white"
                >
                    <Plus className="h-4 w-4" />
                    Create category
                </button>
            }
            host={host}
        >
            {!mutationsEnabled && (
                <div className="mb-4 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Categories are read-only because package admin mutations are disabled.
                </div>
            )}
            {Object.keys(errors).length > 0 && (
                <div role="alert" className="mb-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
                    {Object.values(errors).join(' ')}
                </div>
            )}
            <div className="space-y-3">
                {creating && (
                    <CategoryEditor
                        category={blankCategory()}
                        categories={categories}
                        mutationBasePath={mutationBasePath}
                        mutationsEnabled={mutationsEnabled}
                        onCreated={() => setCreating(false)}
                    />
                )}
                {categories.map((category) => (
                    <CategoryEditor
                        key={category.id}
                        category={category}
                        categories={categories}
                        mutationBasePath={mutationBasePath}
                        mutationsEnabled={mutationsEnabled}
                    />
                ))}
                {categories.length === 0 && !creating && (
                    <div className="border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No categories yet.</div>
                )}
            </div>
        </MadCmsAdminShell>
    );
}
