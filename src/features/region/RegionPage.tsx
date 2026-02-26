import { useRouteLoaderData } from 'react-router-dom';
import { RegionSummary } from './RegionSummary';
import type { LoaderData } from './types';

export function RegionPage() {
    const { provinces, regencies, districts, selected } = useRouteLoaderData('root') as LoaderData;

    const activeProvince = provinces.find((p) => p.id === selected.provinceId) ?? null;
    const activeRegency = regencies.find((r) => r.id === selected.regencyId) ?? null;
    const activeDistrict = districts.find((d) => d.id === selected.districtId) ?? null;

    return (
        <RegionSummary
            province={activeProvince}
            regency={activeRegency}
            district={activeDistrict}
        />
    );
}
