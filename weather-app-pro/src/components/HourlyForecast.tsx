'use client';

import { motion } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';
import {
  Area,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Sun, Cloud, CloudRain, Snowflake, CloudLightning } from 'lucide-react';

const degree = '\u00B0';
const lineColor = '#facc15';

const weatherIconMap: Record<string, React.ReactNode> = {
  Clear: <Sun className="w-4 h-4 text-yellow-300" />,
  Clouds: <Cloud className="w-4 h-4 text-gray-200" />,
  Rain: <CloudRain className="w-4 h-4 text-blue-300" />,
  Snow: <Snowflake className="w-4 h-4 text-blue-100" />,
  Thunderstorm: <CloudLightning className="w-4 h-4 text-purple-300" />,
  Drizzle: <CloudRain className="w-4 h-4 text-blue-200" />,
  Mist: <Cloud className="w-4 h-4 text-gray-300" />
};

interface TemperatureLabelProps {
  x?: number | string;
  y?: number | string;
  value?: React.ReactNode;
}

function TemperatureLabel({ x, y, value }: TemperatureLabelProps) {
  if (
    typeof x !== 'number'
    || typeof y !== 'number'
    || (typeof value !== 'number' && typeof value !== 'string')
  ) {
    return null;
  }

  return (
    <g className="animate-pulse-slow">
      <text
        x={x}
        y={y - 18}
        textAnchor="middle"
        className="fill-white text-[12px] font-semibold drop-shadow"
      >
        {value}{degree}
      </text>
    </g>
  );
}

export default function HourlyForecast() {
  const { currentWeather } = useWeatherStore();

  if (!currentWeather) return null;

  const { hourly } = currentWeather.forecast;

  const chartData = hourly.map((hour) => ({
    time: hour.hour,
    temp: hour.temp,
    humidity: hour.humidity
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full max-w-md mx-auto mt-6"
    >
      <h3 className="text-lg font-semibold text-white mb-3 px-2">Pronostico por horas</h3>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-[520px]">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 34, right: 28, left: 28, bottom: 4 }}
                >
                  <defs>
                    <linearGradient id="hourlyTempGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={lineColor} stopOpacity={0.22} />
                      <stop offset="65%" stopColor={lineColor} stopOpacity={0.06} />
                      <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['dataMin - 4', 'dataMax + 5']} />
                  <Tooltip
                    cursor={{ stroke: 'rgba(250, 204, 21, 0.28)', strokeWidth: 1 }}
                    formatter={(value) => [`${value}${degree}`, 'Temperatura']}
                    contentStyle={{
                      backgroundColor: 'rgba(2, 6, 23, 0.92)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    labelStyle={{ color: 'rgba(255, 255, 255, 0.72)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="temp"
                    stroke="transparent"
                    fill="url(#hourlyTempGlow)"
                    fillOpacity={1}
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke={lineColor}
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dot={{ r: 5, fill: '#ffffff', stroke: lineColor, strokeWidth: 3 }}
                    activeDot={{ r: 7, fill: '#ffffff', stroke: lineColor, strokeWidth: 3 }}
                    isAnimationActive
                    animationDuration={1100}
                    animationEasing="ease-out"
                    className="drop-shadow-[0_0_10px_rgba(250,204,21,0.45)]"
                  >
                    <LabelList
                      dataKey="temp"
                      content={(props) => <TemperatureLabel {...props} />}
                    />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div
              className="grid px-7 pt-1"
              style={{ gridTemplateColumns: `repeat(${hourly.length}, minmax(0, 1fr))` }}
            >
              {hourly.map((hour, index) => (
                <motion.div
                  key={hour.dt}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + index * 0.05, duration: 0.35 }}
                  className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border border-white/5 bg-white/[0.04] px-1 py-2 text-center"
                >
                  <span className="text-[11px] font-medium leading-none text-white/65">{hour.hour}</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                    {weatherIconMap[hour.condition] || <Sun className="w-4 h-4 text-yellow-300" />}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
