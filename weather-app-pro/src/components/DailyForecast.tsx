'use client';

import { motion } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';
import { CloudRain, Sun, Cloud, Snowflake, CloudLightning } from 'lucide-react';

const degree = '\u00B0';

const weatherIconMap: Record<string, React.ReactNode> = {
  Clear: <Sun className="w-6 h-6 text-yellow-400" />,
  Clouds: <Cloud className="w-6 h-6 text-gray-300" />,
  Rain: <CloudRain className="w-6 h-6 text-blue-400" />,
  Snow: <Snowflake className="w-6 h-6 text-blue-200" />,
  Thunderstorm: <CloudLightning className="w-6 h-6 text-purple-400" />,
  Drizzle: <CloudRain className="w-6 h-6 text-blue-300" />,
  Mist: <Cloud className="w-6 h-6 text-gray-400" />
};

export default function DailyForecast() {
  const { currentWeather } = useWeatherStore();

  if (!currentWeather) return null;

  const { daily } = currentWeather.forecast;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-md mx-auto mt-6"
    >
      <h3 className="text-lg font-semibold text-white mb-3 px-2">Proximos dias</h3>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
        <div className="space-y-3">
          {daily.map((day, index) => (
            <motion.div
              key={day.dt}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3 w-24">
                <span className="text-white/80 capitalize text-sm">{day.day}</span>
              </div>

              <div className="flex items-center gap-2">
                {weatherIconMap[day.condition] || <Sun className="w-6 h-6 text-yellow-400" />}
                <span className="text-white/60 text-xs">{day.rainProbability}%</span>
              </div>

              <div className="flex items-center gap-3 w-24 justify-end">
                <span className="text-white/60 text-sm">{day.min}{degree}</span>
                <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(Math.max(((day.max - day.min) / 20) * 100, 10), 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full"
                  />
                </div>
                <span className="text-white font-semibold text-sm">{day.max}{degree}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
