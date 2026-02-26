import { cn } from '@/utils/cn';

interface SidebarFilterItemProps {
    readonly label: string;
    readonly isActive: boolean;
    readonly isExpanded: boolean;
    readonly depth: 0 | 1 | 2;
    readonly onClick: () => void;
    readonly children?: React.ReactNode;
}

const depthPadding: Record<0 | 1 | 2, string> = {
    0: 'pl-3',
    1: 'pl-6',
    2: 'pl-9',
};

export function SidebarFilterItem({
    label,
    isActive,
    isExpanded,
    depth,
    onClick,
    children,
}: SidebarFilterItemProps) {
    const hasChildren = Boolean(children);

    return (
        <div>
            <button
                type="button"
                onClick={onClick}
                className={cn(
                    'flex items-center gap-2 w-full py-1.5 pr-3 text-sm rounded-md transition-colors',
                    depthPadding[depth],
                    isActive
                        ? 'text-blue-600 font-semibold bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                )}
            >
                {/* Expand/collapse chevron (only if has children) */}
                {hasChildren ? (
                    <span
                        className={cn(
                            'shrink-0 transition-transform duration-200',
                            isExpanded ? 'rotate-90' : 'rotate-0',
                        )}
                        aria-hidden="true"
                    >
                        ›
                    </span>
                ) : (
                    <span className="shrink-0 w-3" aria-hidden="true" />
                )}

                <span className="truncate flex-1 text-left">{label}</span>

                {/* Active indicator dot */}
                {isActive && (
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" aria-hidden="true" />
                )}
            </button>

            {/* Children — only rendered when expanded */}
            {/* role="group" is required by slicing.md §8.9 — kept per spec contract */}
            {hasChildren && isExpanded && (
                // eslint-disable-next-line jsx-a11y/no-redundant-roles
                <div role="group">{children}</div>
            )}
        </div>
    );
}
