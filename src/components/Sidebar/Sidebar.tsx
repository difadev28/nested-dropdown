import { useNavigate, useSearchParams, useRouteLoaderData } from 'react-router-dom';
import { Combobox } from '@/components/Combobox';
import type { LoaderData } from '@/features/region/types';
import { useEffect } from 'react';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const { provinces, regencies, districts, selected } = useRouteLoaderData('root') as LoaderData;
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const hasFilters = searchParams.has('province');

    // Close sidebar on mobile when route changes
    useEffect(() => {
        if (isOpen && window.innerWidth < 1024) {
            onClose?.();
        }
    }, [searchParams]);

    // ── Filtered options ─────────────────────────────────────────────────────────
    const filteredRegencies = selected.provinceId
        ? regencies.filter((r) => r.province_id === selected.provinceId)
        : [];

    const filteredDistricts = selected.regencyId
        ? districts.filter((d) => d.regency_id === selected.regencyId)
        : [];

    // ── Controlled values ────────────────────────────────────────────────────────
    const provinceValue = selected.provinceId ? String(selected.provinceId) : '';
    const regencyValue = selected.regencyId ? String(selected.regencyId) : '';
    const districtValue = selected.districtId ? String(selected.districtId) : '';

    // ── Cascade-reset handlers ───────────────────────────────────────────────────
    function handleProvinceChange(value: string) {
        if (value) {
            navigate(`?province=${value}`, { replace: true });
        } else {
            navigate('/', { replace: true });
        }
    }

    function handleRegencyChange(value: string) {
        const pId = searchParams.get('province');
        if (value) {
            navigate(`?province=${pId}&regency=${value}`, { replace: true });
        } else {
            navigate(`?province=${pId}`, { replace: true });
        }
    }

    function handleDistrictChange(value: string) {
        const pId = searchParams.get('province');
        const rId = searchParams.get('regency');
        if (value) {
            navigate(`?province=${pId}&regency=${rId}&district=${value}`, { replace: true });
        } else {
            navigate(`?province=${pId}&regency=${rId}`, { replace: true });
        }
    }

    return (
        <aside className={`
            fixed lg:relative inset-y-0 left-0 z-50
            flex flex-col w-72 md:w-80 h-full
            bg-white border-r border-gray-200 shrink-0
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
            {/* Close button - mobile only */}
            <button
                onClick={onClose}
                className="lg:hidden absolute top-3 right-3 p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                aria-label="Close menu"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center h-14 md:h-16 px-4 md:px-8 shrink-0">
                <div className='flex flex-row items-center gap-2 mt-5 md:mt-7'>
                    <div className='p-1.5 md:p-2 bg-blue-50 rounded-full'>
                        <img src="/icons/globe.svg" width={20} className="md:w-[24px]" alt="" />
                    </div>
                    <span className="font-bold text-sm md:text-base tracking-wide text-gray-800">
                        Frontend Assestment
                    </span>
                </div>
            </div>

            {/* Filter dropdowns */}
            <div className="flex flex-col flex-1 overflow-y-auto p-4 md:p-8 gap-4 md:gap-5 mt-4 md:mt-8">
                <p className="text-[10px] md:text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Filter Wilayah
                </p>

                <div className="flex flex-col gap-4 md:gap-6 mt-4 md:mt-8">
                    <Combobox
                        name="province"
                        label="Provinsi"
                        options={provinces}
                        value={provinceValue}
                        onChange={handleProvinceChange}
                        icon="/icons/map.png"
                    />
                    <Combobox
                        name="regency"
                        label="Kota / Kabupaten"
                        options={filteredRegencies}
                        value={regencyValue}
                        onChange={handleRegencyChange}
                        disabled={!selected.provinceId}
                        icon="/icons/building.png"
                    />
                    <Combobox
                        name="district"
                        label="Kecamatan"
                        options={filteredDistricts}
                        value={districtValue}
                        onChange={handleDistrictChange}
                        disabled={!selected.regencyId}
                        icon="/icons/marker.png"
                    />
                    <button
                        type="button"
                        onClick={() => navigate('/', { replace: true })}
                        disabled={!hasFilters}
                        className="mt-auto py-3 md:py-4 text-[10px] md:text-xs font-medium border-2 rounded-xl md:rounded-2xl
                     bg-blue-50 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed uppercase flex items-center justify-center border-blue-700 gap-1.5 md:gap-2 text-gray-800 cursor-pointer"
                    >
                        <img src="/icons/off.svg" width={12} className="md:w-[14px]" alt="" />
                        <span>Reset</span>
                    </button>
                </div>

                {/* Reset */}
            </div>
        </aside>
    );
}
