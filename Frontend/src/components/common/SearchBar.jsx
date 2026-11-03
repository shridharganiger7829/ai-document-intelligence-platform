import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  className = '',
  debounceMs = 350,
}) => {
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query !== value) {
        onChange(query);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [query, debounceMs, onChange, value]);

  const handleClear = () => {
    setQuery('');
    onChange('');
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-surface-card/90 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/40 transition-colors shadow-inner"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 p-0.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
