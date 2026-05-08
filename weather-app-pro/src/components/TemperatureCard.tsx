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
  MapPin,
  Thermometer,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { WeatherType } from '@/types/weather';

const degree = '\u00B0';

const weatherIcons: Record<WeatherType, React.ReactNode> = {
  sunny: <Sun className="w-32 h-32 text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.6)]" />,
  rain: <CloudRain className="w-32 h-32 text-blue-300 drop-shadow-[0_0_15px_rgba(147,197,253,0.5)]" />,
  snow: <Snowflake className="w-32 h-32 text-sky-100 drop-shadow-[0_0_15px_rgba(224,242,254,0.6)]" />,
  cloudy: <Cloud className="w-32 h-32 text-slate-100 drop-shadow-[0_0_15px_rgba(241,245,249,0.5)]" />,
  night: <Moon className="w-32 h-32 text-indigo-200 drop-shadow-[0_0_15px_rgba(199,210,254,0.5)]" />,
  thunderstorm: <CloudLightning className="w-32 h-32 text-violet-300 drop-shadow-[0_0_15px_rgba(196,181,253,0.6)]" />,
  clear: <Sun className="w-32 h-32 text-cyan-200 drop-shadow-[0_0_15px_rgba(165,243,252,0.5)]" />
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
  const { currentWeather, weatherType, language } = useWeatherStore();

  if (!currentWeather) return null;

  const { current, location, forecast } = currentWeather;
  const todayForecast = forecast?.daily?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full rounded-[2.5rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-8 sm:p-12 shadow-2xl backdrop-blur-xl overflow-hidden"
    >
      {/* Decorative background glows */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col items-center justify-center text-center relative z-10">
        
        {/* Location Badge */}
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mb-8 bg-black/20 hover:bg-black/30 transition-colors cursor-default border border-white/5 px-5 py-2 rounded-full"
        >
          <MapPin className="w-4 h-4 text-red-400" />
          <span className="text-sm font-semibold text-white tracking-wide">
            {location.city}, {location.country}
          </span>
        </motion.div>

        {/* Weather Icon */}
        <motion.div
          className={`flex justify-center mb-6 relative z-20 ${weatherAnimations[weatherType]}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.8, bounce: 0.4 }}
        >
          {weatherIcons[weatherType]}
        </motion.div>

        {/* Temperature Display */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-8xl font-light text-white mb-1 tracking-tighter drop-shadow-xl flex items-start justify-center">
            {current.temp}
            <span className="text-5xl font-normal text-white/60 mt-2 ml-1">{degree}</span>
          </h1>
          <p className="text-2xl font-medium text-white capitalize mb-6 drop-shadow-md">
            {current.description}
          </p>
        </motion.div>

        {/* Info Pills */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {/* Feels Like Pill */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-2xl shadow-lg backdrop-blur-md">
            <Thermometer className="w-4 h-4 text-amber-300" />
            <span className="text-sm text-white font-medium">
              {language === 'es' ? 'Sensación' : 'Feels Like'} <span className="font-bold">{current.feels_like}{degree}</span>
            </span>
          </div>
          
          {/* High / Low Pill */}
          {todayForecast && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white/10 border border-white/10 rounded-2xl shadow-lg backdrop-blur-md text-sm font-medium text-white">
              <span className="flex items-center gap-1 text-blue-200">
                <ArrowDown className="w-4 h-4" />
                <span className="font-bold">{todayForecast.min}{degree}</span>
              </span>
              <span className="w-px h-4 bg-white/20" />
              <span className="flex items-center gap-1 text-red-200">
                <ArrowUp className="w-4 h-4" />
                <span className="font-bold">{todayForecast.max}{degree}</span>
              </span>
            </div>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}
