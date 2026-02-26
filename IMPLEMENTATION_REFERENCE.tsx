import {
    useState,
    useEffect,
    useRef,
    useCallback,
    useTransition,
} from 'react';
import {
    createBrowserRouter,
    useNavigate,
    useSearchParams,
    useLoaderData,
    Link,
    Outlet,
    type LoaderFunctionArgs,
} from 'react-router-dom';

import { cn } from '@/utils/cn';

export interface Province {
    id: number;
    name: string;
}

export interface Regency {
    id: number;
    name: string;
    province_id: number;
}

export interface District {
    id: number;
    name: string;
    regency_id: number;
}

export interface SelectedRegion {
    provinceId: number | null;
    regencyId: number | null;
    districtId: number | null;
}

export interface LoaderData {
    provinces: Province[];
    regencies: Regency[];
    districts: District[];
    selected: SelectedRegion;
}

export interface Option {
    id: number;
    name: string;
}

export function cn(...classes: (string | undefined | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

interface RegionCardProps {
    label: string;
    value: string | null;
    isActive: boolean;
}

function RegionCard({ label, value, isActive }: RegionCardProps) {
    return (
        <div
            className={cn(
                'flex flex-col gap-3 md:gap-5 p-3 md:p-4 rounded-lg md:rounded-xl items-center justify-center transition-colors',
                !isActive && 'opacity-50',
            )}
        >
            <span className="text-[10px] md:text-xs font-semibold text-blue-500 tracking-wide uppercase">
                {label}
            </span>
            <span
                className={cn(
                    'font-semibold text-center break-words max-w-full px-2',
                    isActive ? 'text-black text-3xl md:text-5xl lg:text-7xl' : 'text-gray-300 text-sm md:text-base ',
                )}
            >
                {value ?? '—'}
            </span>
        </div>
    );
}

interface RegionSummaryProps {
    province: Province | null;
    regency: Regency | null;
    district: District | null;
}

export function RegionSummary({ province, regency, district }: RegionSummaryProps) {
    if (!province) {
        return (
            <div className="flex flex-col items-center justify-center h-48 md:h-64 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <span className="text-3xl md:text-4xl mb-2 md:mb-3">🗺️</span>
                <p className="text-xs md:text-sm font-medium text-gray-500">Belum ada wilayah dipilih</p>
                <p className="text-[10px] md:text-xs text-gray-400 mt-1">Pilih provinsi di sidebar untuk memulai.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 md:gap-6 items-center justify-center mt-4 md:mt-8">
            <div className="flex flex-col gap-6 md:gap-10 items-center justify-center">
                <RegionCard label="Provinsi" value={province.name} isActive />
                <img src="/icons/arrow-down.png" width="18" className="md:w-[24px]" alt="" />
                <RegionCard label="Kota / Kabupaten" value={regency?.name ?? null} isActive={!!regency} />
                <img src="/icons/arrow-down.png" width="18" className="md:w-[24px]" alt="" />
                <RegionCard label="Kecamatan" value={district?.name ?? null} isActive={!!district} />
            </div>
        </div>
    );
}

interface ComboboxProps {
    readonly name: string;
    readonly label: string;
    readonly options: Option[];
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly disabled?: boolean;
    readonly icon?: string;
}

export function Combobox({
    name,
    label,
    options,
    value,
    onChange,
    disabled = false,
    icon,
}: ComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find((opt) => String(opt.id) === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const enabledClasses = 'text-gray-800 border-gray-200 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
    const disabledClasses = 'text-gray-300 border-gray-100 bg-gray-50 cursor-not-allowed';

    return (
        <div className="flex flex-col gap-2 md:gap-3">
            <label
                htmlFor={name}
                className={cn(
                    'text-[10px] md:text-xs font-semibold tracking-wide uppercase transition-colors',
                    disabled ? 'text-gray-300' : 'text-gray-500',
                )}
            >
                {label}
            </label>

            <div ref={containerRef} className="relative">
                <button
                    type="button"
                    id={name}
                    name={name}
                    disabled={disabled}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={cn(
                        'w-full px-2.5 md:px-3 py-2 md:py-3 pr-3 text-[13px] md:text-sm text-left rounded-lg md:rounded-xl border border-gray-300',
                        'bg-white outline-none transition-all duration-150',
                        'flex items-center justify-between',
                        disabled ? disabledClasses : enabledClasses,
                    )}
                >
                    <span className={selectedOption ? 'text-gray-800' : 'text-gray-400'}>
                        {selectedOption ? (
                            <span className="flex items-center gap-1.5 md:gap-2 text-gray-800 text-[13px] md:text-sm">
                                {icon && <img src={icon} alt="" className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-70" />}
                                <span className="truncate">{selectedOption.name}</span>
                            </span>
                        ) : <span className="text-[13px] md:text-sm">— Pilih {label} —</span>}
                    </span>
                    <span
                        className={cn(
                            'transition-transform duration-200 shrink-0',
                            isOpen ? 'rotate-180' : '',
                            disabled ? 'text-gray-300' : 'text-gray-400',
                        )}
                    >
                        <svg width="12" height="12" className="md:w-[14px] md:h-[14px]" viewBox="0 0 14 14" fill="none">
                            <path
                                d="M3 5l4 4 4-4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                </button>

                {isOpen && !disabled && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {options.length === 0 ? (
                            <div className="px-2.5 md:px-3 py-2 md:py-2.5 text-[13px] md:text-sm text-gray-400">
                                Tidak ada data
                            </div>
                        ) : (
                            options.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(String(opt.id));
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        'w-full px-2.5 md:px-3 py-2 md:py-2.5 text-[13px] md:text-sm text-left transition-colors',
                                        String(opt.id) === value
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50',
                                    )}
                                >
                                    {opt.name}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

interface SidebarFilterItemProps {
    readonly label: string;
    readonly isActive: boolean;
    readonly isExpanded: boolean;
    readonly depth: 0 | 1 | 2;
    readonly onClick: () => void;
    readonly children?: React.ReactNode;
}

const depthPadding: Record<0 | 1 | 2, string> = {
    0: 'pl-3',
    1: 'pl-6',
    2: 'pl-9',
};

export function SidebarFilterItem({
    label,
    isActive,
    isExpanded,
    depth,
    onClick,
    children,
}: SidebarFilterItemProps) {
    const hasChildren = Boolean(children);

    return (
        <div>
            <button
                type="button"
                onClick={onClick}
                className={cn(
                    'flex items-center gap-2 w-full py-1.5 pr-3 text-sm rounded-md transition-colors',
                    depthPadding[depth],
                    isActive
                        ? 'text-blue-600 font-semibold bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                )}
            >
                {hasChildren ? (
                    <span
                        className={cn(
                            'shrink-0 transition-transform duration-200',
                            isExpanded ? 'rotate-90' : 'rotate-0',
                        )}
                        aria-hidden="true"
                    >
                        ›
                    </span>
                ) : (
                    <span className="shrink-0 w-3" aria-hidden="true" />
                )}

                <span className="truncate flex-1 text-left">{label}</span>

                {isActive && (
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" aria-hidden="true" />
                )}
            </button>

            {hasChildren && isExpanded && (
                <div role="group">{children}</div>
            )}
        </div>
    );
}

interface SidebarRegionFilterProps {
    provinces: Province[];
    regencies: Regency[];
    districts: District[];
}

export function SidebarRegionFilter({
    provinces,
    regencies,
    districts,
}: SidebarRegionFilterProps) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const activeProvinceId = Number(searchParams.get('province')) || null;
    const activeRegencyId = Number(searchParams.get('regency')) || null;
    const activeDistrictId = Number(searchParams.get('district')) || null;

    function selectProvince(id: number) {
        if (id === activeProvinceId) {
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
                        <img src="/icons/chevron-right.svg" className='mt-1' width="11" alt="" />
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
                        <img src="/icons/chevron-right.svg" className='mt-1' width="11" alt="" />
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
                        <img src="/icons/chevron-right.svg" className='mt-1' width="11" alt="" />
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

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const { provinces, regencies, districts, selected } = useLoaderData() as LoaderData;
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const hasFilters = searchParams.has('province');

    useEffect(() => {
        if (isOpen && window.innerWidth < 1024) {
            onClose?.();
        }
    }, [searchParams]);

    const filteredRegencies = selected.provinceId
        ? regencies.filter((r) => r.province_id === selected.provinceId)
        : [];

    const filteredDistricts = selected.regencyId
        ? districts.filter((d) => d.regency_id === selected.regencyId)
        : [];

    const provinceValue = selected.provinceId ? String(selected.provinceId) : '';
    const regencyValue = selected.regencyId ? String(selected.regencyId) : '';
    const districtValue = selected.districtId ? String(selected.districtId) : '';

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
            <button
                onClick={onClose}
                className="lg:hidden absolute top-3 right-3 p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                aria-label="Close menu"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

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
            </div>
        </aside>
    );
}

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

export function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export async function regionLoader({ request }: LoaderFunctionArgs): Promise<LoaderData> {
    const url = new URL(request.url);
    const provinceId = Number(url.searchParams.get('province')) || null;
    const regencyId = Number(url.searchParams.get('regency')) || null;
    const districtId = Number(url.searchParams.get('district')) || null;

    const [provincesRes, regenciesRes, districtsRes] = await Promise.all([
        fetch('/data/provinces.json'),
        fetch('/data/regencies.json'),
        fetch('/data/districts.json'),
    ]);

    const provinces: Province[] = await provincesRes.json();
    const regencies: Regency[] = await regenciesRes.json();
    const districts: District[] = await districtsRes.json();

    return {
        provinces,
        regencies,
        districts,
        selected: { provinceId, regencyId, districtId },
    };
}

export function RegionPage() {
    const { provinces, regencies, districts, selected } = useLoaderData() as LoaderData;

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

export const router = createBrowserRouter([
    {
        id: 'root',
        path: '/',
        element: <AppLayout />,
        loader: regionLoader,
        children: [
            {
                index: true,
                element: <RegionPage />,
            },
        ],
    },
]);
