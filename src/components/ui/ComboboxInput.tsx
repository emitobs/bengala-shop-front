import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/cn';

export interface ComboboxInputProps {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
}

function normalize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function ComboboxInput({
  label,
  error,
  value,
  onChange,
  suggestions,
  placeholder,
  className,
}: ComboboxInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputId = label ? label.toLowerCase().replace(/\s+/g, '-') : undefined;

  const filtered = value
    ? suggestions.filter((s) => normalize(s).includes(normalize(value)))
    : suggestions;

  const showDropdown = isOpen && filtered.length > 0 && value !== filtered[0];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset active index when filtered list changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [filtered.length]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const selectItem = useCallback(
    (item: string) => {
      onChange(item);
      setIsOpen(false);
      setActiveIndex(-1);
    },
    [onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (e.key === 'ArrowDown' && filtered.length > 0) {
        setIsOpen(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && filtered[activeIndex]) {
          selectItem(filtered[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-secondary mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex >= 0 ? `combobox-option-${activeIndex}` : undefined
        }
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'block w-full rounded-input border bg-white px-3.5 py-2.5 text-sm text-secondary',
          'placeholder:text-gray-400',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-error focus:border-error focus:ring-error/30'
            : 'border-border focus:border-primary focus:ring-primary/30',
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        autoComplete="off"
      />

      {/* Dropdown */}
      {showDropdown && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-border bg-white shadow-lg"
        >
          {filtered.map((item, index) => (
            <li
              key={item}
              id={`combobox-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                selectItem(item);
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                'cursor-pointer px-3.5 py-2 text-sm transition-colors',
                index === activeIndex
                  ? 'bg-primary/10 text-primary'
                  : 'text-secondary hover:bg-gray-50',
              )}
            >
              {item}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p
          id={inputId ? `${inputId}-error` : undefined}
          className="mt-1.5 text-sm text-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
