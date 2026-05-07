'use client';

import { useCallback, useState } from 'react';
import {
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
  LocationData,
  WeatherData,
  WeatherType
} from '@/types/weather';
import { useWeatherStore } from '@/store/weatherStore';

export interface LocationSuggestion {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

interface OpenWeatherCondition {
  main: string;
  description: string;
  icon: string;
}

interface OpenWeatherCurrentResponse {
  dt: number;
  name: string;
  visibility: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  wind: {
    speed: number;
  };
  weather: OpenWeatherCondition[];
}

interface OpenWeatherForecastItem {
  dt: number;
  pop?: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: OpenWeatherCondition[];
}

interface OpenWeatherForecastResponse {
  list: OpenWeatherForecastItem[];
}

const API_KEY_ERROR = 'API key no configurada. Agrega NEXT_PUBLIC_OPENWEATHER_API_KEY en .env.local.';

const getApiKey = () => {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  if (!apiKey || apiKey === 'tu_api_key_aqui') {
    throw new Error(API_KEY_ERROR);
  }

  return apiKey;
};

const getWeatherType = (icon: string, dt?: number, sunrise?: number, sunset?: number): WeatherType => {
  const isNight = dt && sunrise && sunset ? dt < sunrise || dt > sunset : icon.endsWith('n');

  if (icon.includes('11')) return 'thunderstorm';
  if (icon.includes('13')) return 'snow';
  if (icon.includes('09') || icon.includes('10')) return 'rain';
  if (icon.includes('50') || icon.includes('02') || icon.includes('03') || icon.includes('04')) return 'cloudy';
  if (icon.includes('01')) return isNight ? 'night' : 'sunny';

  return isNight ? 'night' : 'clear';
};

const fetchJson = async <T,>(url: string, errorMessage: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
};

const normalizeWeatherData = (
  weatherData: OpenWeatherCurrentResponse,
  forecastData: OpenWeatherForecastResponse,
  location: LocationData
): WeatherData => {
  const currentCondition = weatherData.weather[0] ?? {
    main: 'Clear',
    description: 'despejado',
    icon: '01d'
  };

  const current: CurrentWeather = {
    temp: Math.round(weatherData.main.temp),
    feels_like: Math.round(weatherData.main.feels_like),
    humidity: weatherData.main.humidity,
    wind_speed: Math.round(weatherData.wind.speed * 3.6),
    visibility: Math.round(weatherData.visibility / 1000),
    uv: 0,
    pressure: weatherData.main.pressure,
    condition: currentCondition.main,
    description: currentCondition.description,
    icon: currentCondition.icon
  };

  const dailyMap = new Map<string, DailyForecast>();

  forecastData.list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dayKey = date.toISOString().split('T')[0];
    const itemCondition = item.weather[0] ?? currentCondition;

    if (!dailyMap.has(dayKey)) {
      dailyMap.set(dayKey, {
        dt: item.dt,
        day: date.toLocaleDateString('es-AR', { weekday: 'short' }),
        min: Math.round(item.main.temp_min),
        max: Math.round(item.main.temp_max),
        condition: itemCondition.main,
        icon: itemCondition.icon,
        rainProbability: item.pop ? Math.round(item.pop * 100) : 0
      });
      return;
    }

    const existing = dailyMap.get(dayKey);

    if (existing) {
      existing.min = Math.min(existing.min, Math.round(item.main.temp_min));
      existing.max = Math.max(existing.max, Math.round(item.main.temp_max));
      existing.rainProbability = Math.max(existing.rainProbability, item.pop ? Math.round(item.pop * 100) : 0);
    }
  });

  const hourly: HourlyForecast[] = forecastData.list.slice(0, 8).map((item) => {
    const date = new Date(item.dt * 1000);
    const itemCondition = item.weather[0] ?? currentCondition;

    return {
      dt: item.dt,
      hour: date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(item.main.temp),
      humidity: item.main.humidity,
      condition: itemCondition.main,
      icon: itemCondition.icon
    };
  });

  return {
    current,
    forecast: {
      daily: Array.from(dailyMap.values()).slice(0, 7),
      hourly
    },
    location
  };
};

export const formatLocationSuggestion = (location: LocationSuggestion) => {
  return [location.name, location.state, location.country].filter(Boolean).join(', ');
};

const fetchLocationSuggestions = async (query: string) => {
  const apiKey = getApiKey();

  return fetchJson<LocationSuggestion[]>(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`,
    'Error al buscar ciudades'
  );
};

const fetchWeatherByCoords = async (
  lat: number,
  lon: number,
  city: string,
  country: string,
  state?: string
) => {
  const apiKey = getApiKey();
  const params = `lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;

  const [weatherData, forecastData] = await Promise.all([
    fetchJson<OpenWeatherCurrentResponse>(
      `https://api.openweathermap.org/data/2.5/weather?${params}`,
      'Error al obtener datos del clima'
    ),
    fetchJson<OpenWeatherForecastResponse>(
      `https://api.openweathermap.org/data/2.5/forecast?${params}`,
      'Error al obtener pronostico'
    )
  ]);

  const location: LocationData = {
    city: city || weatherData.name,
    state,
    country: country || weatherData.sys.country,
    lat,
    lon
  };

  return {
    data: normalizeWeatherData(weatherData, forecastData, location),
    weatherType: getWeatherType(
      weatherData.weather[0]?.icon ?? '01d',
      weatherData.dt,
      weatherData.sys.sunrise,
      weatherData.sys.sunset
    )
  };
};

export const useWeatherSearch = () => {
  const { setCurrentWeather, setLoading, setError, setWeatherType } = useWeatherStore();
  const [loading, setLocalLoading] = useState(false);

  const applyWeatherResult = useCallback((result: { data: WeatherData; weatherType: WeatherType }) => {
    setWeatherType(result.weatherType);
    setCurrentWeather(result.data);
  }, [setCurrentWeather, setWeatherType]);

  const searchWeatherByCoords = useCallback(async (
    lat: number,
    lon: number,
    city = '',
    country = '',
    state?: string
  ) => {
    setLocalLoading(true);
    setLoading(true);
    setError(null);

    try {
      const result = await fetchWeatherByCoords(lat, lon, city, country, state);
      applyWeatherResult(result);

      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      setLocalLoading(false);
    }
  }, [applyWeatherResult, setError, setLoading]);

  const searchWeather = useCallback(async (city: string) => {
    setLocalLoading(true);
    setLoading(true);
    setError(null);

    try {
      const geoData = await fetchLocationSuggestions(city);

      if (!geoData.length) {
        throw new Error('Ciudad no encontrada');
      }

      const location = geoData[0];
      const result = await fetchWeatherByCoords(
        location.lat,
        location.lon,
        location.name,
        location.country,
        location.state
      );
      applyWeatherResult(result);

      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      setLocalLoading(false);
    }
  }, [applyWeatherResult, setError, setLoading]);

  const searchLocationSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) return [];

    return fetchLocationSuggestions(query.trim());
  }, []);

  return { searchWeather, searchWeatherByCoords, searchLocationSuggestions, loading };
};

export const useGeolocation = () => {
  const { searchWeatherByCoords } = useWeatherSearch();

  const getCurrentLocation = useCallback(() => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalizacion no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      });
    });
  }, []);

  const searchByLocation = useCallback(async () => {
    const position = await getCurrentLocation();
    const { latitude, longitude } = position.coords;

    return searchWeatherByCoords(latitude, longitude);
  }, [getCurrentLocation, searchWeatherByCoords]);

  return { searchByLocation, getCurrentLocation };
};
