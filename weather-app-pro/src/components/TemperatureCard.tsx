'use client';

import { motion } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';
import {
  Cloud,
  CloudLightning,
  CloudRain,
  Moon,
  Snowflake,
  Sun,
} from 'lucide-react';
import { WeatherType } from '@/types/weather';

const degree = '\u00B0';

const weatherIcons: Record<WeatherType, React.ReactNode> = {
  sunny: <Sun className="w-24 h-24 text-yellow-300" />,
  rain: <CloudRain className="w-24 h-24 text-blue-200" />,
  snow: <Snowflake className="w-24 h-24 text-sky-100" />,
  cloudy: <Cloud className="w-24 h-24 text-slate-100" />,
  night: <Moon className="w-24 h-24 text-indigo-100" />,
  thunderstorm: <CloudLightning className="w-24 h-24 text-violet-200" />,
  clear: <Sun className="w-24 h-24 text-cyan-100" />
};

const weatherAnimations: Record<WeatherType, string> = {
  sunny: 'animate-spin-slow',
  rain: 'animate-bounce-slow',
  snow: 'animate-bounce-slow',
  cloudy: 'animate-pulse-slow',
  night: 'animate-pulse-slow',
  thunderstorm: 'animate-pulse',
  clear: 'animate-spin-slow'
};

export default function TemperatureCard() {
  const { currentWeather, weatherType } = useWeatherStore();

  if (!currentWeather) return null;

  const { current, location } = currentWeather;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full"
    >
      <div className="text-center mb-6">
        <motion.div
          className={`flex justify-center mb-4 ${weatherAnimations[weatherType]}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          {weatherIcons[weatherType]}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-6xl font-light text-white mb-2">
            {current.temp}{degree}
          </h1>
          <p className="text-xl text-white/80 capitalize mb-1">
            {current.description}
          </p>
          <p className="text-sm text-white/60">
            {location.city}, {location.country}
          </p>
          <p className="text-xs text-white/50 mt-1">
            Sensacion termica: {current.feels_like}{degree}
          </p>
        </motion.div>
      </div>

    </motion.div>
  );
}
