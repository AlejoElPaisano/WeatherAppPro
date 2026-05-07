'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';
import { useWeatherStore } from '@/store/weatherStore';
import {
  formatLocationSuggestion,
  LocationSuggestion,
  useGeolocation,
  useWeatherSearch
} from '@/hooks/useWeather';

export default function WeatherSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const { searchWeather, searchWeatherByCoords, searchLocationSuggestions } = useWeatherSearch();
  const { searchByLocation } = useGeolocation();
  const { setLoading, setError } = useWeatherStore();

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      return;
    }

    let isActive = true;
    const timeout = window.setTimeout(async () => {
      setIsFetchingSuggestions(true);

      try {
        const results = await searchLocationSuggestions(normalizedQuery);

        if (isActive) {
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        }
      } catch {
        if (isActive) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } finally {
        if (isActive) {
          setIsFetchingSuggestions(false);
        }
      }
    }, 300);

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
    };
  }, [query, searchLocationSuggestions]);

  const handleQueryChange = (value: string) => {
    setQuery(value);

    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsFetchingSuggestions(false);
    }
  };

  const selectSuggestion = async (suggestion: LocationSuggestion) => {
    setQuery(formatLocationSuggestion(suggestion));
    setShowSuggestions(false);
    setSuggestions([]);
    setIsSearching(true);
    setLoading(true);
    setError(null);

    try {
      await searchWeatherByCoords(
        suggestion.lat,
        suggestion.lon,
        suggestion.name,
        suggestion.country,
        suggestion.state
      );
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim() || isSearching) return;

    if (suggestions.length > 0) {
      await selectSuggestion(suggestions[0]);
      return;
    }

    setIsSearching(true);
    setLoading(true);
    setError(null);

    try {
      await searchWeather(query.trim());
    } finally {
      setIsSearching(false);
      setLoading(false);
      setShowSuggestions(false);
    }
  };

  const handleGeolocation = async () => {
    setIsSearching(true);
    setLoading(true);
    setError(null);
    setShowSuggestions(false);

    try {
      await searchByLocation();
    } catch {
      setError('No se pudo obtener la ubicacion. Verifica los permisos del navegador.');
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto mb-6"
    >
      <form onSubmit={handleSearch} className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="text"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
            placeholder="Buscar ciudad..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
            disabled={isSearching}
            autoComplete="off"
          />
          {isFetchingSuggestions && !isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 animate-spin" />
          )}

          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 shadow-2xl shadow-black/30 backdrop-blur-xl"
              >
                {suggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.name}-${suggestion.state}-${suggestion.country}-${suggestion.lat}-${suggestion.lon}`}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(suggestion)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white/85 transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none"
                  >
                    <Navigation className="h-4 w-4 flex-shrink-0 text-cyan-200" />
                    <span className="min-w-0 truncate">{formatLocationSuggestion(suggestion)}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isSearching ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md"
            >
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </motion.div>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors duration-200"
                title="Buscar ciudad"
              >
                <Search className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleGeolocation}
                className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors duration-200"
                title="Usar mi ubicacion"
              >
                <MapPin className="w-5 h-5" />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}
