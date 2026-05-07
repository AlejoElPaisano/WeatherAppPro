'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CloudSun, Star } from 'lucide-react';
import WeatherSearch from '@/components/WeatherSearch';
import TemperatureCard from '@/components/TemperatureCard';
import WeatherDetails from '@/components/WeatherDetails';
import DailyForecast from '@/components/DailyForecast';
import HourlyForecast from '@/components/HourlyForecast';
import WeatherBackground from '@/components/WeatherBackground';
import Favorites from '@/components/Favorites';
import SkeletonLoader from '@/components/SkeletonLoader';
import { useWeatherStore } from '@/store/weatherStore';
import { useGeolocation } from '@/hooks/useWeather';

export default function Home() {
  const { currentWeather, loading, error, addFavorite, removeFavorite, clearWeather, searchResetKey, favorites } = useWeatherStore();
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

  const isFavorite = currentWeather?.location.city ? favorites.includes(currentWeather.location.city) : false;

  const handleToggleFavorite = () => {
    if (currentWeather?.location.city) {
      if (isFavorite) {
        removeFavorite(currentWeather.location.city);
      } else {
        addFavorite(currentWeather.location.city);
      }
    }
  };

  const handleGoBack = () => {
    clearWeather();
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <WeatherBackground />

      <div className="relative z-10 min-h-screen pb-20">
        <div className="sticky top-0 z-20 bg-white/5 backdrop-blur-lg border-b border-white/10 px-4 py-4">
          <div className="max-w-md mx-auto lg:max-w-5xl lg:flex lg:items-center lg:justify-between lg:gap-8">
            <div className="flex items-center justify-between mb-3 lg:mb-0 lg:w-1/3">
              <div className="flex items-center gap-2">
                <AnimatePresence>
                  {currentWeather && (
                    <motion.button
                      key="back-btn"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleGoBack}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      title="Volver al inicio"
                    >
                      <ArrowLeft className="w-5 h-5 text-white" />
                    </motion.button>
                  )}
                </AnimatePresence>
                <h1 className="text-xl font-bold text-white">Climix</h1>
              </div>
              {currentWeather && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.8, rotate: 180 }}
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorite ? 'bg-yellow-400/20 hover:bg-yellow-400/30' : 'bg-white/10 hover:bg-white/20'
                  }`}
                  title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Star className={`w-5 h-5 transition-colors duration-300 ${
                    isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-white/70 hover:text-yellow-400'
                  }`} />
                </motion.button>
              )}
            </div>
            <div className="lg:flex-1">
              <WeatherSearch key={searchResetKey} />
            </div>
          </div>
        </div>

        <div className="px-4 pt-6">
          <div className="max-w-md mx-auto lg:max-w-5xl">
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
                  className="flex flex-col gap-6 pb-20 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start"
                >
                  <div className="contents lg:block lg:col-span-5 space-y-6 lg:sticky lg:top-32">
                    <div className="order-1 lg:order-none"><TemperatureCard /></div>
                    <div className="order-4 lg:order-none"><WeatherDetails /></div>
                  </div>
                  <div className="contents lg:block lg:col-span-7 space-y-6">
                    <div className="order-2 lg:order-none"><HourlyForecast /></div>
                    <div className="order-3 lg:order-none"><DailyForecast /></div>
                    <div className="order-5 lg:order-none"><Favorites /></div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 pb-20"
                >
                  <div className="text-center py-10">
                    <CloudSun className="w-20 h-20 mx-auto mb-4 text-white/80" />
                    <h2 className="text-xl font-semibold text-white mb-2">
                      Bienvenido a Climix
                    </h2>
                    <p className="text-white/60">
                      Busca una ciudad o usa tu ubicacion para comenzar
                    </p>
                  </div>
                  <Favorites />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
