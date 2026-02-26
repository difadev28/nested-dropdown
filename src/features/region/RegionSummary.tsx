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
                'flex flex-col gap-5 p-4 rounded-xl items-center justify-center transition-colors',
                !isActive && 'opacity-50',
            )}
        >
            <span className="text-xs font-semibold text-blue-500 tracking-wide uppercase">
                {label}
            </span>
            <span
                className={cn(
                    'font-semibold',
                    isActive ? 'text-black text-7xl' : 'text-gray-300 text-base ',
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
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <span className="text-4xl mb-3">🗺️</span>
                <p className="text-sm font-medium text-gray-500">Belum ada wilayah dipilih</p>
                <p className="text-xs text-gray-400 mt-1">Pilih provinsi di sidebar untuk memulai.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 items-center justify-center mt-8">

            {/* Detail cards grid — always all three rendered, never unmounted */}
            <div className="flex flex-col gap-10 items-center justify-center">
                <RegionCard label="Provinsi" value={province.name} isActive />
                {
                    !!province && (
                        <img src="/icons/arrow-down.png" width="24" alt="" />
                    )
                }
                <RegionCard label="Kota / Kabupaten" value={regency?.name ?? null} isActive={!!regency} />
                {
                    !!regency && (
                        <img src="/icons/arrow-down.png" width="24" alt="" />
                    )
                }
                <RegionCard label="Kecamatan" value={district?.name ?? null} isActive={!!district} />
            </div>
        </div>
    );
}
