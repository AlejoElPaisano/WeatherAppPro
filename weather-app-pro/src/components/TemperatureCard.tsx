'use client';

import { motion } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';
import {
  Cloud,
  CloudLightning,
  CloudRain,
  Droplets,
  Eye,
  Gauge,
  Moon,
  Snowflake,
  Sun,
  Thermometer,
  Wind
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
      className="relative w-full max-w-md mx-auto"
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-3 w-full"
      >
        <WeatherInfoItem
          icon={<Droplets className="w-5 h-5" />}
          label="Humedad"
          value={`${current.humidity}%`}
        />
        <WeatherInfoItem
          icon={<Wind className="w-5 h-5" />}
          label="Viento"
          value={`${current.wind_speed} km/h`}
        />
        <WeatherInfoItem
          icon={<Eye className="w-5 h-5" />}
          label="Visibilidad"
          value={`${current.visibility} km`}
        />
        <WeatherInfoItem
          icon={<Thermometer className="w-5 h-5" />}
          label="Sensacion"
          value={`${current.feels_like}${degree}`}
        />
        <WeatherInfoItem
          icon={<Gauge className="w-5 h-5" />}
          label="Presion"
          value={`${current.pressure} hPa`}
        />
        <WeatherInfoItem
          icon={<Sun className="w-5 h-5" />}
          label="Indice UV"
          value={current.uv.toString()}
        />
      </motion.div>
    </motion.div>
  );
}

function WeatherInfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-white/20 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center gap-1 border border-white/10"
    >
      <div className="text-white/80">
        {icon}
      </div>
      <div className="text-center">
        <p className="text-xs text-white/60">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </motion.div>
  );
}
