'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { useWeatherStore } from '@/store/weatherStore';
import { useWeatherSearch, useGeolocation } from '@/hooks/useWeather';

export default function WeatherSearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { searchWeather } = useWeatherSearch();
  const { searchByLocation } = useGeolocation();
  const { setLoading, setError } = useWeatherStore();

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    setLoading(true);
    setError(null);

    try {
      await searchWeather(query.trim());
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  const handleGeolocation = async () => {
    setIsSearching(true);
    setLoading(true);
    setError(null);

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
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar ciudad..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
            disabled={isSearching}
          />
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
