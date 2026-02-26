import type { Regency, District } from '@/features/region/types';

export function filterRegenciesByProvince(
    regencies: Regency[],
    provinceId: number | null,
): Regency[] {
    if (!provinceId) return [];
    return regencies.filter((r) => r.province_id === provinceId);
}

export function filterDistrictsByRegency(
    districts: District[],
    regencyId: number | null,
): District[] {
    if (!regencyId) return [];
    return districts.filter((d) => d.regency_id === regencyId);
}
