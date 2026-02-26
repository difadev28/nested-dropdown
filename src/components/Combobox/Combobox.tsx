'use client';

import { useState, useRef, useEffect } from 'react';
import type { Option } from '@/features/region/types';
import { cn } from '@/utils/cn';

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

    // Close dropdown when clicking outside
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
                {/* Trigger button */}
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

                {/* Dropdown menu */}
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
