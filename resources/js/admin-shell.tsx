import { FileText, FolderTree, Inbox, LayoutTemplate, ListChecks } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

export type AdminSection = 'pages' | 'modules' | 'forms' | 'submissions' | 'categories';

export type AdminNavigationItem = {
    key: AdminSection | string;
    label: string;
    href: string;
    icon?: ComponentType<{ className?: string }>;
};

export type MadCmsAdminShellHost = {
    renderLink?: (item: AdminNavigationItem, content: ReactNode, active: boolean) => ReactNode;
};

export type MadCmsAdminShellProps = {
    activeSection?: AdminSection | string;
    actions?: ReactNode;
    children: ReactNode;
    description?: string;
    host?: MadCmsAdminShellHost;
    navigation?: AdminNavigationItem[];
    title: string;
};

export const DEFAULT_ADMIN_NAVIGATION: AdminNavigationItem[] = [
    { key: 'pages', label: 'Pages', href: '/cms/pages', icon: FileText },
    { key: 'modules', label: 'Modules', href: '/cms/modules', icon: LayoutTemplate },
    { key: 'forms', label: 'Forms', href: '/cms/forms', icon: ListChecks },
    { key: 'submissions', label: 'Submissions', href: '/cms/form-submissions', icon: Inbox },
    { key: 'categories', label: 'Categories', href: '/cms/categories', icon: FolderTree },
];

export function MadCmsAdminShell({
    activeSection = 'pages',
    actions,
    children,
    description,
    host,
    navigation = DEFAULT_ADMIN_NAVIGATION,
    title,
}: MadCmsAdminShellProps) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-950" data-madcms-admin-shell>
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex min-h-14 max-w-screen-2xl items-center px-4 sm:px-6">
                    <strong className="text-sm font-semibold">MAD CMS</strong>
                </div>
            </header>
            <div className="mx-auto grid max-w-screen-2xl md:grid-cols-[220px_minmax(0,1fr)]">
                <nav
                    aria-label="CMS navigation"
                    className="border-b border-slate-200 bg-white p-2 md:min-h-[calc(100vh-3.5rem)] md:border-r md:border-b-0"
                >
                    <div className="flex gap-1 overflow-x-auto md:grid">
                        {navigation.map((item) => {
                            const active = item.key === activeSection;
                            const Icon = item.icon;
                            const content = (
                                <span className="flex min-h-10 items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap">
                                    {Icon && <Icon className="h-4 w-4" />}
                                    {item.label}
                                </span>
                            );

                            return host?.renderLink ? (
                                <span key={item.key}>{host.renderLink(item, content, active)}</span>
                            ) : (
                                <a
                                    key={item.key}
                                    href={item.href}
                                    aria-current={active ? 'page' : undefined}
                                    className={`block rounded-md ${active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
                                >
                                    {content}
                                </a>
                            );
                        })}
                    </div>
                </nav>
                <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                        <div>
                            <h1 className="text-xl font-semibold">{title}</h1>
                            {description && <p className="mt-1 max-w-3xl text-sm text-slate-600">{description}</p>}
                        </div>
                        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
                    </div>
                    {children}
                </main>
            </div>
        </div>
    );
}
