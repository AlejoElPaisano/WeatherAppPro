'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';
import {
  Area,
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

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.isSunrise || data.isSunset) return null;

    return (
      <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md">
        <p className="font-semibold text-white mb-1">{data.time}</p>
        <p className="text-amber-400 font-medium">Temp: {data.temp}°</p>
        {data.feels_like !== undefined && (
          <p className="text-purple-300 font-medium">Sensación: {data.feels_like}°</p>
        )}
        <p className="text-blue-300 font-medium">Lluvia: {data.rainProbability}%</p>
        <p className="text-slate-300 capitalize text-sm mt-1">{data.conditionStr}</p>
      </div>
    );
  }
  return null;
};

const CustomRainShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  const prob = payload.rainProbability;
  
  if (!prob || prob === 0) return null;

  // Pseudo-random deterministic values based on hour to avoid jitter
  const seed = payload.time ? payload.time.charCodeAt(0) + payload.time.charCodeAt(1) : 1;
  const random = (i: number) => {
    const val = Math.sin(seed * 100 + i * 10) * 10000;
    return val - Math.floor(val);
  };

  const dropCount = Math.max(2, Math.floor((prob / 100) * 15));
  const drops = Array.from({ length: dropCount });

  return (
    <foreignObject x={x} y={y} width={width} height={height} className="pointer-events-none">
      <div className="relative w-full h-full overflow-hidden">
        {drops.map((_, i) => {
          const left = `${5 + random(i) * 90}%`;
          const delay = `${random(i + 10) * 2}s`;
          const duration = `${0.6 + random(i + 20) * 0.4}s`;
          const dropHeight = `${10 + random(i + 30) * 10}px`;
          
          return (
            <div
              key={i}
              className="absolute top-[-20px] w-[1.5px] rounded-full bg-gradient-to-b from-transparent to-blue-300/80"
              style={{
                left,
                height: dropHeight,
                animation: `rainFall ${duration} linear ${delay} infinite`
              }}
            />
          );
        })}
      </div>
    </foreignObject>
  );
};

export default function HourlyForecast() {
  const { currentWeather, language } = useWeatherStore();
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

  const { current, forecast } = currentWeather;
  const { hourly, daily } = forecast;
  const today = daily[0];

  const summaryEs = today
    ? `${capitalize(current.description)}. Máximas entre ${today.max - 1} y ${today.max + 1} C y mínimas entre ${Math.max(today.min - 1, -20)} y ${today.min + 1} C.`
    : capitalize(current.description);
    
  const summaryEn = today
    ? `${capitalize(current.description)}. Highs between ${today.max - 1} and ${today.max + 1} C, lows between ${Math.max(today.min - 1, -20)} and ${today.min + 1} C.`
    : capitalize(current.description);

  const summary = language === 'es' ? summaryEs : summaryEn;

  const chartData = hourly.map((hour) => ({
    time: hour.hour,
    temp: hour.temp,
    feels_like: hour.feels_like,
    humidity: hour.humidity,
    rainFull: hour.rainProbability > 0 ? 100 : 0,
    rainProbability: hour.rainProbability,
    isSunrise: hour.isSunrise,
    isSunset: hour.isSunset,
    conditionStr: hour.condition,
  }));

  const temps = chartData.filter(h => !h.isSunrise && !h.isSunset).map((h) => h.temp);
  const minTemp = Math.min(...temps, 0);
  const maxTemp = Math.max(...temps, 1);

  const getTempColor = (temp: number) => {
    const ratio = (temp - minTemp) / (maxTemp - minTemp || 1);
    const r = Math.round(110 + (245 - 110) * ratio);
    const g = Math.round(231 + (158 - 231) * ratio);
    const b = Math.round(183 + (11 - 183) * ratio);
    return `rgb(${r},${g},${b})`;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isSunrise || payload.isSunset) return null;
    return <circle cx={cx} cy={cy} r={4} fill="#ffffff" stroke="#ffffff" strokeWidth={1} />;
  };

  const renderActiveDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isSunrise || payload.isSunset) return null;
    return <circle cx={cx} cy={cy} r={6} fill="#ffffff" stroke="#facc15" strokeWidth={3} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full"
    >
      <style>{`
        @keyframes rainFall {
          0% { transform: translateY(-20px); opacity: 0; }
          10% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(120px); opacity: 0; }
        }
      `}</style>
      <div className="flex items-center justify-between mb-3 px-2">
        <h3 className="text-lg font-semibold text-white">
          {language === 'es' ? 'Pronóstico por horas' : 'Hourly Forecast'}
        </h3>
        <label className="flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors border border-white/5">
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={showFeelsLike}
              onChange={() => setShowFeelsLike(!showFeelsLike)}
            />
            <div className={`block w-10 h-5 rounded-full transition-colors ${showFeelsLike ? 'bg-purple-500/80 shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'bg-black/30'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${showFeelsLike ? 'transform translate-x-5' : ''}`}></div>
          </div>
          <span className={`text-sm font-medium transition-colors ${showFeelsLike ? 'text-purple-200' : 'text-white/70'}`}>
            {language === 'es' ? 'Sensación' : 'Feels Like'}
          </span>
        </label>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/15 backdrop-blur-md">
        <p className="px-1 pb-5 text-xl font-semibold leading-relaxed text-white">
          {summary}
        </p>
        <div className="h-px bg-white/20 mb-2" />

        <div className="relative group">
          <button
            onClick={() => scroll('left')}
            className={`hidden lg:flex absolute left-0 top-[45%] -translate-y-1/2 z-20 items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-opacity duration-300 ${showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            title={language === 'es' ? 'Desplazar a la izquierda' : 'Scroll left'}
          >
            <ChevronLeft className="w-5 h-5 pr-0.5" />
          </button>

          <button
            onClick={() => scroll('right')}
            className={`hidden lg:flex absolute right-0 top-[45%] -translate-y-1/2 z-20 items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-opacity duration-300 ${showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            title={language === 'es' ? 'Desplazar a la derecha' : 'Scroll right'}
          >
            <ChevronRight className="w-5 h-5 pl-0.5" />
          </button>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="overflow-x-auto scrollbar-hide"
          >
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
                        <span className="text-sm font-medium text-white drop-shadow truncate">
                          {language === 'es' ? 'Amanecer' : 'Sunrise'}
                        </span>
                      ) : hour.isSunset ? (
                        <span className="text-sm font-medium text-white drop-shadow truncate">
                          {language === 'es' ? 'Atardecer' : 'Sunset'}
                        </span>
                      ) : (
                        <span className="text-2xl font-semibold leading-none text-white drop-shadow">
                          {hour.temp}{degree}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="h-28 w-full mt-2 min-w-0">
                <ResponsiveContainer width="99%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 16, right: 36, left: 36, bottom: 12 }}
                  >
                    <defs>
                      <linearGradient id="colorTempArea" x1="0" y1="0" x2="1" y2="0">
                        {chartData.map((h, i) => (
                          <stop 
                            key={i} 
                            offset={`${(i / (chartData.length - 1)) * 100}%`} 
                            stopColor={getTempColor(h.temp)} 
                            stopOpacity={0.8} 
                          />
                        ))}
                      </linearGradient>
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
                    <YAxis yAxisId="rain" hide domain={[0, 100]} />
                    
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />

                    {/* Animacion de lluvia */}
                    <Bar 
                      dataKey="rainFull" 
                      yAxisId="rain"
                      shape={<CustomRainShape />}
                      isAnimationActive={false}
                    />

                    <Area
                      type="monotone"
                      dataKey="temp"
                      stroke="#ffffff"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorTempArea)"
                      dot={renderCustomDot}
                      activeDot={renderActiveDot}
                      isAnimationActive
                      animationDuration={1200}
                    />

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
      </div>
    </motion.div>
  );
}
