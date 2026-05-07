'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';
import { useWeatherSearch } from '@/hooks/useWeather';
import { Star, Trash2 } from 'lucide-react';

export default function Favorites() {
  const { favorites, loadFavorites, removeFavorite, currentWeather } = useWeatherStore();
  const { searchWeather } = useWeatherSearch();

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleFavoriteClick = async (city: string) => {
    await searchWeather(city);
  };

  const handleRemoveFavorite = (e: React.MouseEvent, city: string) => {
    e.stopPropagation();
    removeFavorite(city);
  };

  if (favorites.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full"
    >
      <h3 className="text-lg font-semibold text-white mb-3 px-2">Favoritos</h3>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
        <div className="flex flex-wrap gap-2">
          {favorites.map((city, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2"
            >
              <button
                onClick={() => handleFavoriteClick(city)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors duration-200
                  ${currentWeather?.location.city === city 
                    ? 'bg-white/30 text-white' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
              >
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {city}
              </button>
              <button
                onClick={(e) => handleRemoveFavorite(e, city)}
                className="p-1 rounded-full hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
