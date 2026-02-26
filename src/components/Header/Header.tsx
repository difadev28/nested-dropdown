import { useLoaderData } from 'react-router-dom';
import type { LoaderData } from '@/features/region/types';
import { Breadcrumb } from '../Breadcrumb';

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { provinces, regencies, districts, selected } = useLoaderData() as LoaderData;

    const activeProvince = provinces.find((p) => p.id === selected.provinceId) ?? null;
    const activeRegency = regencies.find((r) => r.id === selected.regencyId) ?? null;
    const activeDistrict = districts.find((d) => d.id === selected.districtId) ?? null;

    return (
        <header className="flex items-center h-14 md:h-16 px-4 md:px-6 bg-white border-b border-gray-200 shrink-0 sticky top-0 z-10">
            {/* Hamburger menu button - mobile only */}
            <button
                onClick={onMenuClick}
                className="lg:hidden p-2 -ml-2 mr-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <Breadcrumb
                province={activeProvince}
                regency={activeRegency}
                district={activeDistrict}
            />
        </header>
    );
}
