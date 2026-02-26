import { useNavigate, useSearchParams, useLoaderData } from 'react-router-dom';
import { SidebarFilterItem } from './SidebarFilterItem';
import type { LoaderData } from '@/features/region/types';

export function SidebarRegionFilter() {
    const { provinces, regencies, districts } = useLoaderData() as LoaderData;
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const activeProvinceId = Number(searchParams.get('province')) || null;
    const activeRegencyId = Number(searchParams.get('regency')) || null;
    const activeDistrictId = Number(searchParams.get('district')) || null;

    function selectProvince(id: number) {
        if (id === activeProvinceId) {
            // toggle off → reset all
            navigate('/', { replace: true });
        } else {
            navigate(`?province=${id}`, { replace: true });
        }
    }

    function selectRegency(provinceId: number, regencyId: number) {
        if (regencyId === activeRegencyId) {
            navigate(`?province=${provinceId}`, { replace: true });
        } else {
            navigate(`?province=${provinceId}&regency=${regencyId}`, { replace: true });
        }
    }

    function selectDistrict(provinceId: number, regencyId: number, districtId: number) {
        if (districtId === activeDistrictId) {
            navigate(`?province=${provinceId}&regency=${regencyId}`, { replace: true });
        } else {
            navigate(
                `?province=${provinceId}&regency=${regencyId}&district=${districtId}`,
                { replace: true },
            );
        }
    }

    return (
        <nav aria-label="Filter wilayah" className="flex flex-col gap-0.5">
            {provinces.map((province) => {
                const isProvinceExpanded = activeProvinceId === province.id;
                const provinceRegencies = regencies.filter((r) => r.province_id === province.id);

                return (
                    <SidebarFilterItem
                        key={province.id}
                        label={province.name}
                        depth={0}
                        isActive={activeProvinceId === province.id && activeRegencyId === null}
                        isExpanded={isProvinceExpanded}
                        onClick={() => selectProvince(province.id)}
                    >
                        {provinceRegencies.map((regency) => {
                            const isRegencyExpanded = activeRegencyId === regency.id;
                            const regencyDistricts = districts.filter((d) => d.regency_id === regency.id);

                            return (
                                <SidebarFilterItem
                                    key={regency.id}
                                    label={regency.name}
                                    depth={1}
                                    isActive={activeRegencyId === regency.id && activeDistrictId === null}
                                    isExpanded={isRegencyExpanded}
                                    onClick={() => selectRegency(province.id, regency.id)}
                                >
                                    {regencyDistricts.map((district) => (
                                        <SidebarFilterItem
                                            key={district.id}
                                            label={district.name}
                                            depth={2}
                                            isActive={activeDistrictId === district.id}
                                            isExpanded={false}
                                            onClick={() => selectDistrict(province.id, regency.id, district.id)}
                                        />
                                    ))}
                                </SidebarFilterItem>
                            );
                        })}
                    </SidebarFilterItem>
                );
            })}
        </nav>
    );
}
