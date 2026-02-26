import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRouteLoaderData } from 'react-router-dom';
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
        if (!value) {
            navigate('/', { replace: true });
        } else {
            navigate(`?province=${value}`, { replace: true });
        }
    }

    function handleRegencyChange(value: string) {
        const pId = searchParams.get('province');
        if (!value) {
            navigate(`?province=${pId}`, { replace: true });
        } else {
            navigate(`?province=${pId}&regency=${value}`, { replace: true });
        }
    }

    function handleDistrictChange(value: string) {
        const pId = searchParams.get('province');
        const rId = searchParams.get('regency');
        if (!value) {
            navigate(`?province=${pId}&regency=${rId}`, { replace: true });
        } else {
            navigate(`?province=${pId}&regency=${rId}&district=${value}`, { replace: true });
        }
    }

    return (
        <aside className="flex flex-col w-64 h-full bg-white border-r border-gray-200 shrink-0">
            {/* Logo */}
            <div className="flex items-center h-16 px-4 border-b border-gray-200 shrink-0">
                <span className="text-sm font-bold tracking-wide text-gray-800 uppercase">
                    Wilayah App
                </span>
            </div>

            {/* Filter dropdowns */}
            <div className="flex flex-col flex-1 overflow-y-auto p-4 gap-5">
                <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Filter Wilayah
                </p>

                <div className="flex flex-col gap-4">
                    <Combobox
                        name="province"
                        label="Provinsi"
                        options={provinces}
                        value={provinceValue}
                        onChange={handleProvinceChange}
                    />
                    <Combobox
                        name="regency"
                        label="Kota / Kabupaten"
                        options={filteredRegencies}
                        value={regencyValue}
                        onChange={handleRegencyChange}
                        disabled={!selected.provinceId}
                    />
                    <Combobox
                        name="district"
                        label="Kecamatan"
                        options={filteredDistricts}
                        value={districtValue}
                        onChange={handleDistrictChange}
                        disabled={!selected.regencyId}
                    />
                </div>

                {/* Reset */}
                <button
                    type="button"
                    onClick={() => navigate('/', { replace: true })}
                    disabled={!hasFilters}
                    className="mt-auto py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-md
                     hover:bg-red-50 transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Reset Filter
                </button>
            </div>
        </aside>
    );
}
