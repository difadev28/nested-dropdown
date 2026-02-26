import { Link } from 'react-router-dom';
import type { Province, Regency, District } from '@/features/region/types';
import { cn } from '@/utils/cn';

interface BreadcrumbProps {
    province: Province | null;
    regency: Regency | null;
    district: District | null;
}

export function Breadcrumb({ province, regency, district }: BreadcrumbProps) {
    return (
        <nav aria-label="breadcrumb" className="breadcrumb flex items-center gap-1.5 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-800 transition-colors">
                Home
            </Link>

            {province && (
                <>
                    <span className="text-gray-300" aria-hidden="true">/</span>
                    <Link
                        to={`?province=${province.id}`}
                        className={cn(
                            'hover:text-gray-800 transition-colors',
                            !regency && 'text-gray-800 font-medium',
                        )}
                        {...(!regency ? { 'aria-current': 'page' as const } : {})}
                    >
                        {province.name}
                    </Link>
                </>
            )}

            {regency && (
                <>
                    <span className="text-gray-300" aria-hidden="true">/</span>
                    <Link
                        to={`?province=${province!.id}&regency=${regency.id}`}
                        className={cn(
                            'hover:text-gray-800 transition-colors',
                            !district && 'text-gray-800 font-medium',
                        )}
                        {...(!district ? { 'aria-current': 'page' as const } : {})}
                    >
                        {regency.name}
                    </Link>
                </>
            )}

            {district && (
                <>
                    <span className="text-gray-300" aria-hidden="true">/</span>
                    <span
                        className="text-gray-800 font-medium"
                        aria-current="page"
                    >
                        {district.name}
                    </span>
                </>
            )}
        </nav>
    );
}
