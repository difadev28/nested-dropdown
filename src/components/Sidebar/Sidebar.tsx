import { useNavigate, useSearchParams, useRouteLoaderData } from 'react-router-dom';
import { Combobox } from '@/components/Combobox';
import type { LoaderData } from '@/features/region/types';

export function Sidebar() {
    const { provinces, regencies, districts, selected } = useRouteLoaderData('root') as LoaderData;
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const hasFilters = searchParams.has('province');

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
        <aside className="flex flex-col w-80 h-full border-r border-gray-200 shrink-0">
            {/* Logo */}
            <div className="flex items-center h-16 px-8 shrink-0">
                <div className='flex flex-row items-center gap-2 mt-7'>
                    <div className='p-2 bg-blue-50 rounded-full'>
                        <img src="/icons/globe.svg" width={24} alt="" />
                    </div>
                    <span className="font-bold tracking-wide text-gray-800">
                        Frontend Assestment
                    </span>
                </div>
            </div>

            {/* Filter dropdowns */}
            <div className="flex flex-col flex-1 overflow-y-auto p-8 gap-5 mt-8">
                <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Filter Wilayah
                </p>

                <div className="flex flex-col gap-6 mt-8">
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
                        className="mt-auto py-4 text-xs font-medium border-2 rounded-2xl
                     bg-blue-50 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed uppercase flex items-center justify-center border-blue-700 gap-2 text-gray-800 cursor-pointer"
                    >
                        <img src="/icons/off.svg" width={14} alt="" />
                        <span>Reset</span>
                    </button>
                </div>

                {/* Reset */}
            </div>
        </aside>
    );
}
