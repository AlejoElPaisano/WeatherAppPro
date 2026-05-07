'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  drift: number;
}

const WEATHER_BACKGROUNDS: Record<string, string> = {
  Clear: 'https://source.unsplash.com/1600x2400/?clear-sky,sunlight',
  Night: 'https://source.unsplash.com/1600x2400/?night-sky,stars',
  Clouds: 'https://source.unsplash.com/1600x2400/?cloudy-sky,clouds',
  Rain: 'https://source.unsplash.com/1600x2400/?rain,city',
  Drizzle: 'https://source.unsplash.com/1600x2400/?drizzle,rain',
  Snow: 'https://source.unsplash.com/1600x2400/?snow,winter',
  Thunderstorm: 'https://source.unsplash.com/1600x2400/?thunderstorm,lightning',
  Mist: 'https://source.unsplash.com/1600x2400/?mist,fog',
  sunny: 'https://source.unsplash.com/1600x2400/?clear-sky,sunlight',
  clear: 'https://source.unsplash.com/1600x2400/?clear-sky,sunlight',
  night: 'https://source.unsplash.com/1600x2400/?night-sky,stars',
  cloudy: 'https://source.unsplash.com/1600x2400/?cloudy-sky,clouds',
  rain: 'https://source.unsplash.com/1600x2400/?rain,city',
  snow: 'https://source.unsplash.com/1600x2400/?snow,winter',
  thunderstorm: 'https://source.unsplash.com/1600x2400/?thunderstorm,lightning'
};

const getWeatherBackground = (weatherType: string) => {
  return WEATHER_BACKGROUNDS[weatherType] || WEATHER_BACKGROUNDS.Clear;
};

const buildParticles = (weatherType: string): Particle[] => {
  const particleCount = weatherType === 'snow' || weatherType === 'rain'
    ? 50
    : weatherType === 'night'
      ? 100
      : 20;

  return Array.from({ length: particleCount }, (_, index) => ({
    id: index,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: weatherType === 'snow'
      ? Math.random() * 4 + 2
      : weatherType === 'rain'
        ? Math.random() * 2 + 1
        : weatherType === 'night'
          ? Math.random() * 2 + 1
          : Math.random() * 3 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
    opacity: Math.random() * 0.6 + 0.2,
    drift: Math.random() * 100 - 50
  }));
};

export default function WeatherBackground() {
  const { weatherType } = useWeatherStore();
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const backgroundImage = getWeatherBackground(weatherType);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setParticles(buildParticles(weatherType));
      setMounted(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [weatherType]);

  const getBackgroundClass = () => {
    const backgrounds: Record<string, string> = {
      sunny: 'from-yellow-400/20 via-orange-300/20 to-amber-200/20',
      rain: 'from-slate-800 via-slate-700 to-slate-600',
      snow: 'from-blue-100/30 via-blue-50/30 to-white/30',
      cloudy: 'from-slate-400/40 via-slate-500/40 to-slate-600/40',
      night: 'from-slate-900/90 via-purple-900/80 to-black/90',
      thunderstorm: 'from-gray-900/80 via-gray-800/80 to-purple-900/80',
      clear: 'from-blue-500/40 via-blue-400/40 to-cyan-300/40'
    };

    return backgrounds[weatherType] || backgrounds.clear;
  };

  const getParticleClass = () => {
    switch (weatherType) {
      case 'snow':
        return 'bg-white rounded-full';
      case 'rain':
        return 'bg-blue-200 rounded-full h-4 w-0.5';
      case 'night':
        return 'bg-white rounded-full';
      default:
        return 'bg-yellow-200/30 rounded-full';
    }
  };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <AnimatePresence mode="sync">
        <motion.div
          key={weatherType}
          className={`absolute inset-0 bg-gradient-to-br ${getBackgroundClass()}`}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        >
          <Image
            src={backgroundImage}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/40 to-black/65 backdrop-blur-sm" />
        </motion.div>
      </AnimatePresence>

      {mounted && particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute ${getParticleClass()}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity
          }}
          animate={
            weatherType === 'rain'
              ? {
                  y: [0, 1000],
                  opacity: [particle.opacity, 0]
                }
              : weatherType === 'snow'
                ? {
                    y: [0, 600],
                    x: [0, particle.drift],
                    opacity: [particle.opacity, 0]
                  }
                : {
                    scale: [1, 1.2, 1],
                    opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity]
                  }
          }
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: weatherType === 'rain' ? 'linear' : 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}
