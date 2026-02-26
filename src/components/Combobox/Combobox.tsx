import type { Option } from '@/features/region/types';

interface ComboboxProps {
    name: string;
    label: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function Combobox({
    name,
    label,
    options,
    value,
    onChange,
    disabled = false,
}: ComboboxProps) {
    return (
        <div className="flex flex-col gap-1">
            <label
                htmlFor={name}
                className="text-sm font-medium text-gray-700"
            >
                {label}
            </label>
            <select
                id={name}
                name={name}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white
                   text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500
                   disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400
                   transition-colors"
            >
                <option value="">— Pilih {label} —</option>
                {options.map((opt) => (
                    <option key={opt.id} value={String(opt.id)}>
                        {opt.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
