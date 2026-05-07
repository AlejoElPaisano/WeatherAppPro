'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';
import {
  Area,
  AreaChart,
  Line,
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Sun, Cloud, CloudRain, Snowflake, CloudLightning, Droplets, Sunrise, Sunset, ChevronLeft, ChevronRight } from 'lucide-react';

const degree = '\u00B0';

const weatherIconMap: Record<string, React.ReactNode> = {
  Clear: <Sun className="w-8 h-8 text-yellow-300 drop-shadow" />,
  Clouds: <Cloud className="w-8 h-8 text-white drop-shadow" />,
  Rain: <CloudRain className="w-8 h-8 text-blue-200 drop-shadow" />,
  Snow: <Snowflake className="w-8 h-8 text-blue-100 drop-shadow" />,
  Thunderstorm: <CloudLightning className="w-8 h-8 text-purple-200 drop-shadow" />,
  Drizzle: <CloudRain className="w-8 h-8 text-blue-200 drop-shadow" />,
  Mist: <Cloud className="w-8 h-8 text-gray-200 drop-shadow" />
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.isSunrise || data.isSunset) return null;

    return (
      <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md">
        <p className="font-semibold text-white mb-1">{data.hour}</p>
        <p className="text-amber-400">Temp: {data.temp}°</p>
        {data.feels_like !== undefined && (
          <p className="text-purple-300">Sensación: {data.feels_like}°</p>
        )}
        <p className="text-blue-300">Lluvia: {data.rainProbability}%</p>
        <p className="text-slate-300 capitalize">{data.conditionStr}</p>
      </div>
    );
  }
  return null;
};

const CustomChartDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (payload.isSunrise) {
    return (
      <foreignObject x={cx - 20} y={cy - 20} width={40} height={40} className="overflow-visible pointer-events-none">
        <div className="flex flex-col items-center justify-center w-full h-full text-white drop-shadow-md">
          <Sunrise className="w-5 h-5 text-yellow-300" />
          <span className="text-[10px] font-medium leading-tight">{payload.hour}</span>
        </div>
      </foreignObject>
    );
  }
  if (payload.isSunset) {
    return (
      <foreignObject x={cx - 20} y={cy - 20} width={40} height={40} className="overflow-visible pointer-events-none">
        <div className="flex flex-col items-center justify-center w-full h-full text-white drop-shadow-md">
          <Sunset className="w-5 h-5 text-orange-400" />
          <span className="text-[10px] font-medium leading-tight">{payload.hour}</span>
        </div>
      </foreignObject>
    );
  }
  return null;
};

const CustomTopTick = (props: any) => {
  const { x, y, payload, chartData } = props;
  const hourData = chartData.find((h: any) => h.dt === payload.value);
  if (!hourData || hourData.isSunrise || hourData.isSunset) return null;

  const isCurrentHour = chartData.findIndex((h: any) => !h.isSunrise && !h.isSunset) === chartData.indexOf(hourData);

  return (
    <foreignObject x={x - 40} y={y - 95} width={80} height={100} className="overflow-visible pointer-events-none">
      <div className="flex flex-col items-center justify-center w-full h-full text-white">
        <span className={`text-xs ${isCurrentHour ? 'font-bold text-amber-400' : 'font-medium text-white/75'}`}>
          {isCurrentHour ? 'Ahora' : hourData.hour}
        </span>
        <div className="my-2 flex items-center justify-center h-10">
          {weatherIconMap[hourData.condition] || <Sun className="w-8 h-8 text-yellow-300 drop-shadow" />}
        </div>
        <span className="text-sm font-semibold drop-shadow">{hourData.temp}°</span>
      </div>
    </foreignObject>
  );
};

export default function HourlyForecast() {
  const { currentWeather } = useWeatherStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [showFeelsLike, setShowFeelsLike] = useState(false);

  const hourlyData = currentWeather?.forecast.hourly;

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [hourlyData]);

  if (!currentWeather) return null;

  const { forecast } = currentWeather;
  const { hourly } = forecast;

  const chartData = hourly.map((hour) => ({
    ...hour,
    conditionStr: hour.condition,
    rainFull: hour.rainProbability > 0 ? 100 : 0,
  }));

  const temps = chartData.filter(h => !h.isSunrise && !h.isSunset).map((h) => h.temp);
  const minTemp = Math.min(...temps, 0);
  const maxTemp = Math.max(...temps, 1);

  const minDt = chartData[0].dt;
  const maxDt = chartData[chartData.length - 1].dt;

  const getTempColor = (temp: number) => {
    const ratio = (temp - minTemp) / (maxTemp - minTemp || 1);
    const r = Math.round(110 + (245 - 110) * ratio);
    const g = Math.round(231 + (158 - 231) * ratio);
    const b = Math.round(183 + (11 - 183) * ratio);
    return `rgb(${r},${g},${b})`;
  };

  // Average or max pop for footer
  const pops = chartData.map(h => h.rainProbability || 0);
  const maxPop = Math.max(...pops, 0);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-3 px-2">
        <h3 className="text-lg font-semibold text-white">Información general</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={showFeelsLike}
              onChange={() => setShowFeelsLike(!showFeelsLike)}
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${showFeelsLike ? 'bg-amber-400' : 'bg-slate-600'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showFeelsLike ? 'transform translate-x-4' : ''}`}></div>
          </div>
          <span className="text-sm text-white/80">Sensación térmica</span>
        </label>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1b2e]/90 p-5 shadow-2xl shadow-black/30 backdrop-blur-md">
        
        <div className="relative group">
          <button
            onClick={() => scroll('left')}
            className={`hidden lg:flex absolute left-0 top-[60%] -translate-y-1/2 z-20 items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-opacity duration-300 ${showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            title="Desplazar a la izquierda"
          >
            <ChevronLeft className="w-5 h-5 pr-0.5" />
          </button>

          <button
            onClick={() => scroll('right')}
            className={`hidden lg:flex absolute right-0 top-[60%] -translate-y-1/2 z-20 items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-opacity duration-300 ${showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            title="Desplazar a la derecha"
          >
            <ChevronRight className="w-5 h-5 pl-0.5" />
          </button>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="overflow-x-auto scrollbar-hide pb-2"
          >
            <div style={{ minWidth: `${Math.max(620, chartData.length * 75)}px`, height: '280px' }} className="relative mt-12">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 30, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="colorTempArea" x1="0" y1="0" x2="1" y2="0">
                      {chartData.map((h, i) => {
                        const offset = ((h.dt - minDt) / (maxDt - minDt)) * 100;
                        return (
                          <stop 
                            key={i} 
                            offset={`${offset}%`} 
                            stopColor={getTempColor(h.temp)} 
                            stopOpacity={0.8} 
                          />
                        );
                      })}
                    </linearGradient>
                  </defs>
                  
                  <XAxis 
                    dataKey="dt" 
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    orientation="top"
                    ticks={chartData.filter(h => !h.isSunrise && !h.isSunset).map(h => h.dt)}
                    tick={<CustomTopTick chartData={chartData} />}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                  <YAxis yAxisId="rain" hide domain={[0, 100]} />
                  
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />

                  {/* Lluvia background */}
                  <Bar 
                    dataKey="rainFull" 
                    yAxisId="rain"
                    fill="rgba(59,130,246,0.15)" 
                    barSize={60}
                    isAnimationActive={false}
                  />

                  {/* Area chart para temperatura */}
                  <Area
                    type="monotone"
                    dataKey="temp"
                    stroke="#ffffff"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTempArea)"
                    dot={<CustomChartDot />}
                    activeDot={{ r: 6, fill: '#fff', stroke: '#f59e0b', strokeWidth: 2 }}
                    isAnimationActive
                    animationDuration={1500}
                  />

                  {/* Sensacion termica */}
                  {showFeelsLike && (
                    <Line
                      type="monotone"
                      dataKey="feels_like"
                      stroke="#d8b4fe"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      activeDot={false}
                      isAnimationActive
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Footer bar */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-end">
          <div className="flex items-center gap-1.5 text-blue-300 font-medium bg-blue-500/10 px-3 py-1 rounded-full text-sm">
            <Droplets className="w-4 h-4" />
            <span>Probabilidad máxima de lluvia: {maxPop}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
