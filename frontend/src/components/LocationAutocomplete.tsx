import React, { useState, useEffect, useRef } from 'react';

interface LocationAutocompleteProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  id?: string;
  disabled?: boolean;
  inputClassName?: string;
  labelClassName?: string;
  wrapperClassName?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Search location...',
  required = false,
  error,
  id,
  disabled = false,
  inputClassName,
  labelClassName,
  wrapperClassName,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // Sync with prop value updates
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
      );
      if (response.ok) {
        const data = (await response.json()) as NominatimResult[];
        setSuggestions(data);
        setIsOpen(data.length > 0);
      }
    } catch (err) {
      console.error('Error fetching location suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val); // Update parent state immediately for custom entry

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      fetchSuggestions(val);
    }, 500);
  };

  const handleSelectSuggestion = (suggestion: NominatimResult) => {
    setInputValue(suggestion.display_name);
    onChange(suggestion.display_name);
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className={wrapperClassName || "flex flex-col mb-4 relative"} ref={dropdownRef}>
      <label
        htmlFor={id}
        className={labelClassName || "text-sm font-semibold text-textMain mb-1.5 flex justify-between"}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <div className="relative">
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          disabled={disabled}
          className={inputClassName || `w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:ring-1 shadow-sm hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-200 focus:border-primary focus:ring-primary'
          }`}
          placeholder={placeholder}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
          autoComplete="off"
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto top-full">
          {suggestions.map((item) => (
            <li
              key={item.place_id}
              onClick={() => handleSelectSuggestion(item)}
              className="px-4 py-2.5 text-sm text-textMain hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0 truncate"
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <svg className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default LocationAutocomplete;
