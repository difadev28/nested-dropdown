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
        <nav aria-label="breadcrumb" className="breadcrumb flex items-center gap-1 md:gap-1.5 font-semibold text-[12px] md:text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-800 transition-colors">
                {province ? 'Indonesia' : 'Home'}
            </Link>

            {province && (
                <>
                    <span className="text-gray-300" aria-hidden="true">
                        <img src="/icons/chevron-right.svg" className='mt-1' width="11" className="md:w-[13px]" alt="" />
                    </span>
                    <Link
                        to={`?province=${province.id}`}
                        className={cn(
                            'hover:text-gray-800 transition-colors truncate max-w-[120px] md:max-w-none',
                            !regency && 'text-blue-700 font-medium',
                        )}
                        {...(!regency ? { 'aria-current': 'page' as const } : {})}
                    >
                        {province.name}
                    </Link>
                </>
            )}

            {regency && (
                <>
                    <span className="text-gray-300" aria-hidden="true">
                        <img src="/icons/chevron-right.svg" className='mt-1' width="11" className="md:w-[13px]" alt="" />
                    </span>
                    <Link
                        to={`?province=${province!.id}&regency=${regency.id}`}
                        className={cn(
                            'hover:text-gray-800 transition-colors truncate max-w-[120px] md:max-w-none',
                            !district && 'text-blue-700 font-medium',
                        )}
                        {...(!district ? { 'aria-current': 'page' as const } : {})}
                    >
                        {regency.name}
                    </Link>
                </>
            )}

            {district && (
                <>
                    <span className="text-gray-300" aria-hidden="true">
                        <img src="/icons/chevron-right.svg" className='mt-1' width="11" className="md:w-[13px]" alt="" />
                    </span>
                    <span
                        className="text-blue-700 font-medium truncate max-w-[120px] md:max-w-none"
                        aria-current="page"
                    >
                        {district.name}
                    </span>
                </>
            )}
        </nav>
    );
}
