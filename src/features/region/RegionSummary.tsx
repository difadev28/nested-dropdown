import type { Province, Regency, District } from '@/features/region/types';
import { cn } from '@/utils/cn';

// ─── Sub-component ────────────────────────────────────────────────────────────

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
                    isActive ? 'text-black text-3xl md:text-3xl xl:text-4xl 2xl:text-7xl' : 'text-gray-300 text-sm md:text-base ',
                )}
            >
                {value ?? '—'}
            </span>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

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
        <div className="flex flex-col gap-2 2xl:gap-4 md:gap-6 items-center justify-center 2xl:mt-4 md:mt-3">

            {/* Detail cards grid — always all three rendered, never unmounted */}
            <div className="flex flex-col gap-4  md:gap-3 2xl:gap-6 items-center justify-center">
                <RegionCard label="Provinsi" value={province.name} isActive />
                <img src="/icons/arrow-down.png" width="18" className="md:w-[24px]" alt="" />
                <RegionCard label="Kota / Kabupaten" value={regency?.name ?? null} isActive={!!regency} />
                <img src="/icons/arrow-down.png" width="18" className="md:w-[24px]" alt="" />
                <RegionCard label="Kecamatan" value={district?.name ?? null} isActive={!!district} />
            </div>
        </div>
    );
}
