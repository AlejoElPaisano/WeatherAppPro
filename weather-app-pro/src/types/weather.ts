export interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastData;
  location: LocationData;
}

export interface CurrentWeather {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  visibility: number;
  uv: number;
  pressure: number;
  condition: string;
  description: string;
  icon: string;
}

export interface ForecastData {
  daily: DailyForecast[];
  hourly: HourlyForecast[];
}

export interface DailyForecast {
  dt: number;
  day: string;
  min: number;
  max: number;
  condition: string;
  icon: string;
  rainProbability: number;
}

export interface HourlyForecast {
  dt: number;
  hour: string;
  temp: number;
  humidity: number;
  condition: string;
  icon: string;
}

export interface LocationData {
  city: string;
  country: string;
  lat: number;
  lon: number;
}

export type WeatherType = 'sunny' | 'rain' | 'snow' | 'cloudy' | 'night' | 'thunderstorm' | 'clear';

export interface ThemeConfig {
  background: string;
  textColor: string;
  accentColor: string;
  cardBg: string;
  animation: string;
}

export const WEATHER_THEMES: Record<WeatherType, ThemeConfig> = {
  sunny: {
    background: 'from-yellow-400 via-orange-300 to-amber-200',
    textColor: 'text-amber-900',
    accentColor: 'bg-amber-500',
    cardBg: 'bg-white/20 backdrop-blur-md',
    animation: 'animate-pulse-slow'
  },
  rain: {
    background: 'from-slate-800 via-slate-700 to-slate-600',
    textColor: 'text-blue-100',
    accentColor: 'bg-blue-500',
    cardBg: 'bg-white/10 backdrop-blur-md',
    animation: 'animate-pulse'
  },
  snow: {
    background: 'from-blue-100 via-blue-50 to-white',
    textColor: 'text-slate-800',
    accentColor: 'bg-blue-300',
    cardBg: 'bg-white/40 backdrop-blur-md',
    animation: 'animate-pulse-slow'
  },
  cloudy: {
    background: 'from-slate-300 via-slate-400 to-slate-500',
    textColor: 'text-slate-800',
    accentColor: 'bg-slate-500',
    cardBg: 'bg-white/30 backdrop-blur-md',
    animation: 'animate-pulse-slow'
  },
  night: {
    background: 'from-slate-900 via-purple-900 to-slate-900',
    textColor: 'text-purple-100',
    accentColor: 'bg-purple-500',
    cardBg: 'bg-white/10 backdrop-blur-md',
    animation: 'animate-pulse-slow'
  },
  thunderstorm: {
    background: 'from-gray-900 via-gray-800 to-purple-900',
    textColor: 'text-gray-100',
    accentColor: 'bg-purple-600',
    cardBg: 'bg-white/10 backdrop-blur-md',
    animation: 'animate-pulse'
  },
  clear: {
    background: 'from-blue-400 via-blue-300 to-cyan-200',
    textColor: 'text-blue-900',
    accentColor: 'bg-blue-500',
    cardBg: 'bg-white/20 backdrop-blur-md',
    animation: 'animate-pulse-slow'
  }
};
