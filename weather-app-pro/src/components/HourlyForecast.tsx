'use client';

import { motion } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Sun, Cloud, CloudRain, Snowflake, CloudLightning, Droplets, Sunrise, Sunset } from 'lucide-react';

const degree = '\u00B0';
const lineColor = '#facc15';

const weatherIconMap: Record<string, React.ReactNode> = {
  Clear: <Sun className="w-8 h-8 text-yellow-300 drop-shadow" />,
  Clouds: <Cloud className="w-8 h-8 text-white drop-shadow" />,
  Rain: <CloudRain className="w-8 h-8 text-blue-200 drop-shadow" />,
  Snow: <Snowflake className="w-8 h-8 text-blue-100 drop-shadow" />,
  Thunderstorm: <CloudLightning className="w-8 h-8 text-purple-200 drop-shadow" />,
  Drizzle: <CloudRain className="w-8 h-8 text-blue-200 drop-shadow" />,
  Mist: <Cloud className="w-8 h-8 text-gray-200 drop-shadow" />
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export default function HourlyForecast() {
  const { currentWeather } = useWeatherStore();

  if (!currentWeather) return null;

  const { current, forecast } = currentWeather;
  const { hourly, daily } = forecast;
  const today = daily[0];

  const chartData = hourly.map((hour) => ({
    time: hour.hour,
    temp: hour.temp,
    humidity: hour.humidity
  }));

  const summary = today
    ? `${capitalize(current.description)}. Maximas entre ${today.max - 1} y ${today.max + 1} C y minimas entre ${Math.max(today.min - 1, -20)} y ${today.min + 1} C.`
    : capitalize(current.description);

  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isSunrise || payload.isSunset) return null;
    return <circle cx={cx} cy={cy} r={4} fill="#ffffff" stroke="#ffffff" strokeWidth={1} />;
  };

  const renderActiveDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isSunrise || payload.isSunset) return null;
    return <circle cx={cx} cy={cy} r={6} fill="#ffffff" stroke={lineColor} strokeWidth={3} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full max-w-md mx-auto mt-6"
    >
      <h3 className="text-lg font-semibold text-white mb-3 px-2">Pronostico por horas</h3>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/15 backdrop-blur-md">
        <p className="px-1 pb-5 text-xl font-semibold leading-relaxed text-white">
          {summary}
        </p>
        <div className="h-px bg-white/20" />

        <div className="overflow-x-auto scrollbar-hide">
          <div className="pt-6 pb-2" style={{ minWidth: `${Math.max(620, hourly.length * 64)}px` }}>
            <div
              className="grid px-5"
              style={{ gridTemplateColumns: `repeat(${hourly.length}, minmax(0, 1fr))` }}
            >
              {hourly.map((hour, index) => (
                <motion.div
                  key={`hour-${hour.dt}-${index}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.04, duration: 0.35 }}
                  className="flex flex-col items-center text-center justify-between h-[100px]"
                >
                  <span className="text-sm font-medium leading-none text-white/75">{hour.hour}</span>
                  <div className="flex h-10 w-10 items-center justify-center">
                    {hour.isSunrise ? (
                      <Sunrise className="w-8 h-8 text-yellow-300 drop-shadow" />
                    ) : hour.isSunset ? (
                      <Sunset className="w-8 h-8 text-orange-400 drop-shadow" />
                    ) : (
                      weatherIconMap[hour.condition] || <Sun className="w-8 h-8 text-yellow-300 drop-shadow" />
                    )}
                  </div>
                  <div className="flex h-8 items-center justify-center">
                    {hour.isSunrise ? (
                      <span className="text-sm font-medium text-white drop-shadow truncate">Amanecer</span>
                    ) : hour.isSunset ? (
                      <span className="text-sm font-medium text-white drop-shadow truncate">Atardecer</span>
                    ) : (
                      <span className="text-2xl font-semibold leading-none text-white drop-shadow">
                        {hour.temp}{degree}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="h-20 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 16, right: 36, left: 36, bottom: 12 }}
                >
                  <defs>
                    <filter id="hourlyLineGlow" x="-20%" y="-60%" width="140%" height="220%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['dataMin - 3', 'dataMax + 3']} />
                  <Tooltip
                    cursor={false}
                    formatter={(value) => [`${value}${degree}`, 'Temperatura']}
                    contentStyle={{
                      backgroundColor: 'rgba(2, 6, 23, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    labelStyle={{ color: 'rgba(255, 255, 255, 0.72)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke={lineColor}
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dot={renderCustomDot}
                    activeDot={renderActiveDot}
                    filter="url(#hourlyLineGlow)"
                    isAnimationActive
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div
              className="grid px-5 pt-2"
              style={{ gridTemplateColumns: `repeat(${hourly.length}, minmax(0, 1fr))` }}
            >
              {hourly.map((hour, index) => (
                <div key={`rain-${hour.dt}-${index}`} className="flex items-center justify-center gap-1 text-xs font-medium text-white/70">
                  {hour.isSunrise || hour.isSunset ? null : (
                    <>
                      <Droplets className="h-3 w-3 fill-sky-200/50 text-sky-200/70" />
                      {hour.rainProbability}%
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
