'use client';

import { motion } from 'framer-motion';
import { Droplets, Eye, Gauge, Sun, Wind } from 'lucide-react';
import { useWeatherStore } from '@/store/weatherStore';

const getUvLabel = (uv: number, lang: string) => {
  if (uv >= 8) return lang === 'es' ? 'Muy alto' : 'Very high';
  if (uv >= 6) return lang === 'es' ? 'Alto' : 'High';
  if (uv >= 3) return lang === 'es' ? 'Moderado' : 'Moderate';
  return lang === 'es' ? 'Bajo' : 'Low';
};

const getHumidityLabel = (humidity: number, lang: string) => {
  if (humidity >= 75) return lang === 'es' ? 'Aire húmedo' : 'Humid air';
  if (humidity >= 45) return lang === 'es' ? 'Confortable' : 'Comfortable';
  return lang === 'es' ? 'Aire seco' : 'Dry air';
};

const getPressureLabel = (pressure: number, lang: string) => {
  if (pressure >= 1018) return lang === 'es' ? 'Actualmente en aumento' : 'Currently rising';
  if (pressure <= 1005) return lang === 'es' ? 'Actualmente en descenso' : 'Currently falling';
  return lang === 'es' ? 'Estable en este momento' : 'Currently stable';
};

const getVisibilityLabel = (visibility: number, lang: string) => {
  if (visibility >= 8) return lang === 'es' ? 'Buena en este momento' : 'Good visibility';
  if (visibility >= 4) return lang === 'es' ? 'Moderada' : 'Moderate';
  return lang === 'es' ? 'Reducida' : 'Reduced';
};

function DetailCard({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`min-h-40 rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl shadow-black/10 backdrop-blur-md ${className}`}
    >
      {children}
    </motion.div>
  );
}

function DetailHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white/70">
      {icon}
      <span>{title}</span>
    </div>
  );
}

export default function WeatherDetails() {
  const { currentWeather, language } = useWeatherStore();

  if (!currentWeather) return null;

  const { current } = currentWeather;
  const uvPercent = Math.min((current.uv / 11) * 100, 100);
  const humidityPercent = Math.min(current.humidity, 100);
  const windAngle = Math.min(current.wind_speed, 120) * 3;
  const pressurePercent = Math.min(Math.max(((current.pressure - 970) / 80) * 100, 0), 100);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.12 }}
      className="w-full"
    >
      <h3 className="text-lg font-semibold text-white mb-3 px-2">
        {language === 'es' ? 'Detalles del clima' : 'Weather Details'}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <DetailCard>
          <DetailHeader icon={<Sun className="h-4 w-4 text-yellow-200" />} title={language === 'es' ? 'Índice UV' : 'UV Index'} />
          <p className="mb-7 text-xl font-semibold text-white">{getUvLabel(current.uv, language)}</p>
          <div className="relative h-3 rounded-full bg-gradient-to-r from-lime-300 via-yellow-300 via-orange-400 to-fuchsia-500">
            <div
              className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-white bg-yellow-300 shadow-lg shadow-yellow-300/40"
              style={{ left: `calc(${uvPercent}% - 12px)` }}
            >
              <span className="flex h-full items-center justify-center text-[10px] font-bold text-white">
                {current.uv}
              </span>
            </div>
          </div>
        </DetailCard>

        <DetailCard>
          <DetailHeader icon={<Droplets className="h-4 w-4 text-cyan-100" />} title={language === 'es' ? 'Humedad' : 'Humidity'} />
          <p className="mb-6 text-base text-white/90">{getHumidityLabel(current.humidity, language)}</p>
          <p className="mb-4 text-4xl font-semibold text-white">{current.humidity}%</p>
          <div className="h-3 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-cyan-200"
              style={{ width: `${humidityPercent}%` }}
            />
          </div>
        </DetailCard>

        <DetailCard>
          <DetailHeader icon={<Wind className="h-4 w-4 text-white/80" />} title={language === 'es' ? 'Viento' : 'Wind'} />
          <p className="mb-3 text-base text-white/90">
            {current.wind_speed > 25 
              ? (language === 'es' ? 'Ventoso' : 'Windy') 
              : (language === 'es' ? 'Hay brisa' : 'Breezy')}
          </p>
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-[10px] border-white/25">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
              <div
                className="absolute -right-2 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[6px] border-l-[10px] border-y-transparent border-l-white"
                style={{ transform: `translateY(-50%) rotate(${windAngle}deg)`, transformOrigin: '-24px 50%' }}
              />
              <span className="text-center text-lg font-bold leading-tight text-white">
                {current.wind_speed}
                <span className="block text-xs font-semibold">km/h</span>
              </span>
            </div>
          </div>
        </DetailCard>

        <DetailCard>
          <DetailHeader icon={<Gauge className="h-4 w-4 text-blue-100" />} title={language === 'es' ? 'Presión' : 'Pressure'} />
          <p className="mb-5 text-base text-white/90">{getPressureLabel(current.pressure, language)}</p>
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border-[10px] border-white/20">
            <div
              className="absolute inset-[-10px] rounded-full"
              style={{
                background: `conic-gradient(rgba(255,255,255,0.78) ${pressurePercent}%, transparent ${pressurePercent}%)`,
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9px))'
              }}
            />
            <span className="text-center text-lg font-bold leading-tight text-white">
              {current.pressure}
              <span className="block text-xs font-semibold">hPa</span>
            </span>
          </div>
        </DetailCard>

        <DetailCard className="col-span-2 min-h-32">
          <DetailHeader icon={<Eye className="h-4 w-4 text-white/80" />} title={language === 'es' ? 'Visibilidad' : 'Visibility'} />
          <div className="flex items-end justify-between gap-4">
            <p className="max-w-36 text-base text-white/90">{getVisibilityLabel(current.visibility, language)}</p>
            <p className="text-right text-5xl font-semibold leading-none text-white">
              {current.visibility}
              <span className="block text-3xl">km</span>
            </p>
          </div>
        </DetailCard>
      </div>
    </motion.section>
  );
}
