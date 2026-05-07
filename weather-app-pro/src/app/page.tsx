'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CloudSun, Star } from 'lucide-react';
import WeatherSearch from '@/components/WeatherSearch';
import TemperatureCard from '@/components/TemperatureCard';
import DailyForecast from '@/components/DailyForecast';
import HourlyForecast from '@/components/HourlyForecast';
import WeatherBackground from '@/components/WeatherBackground';
import Favorites from '@/components/Favorites';
import SkeletonLoader from '@/components/SkeletonLoader';
import { useWeatherStore } from '@/store/weatherStore';
import { useGeolocation } from '@/hooks/useWeather';

export default function Home() {
  const { currentWeather, loading, error, addFavorite } = useWeatherStore();
  const { searchByLocation } = useGeolocation();

  useEffect(() => {
    const loadInitialLocation = async () => {
      try {
        await searchByLocation();
      } catch {
        console.info('Geolocalizacion no disponible. Se muestra la busqueda manual.');
      }
    };

    loadInitialLocation();
  }, [searchByLocation]);

  const handleAddFavorite = () => {
    if (currentWeather?.location.city) {
      addFavorite(currentWeather.location.city);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <WeatherBackground />

      <div className="relative z-10 min-h-screen pb-20">
        <div className="sticky top-0 z-20 bg-white/5 backdrop-blur-lg border-b border-white/10 px-4 py-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-white">Weather Pro</h1>
              {currentWeather && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddFavorite}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  title="Agregar a favoritos"
                >
                  <Star className="w-5 h-5 text-yellow-400" />
                </motion.button>
              )}
            </div>
            <WeatherSearch />
          </div>
        </div>

        <div className="px-4 pt-6">
          <div className="max-w-md mx-auto">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-4 text-red-100 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SkeletonLoader />
                </motion.div>
              ) : currentWeather ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 pb-20"
                >
                  <TemperatureCard />
                  <HourlyForecast />
                  <DailyForecast />
                  <Favorites />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-20"
                >
                  <CloudSun className="w-20 h-20 mx-auto mb-4 text-white/80" />
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Bienvenido a Weather Pro
                  </h2>
                  <p className="text-white/60 mb-4">
                    Busca una ciudad o usa tu ubicacion para comenzar
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
