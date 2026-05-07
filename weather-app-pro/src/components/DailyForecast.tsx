'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';
import { CloudRain, Sun, Cloud, Snowflake, CloudLightning, Droplets, Moon } from 'lucide-react';
import { DailyForecast as DailyForecastItem, WeatherData } from '@/types/weather';

const degree = '\u00B0';
const historyKey = 'climix-daily-history';

interface StoredDailyForecast extends DailyForecastItem {
  dateKey: string;
}

interface ForecastRow extends DailyForecastItem {
  label: string;
  muted: boolean;
  unavailable: boolean;
}

const weatherIconMap: Record<string, React.ReactNode> = {
  Clear: <Sun className="w-7 h-7 text-yellow-300 drop-shadow" />,
  Clouds: <Cloud className="w-7 h-7 text-white drop-shadow" />,
  Rain: <CloudRain className="w-7 h-7 text-blue-200 drop-shadow" />,
  Snow: <Snowflake className="w-7 h-7 text-blue-100 drop-shadow" />,
  Thunderstorm: <CloudLightning className="w-7 h-7 text-purple-200 drop-shadow" />,
  Drizzle: <CloudRain className="w-7 h-7 text-blue-200 drop-shadow" />,
  Mist: <Cloud className="w-7 h-7 text-gray-200 drop-shadow" />
};

const getDateKey = (timestamp: number) => {
  return new Date(timestamp * 1000).toISOString().split('T')[0];
};

const getYesterdayKey = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
};

const getLocationHistoryKey = (weather: WeatherData) => {
  const { lat, lon } = weather.location;
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
};

const readDailyHistory = () => {
  const raw = localStorage.getItem(historyKey);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Record<string, Record<string, StoredDailyForecast>>;
  } catch {
    return {};
  }
};

const saveTodayToHistory = (weather: WeatherData) => {
  const today = weather.forecast.daily[0];
  if (!today) return;

  const allHistory = readDailyHistory();
  const locationKey = getLocationHistoryKey(weather);
  const dateKey = getDateKey(today.dt);

  allHistory[locationKey] = {
    ...(allHistory[locationKey] ?? {}),
    [dateKey]: {
      ...today,
      dateKey
    }
  };

  localStorage.setItem(historyKey, JSON.stringify(allHistory));
};

const readYesterdayFromHistory = (weather: WeatherData) => {
  const allHistory = readDailyHistory();
  const locationKey = getLocationHistoryKey(weather);
  return allHistory[locationKey]?.[getYesterdayKey()] ?? null;
};

export default function DailyForecast() {
  const { currentWeather } = useWeatherStore();
  const [yesterday, setYesterday] = useState<StoredDailyForecast | null>(null);

  useEffect(() => {
    if (!currentWeather) return;

    const frame = requestAnimationFrame(() => {
      setYesterday(readYesterdayFromHistory(currentWeather));
      saveTodayToHistory(currentWeather);
    });

    return () => cancelAnimationFrame(frame);
  }, [currentWeather]);

  const rows = useMemo(() => {
    if (!currentWeather) return [];

    const dailyRows: ForecastRow[] = currentWeather.forecast.daily.slice(0, 7).map((day, index) => ({
      ...day,
      label: index === 0 ? 'Hoy' : day.day,
      muted: false,
      unavailable: false
    }));

    const yesterdaySource = yesterday ?? currentWeather.forecast.daily[0];
    const yesterdayRow: ForecastRow = {
      ...yesterdaySource,
      label: 'Ayer',
      muted: !yesterday,
      unavailable: !yesterday
    };

    return [yesterdayRow, ...dailyRows];
  }, [currentWeather, yesterday]);

  if (!currentWeather) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-md mx-auto mt-6"
    >
      <h3 className="text-lg font-semibold text-white mb-3 px-2">Proximos dias</h3>
      <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/15 backdrop-blur-md">
        <div className="space-y-5">
          {rows.map((day, index) => (
            <motion.div
              key={`${day.label}-${day.dt}-${index}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: day.muted ? 0.52 : 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="grid grid-cols-[4.5rem_4rem_1fr_5.25rem] items-center gap-2"
            >
              <span className="text-2xl font-semibold capitalize text-white">{day.label}</span>

              <span className="flex items-center gap-1 text-sm font-medium text-white/70">
                <Droplets className="h-4 w-4 fill-sky-100/50 text-sky-100/70" />
                {day.unavailable ? '--' : `${day.rainProbability}%`}
              </span>

              <div className="flex items-center justify-center gap-4">
                {day.unavailable ? (
                  <span className="text-sm text-white/55">Sin registro</span>
                ) : (
                  <>
                    {weatherIconMap[day.condition] || <Sun className="w-7 h-7 text-yellow-300 drop-shadow" />}
                    <Moon className="w-7 h-7 text-slate-100/90 drop-shadow" />
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 text-2xl font-semibold text-white">
                {day.unavailable ? (
                  <span className="text-white/55">--</span>
                ) : (
                  <>
                    <span>{day.max}{degree}</span>
                    <span>{day.min}{degree}</span>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
