'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${getBackgroundClass()} backdrop-blur-3xl`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

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
