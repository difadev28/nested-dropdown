import { useLoaderData } from 'react-router-dom';
import type { LoaderData } from '@/features/region/types';
import { Breadcrumb } from '../Breadcrumb';

export function Header() {
    const { provinces, regencies, districts, selected } = useLoaderData() as LoaderData;

    const activeProvince = provinces.find((p) => p.id === selected.provinceId) ?? null;
    const activeRegency = regencies.find((r) => r.id === selected.regencyId) ?? null;
    const activeDistrict = districts.find((d) => d.id === selected.districtId) ?? null;

    return (
        <header className="flex items-center h-16 px-6 bg-white border-b border-gray-200 shrink-0 sticky top-0 z-10">
            <Breadcrumb
                province={activeProvince}
                regency={activeRegency}
                district={activeDistrict}
            />
        </header>
    );
}
