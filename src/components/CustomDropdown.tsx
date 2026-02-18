import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps<T = string> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
}

export function CustomDropdown<T extends string | number>({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
}: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm font-medium text-surface-700 transition hover:bg-surface-50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300 dark:hover:bg-surface-800 ${
          isOpen ? 'border-accent ring-1 ring-accent' : ''
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-surface-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full animate-slide-up rounded-lg border border-surface-200 bg-white shadow-xl dark:border-surface-800 dark:bg-surface-900">
          <div className="max-h-64 overflow-y-auto p-1.5">
            {options.map((option) => (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition ${
                  value === option.value
                    ? 'bg-accent/10 text-accent font-medium dark:bg-accent/20'
                    : 'text-surface-700 hover:bg-surface-50 dark:text-surface-300 dark:hover:bg-surface-800'
                }`}
              >
                {option.icon && (
                  <span className={`shrink-0 ${value === option.value ? 'text-accent' : 'text-surface-500'}`}>
                    {option.icon}
                  </span>
                )}
                <span className="flex-1 truncate">{option.label}</span>
                {value === option.value && (
                  <Check className="h-4 w-4 shrink-0 text-accent" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
