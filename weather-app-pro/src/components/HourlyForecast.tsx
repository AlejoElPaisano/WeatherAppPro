'use client';

import { motion } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { Sun, Cloud, CloudRain, Snowflake, CloudLightning } from 'lucide-react';

const degree = '\u00B0';

const weatherIconMap: Record<string, React.ReactNode> = {
  Clear: <Sun className="w-4 h-4 text-yellow-400" />,
  Clouds: <Cloud className="w-4 h-4 text-gray-300" />,
  Rain: <CloudRain className="w-4 h-4 text-blue-400" />,
  Snow: <Snowflake className="w-4 h-4 text-blue-200" />,
  Thunderstorm: <CloudLightning className="w-4 h-4 text-purple-400" />,
  Drizzle: <CloudRain className="w-4 h-4 text-blue-300" />,
  Mist: <Cloud className="w-4 h-4 text-gray-400" />
};

export default function HourlyForecast() {
  const { currentWeather, weatherType } = useWeatherStore();

  if (!currentWeather) return null;

  const { hourly } = currentWeather.forecast;

  const chartData = hourly.map((hour) => ({
    time: hour.hour,
    temp: hour.temp,
    humidity: hour.humidity
  }));

  const strokeColor = {
    sunny: '#FFD700',
    clear: '#87CEEB',
    rain: '#4169E1',
    snow: '#B0E0E6',
    cloudy: '#D3D3D3',
    night: '#9370DB',
    thunderstorm: '#8A2BE2'
  }[weatherType] || '#87CEEB';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full max-w-md mx-auto mt-6"
    >
      <h3 className="text-lg font-semibold text-white mb-3 px-2">Pronostico por horas</h3>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
        <div className="h-32 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke={strokeColor}
                fillOpacity={1}
                fill="url(#tempGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {hourly.map((hour, index) => (
            <motion.div
              key={hour.dt}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 min-w-[60px]"
            >
              <span className="text-white/60 text-xs">{hour.hour}</span>
              {weatherIconMap[hour.condition] || <Sun className="w-4 h-4 text-yellow-400" />}
              <span className="text-white font-semibold text-sm">{hour.temp}{degree}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
