import { Link } from '@inertiajs/react';
import type { AdminCollectionHost } from '../../vendor/madcms/admin-collections';

const destination = (href: string, basePath: string) => (href.startsWith('/cms') ? `${basePath}${href.slice(4)}` : href);

export function adminHost(basePath: string): AdminCollectionHost {
    return {
        renderLink: (item, content, active) => (
            <Link
                href={destination(item.href, basePath)}
                aria-current={active ? 'page' : undefined}
                className={`block rounded-md ${active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
                {content}
            </Link>
        ),
        renderResourceLink: (href, label, ariaLabel) => (
            <Link href={destination(href, basePath)} aria-label={ariaLabel} className="font-medium text-blue-700 hover:underline">
                {label}
            </Link>
        ),
    };
}
