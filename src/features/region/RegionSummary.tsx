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
                'flex flex-col gap-1 p-4 rounded-xl border transition-colors',
                isActive
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 bg-white opacity-50',
            )}
        >
            <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                {label}
            </span>
            <span
                className={cn(
                    'text-base font-semibold',
                    isActive ? 'text-blue-700' : 'text-gray-300',
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
        <div className="flex flex-col gap-6">
            {/* Page title — most specific selected name */}
            <h1 className="text-xl font-semibold text-gray-800">
                {district?.name ?? regency?.name ?? province.name}
            </h1>

            {/* Detail cards grid — always all three rendered, never unmounted */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <RegionCard label="Provinsi" value={province.name} isActive />
                <RegionCard label="Kota / Kabupaten" value={regency?.name ?? null} isActive={!!regency} />
                <RegionCard label="Kecamatan" value={district?.name ?? null} isActive={!!district} />
            </div>
        </div>
    );
}
