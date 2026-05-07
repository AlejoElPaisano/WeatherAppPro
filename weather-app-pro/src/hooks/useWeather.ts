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

interface OpenWeatherSys {
  country: string;
  sunrise: number;
  sunset: number;
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
  sys: OpenWeatherSys;
  wind: {
    speed: number;
  };
  weather: OpenWeatherCondition[];
}

interface OpenWeatherCity {
  id: number;
  name: string;
  country: string;
  sunrise: number;
  sunset: number;
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
  city: OpenWeatherCity;
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

  const citySunrise = forecastData.city?.sunrise ?? weatherData.sys.sunrise;
  const citySunset = forecastData.city?.sunset ?? weatherData.sys.sunset;

  // Grupo forecast por dia para agregacion correcta de min/max
  const dailyMap = new Map<string, DailyForecast & { allItems: { temp: number; pop?: number }[] }>();

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
        rainProbability: item.pop ? Math.round(item.pop * 100) : 0,
        allItems: [{ temp: item.main.temp, pop: item.pop }]
      });
      return;
    }

    const existing = dailyMap.get(dayKey)!;
    existing.allItems.push({ temp: item.main.temp, pop: item.pop });
    existing.min = Math.min(existing.min, Math.round(item.main.temp_min));
    existing.max = Math.max(existing.max, Math.round(item.main.temp_max));
    existing.rainProbability = Math.max(existing.rainProbability, item.pop ? Math.round(item.pop * 100) : 0);
  });

  // Generar hourly con interpolacion para mostrar por hora completa
  const rawHourly = forecastData.list.slice(0, 8);
  const interpolatedHourly: HourlyForecast[] = [];

  for (let i = 0; i < rawHourly.length - 1; i++) {
    const currentItem = rawHourly[i];
    const nextItem = rawHourly[i + 1];

    const currentDate = new Date(currentItem.dt * 1000);
    const nextDate = new Date(nextItem.dt * 1000);
    const itemCondition = currentItem.weather[0] ?? currentCondition;

    const currentHour = currentDate.getHours();
    const nextHour = nextDate.getHours();
    // Handle day wrap correctly for hour difference
    const hourDiff = nextHour < currentHour ? (nextHour + 24) - currentHour : nextHour - currentHour;

    // Agregar la hora actual
    interpolatedHourly.push({
      dt: currentItem.dt,
      hour: currentDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(currentItem.main.temp),
      humidity: currentItem.main.humidity,
      condition: itemCondition.main,
      icon: itemCondition.icon,
      rainProbability: currentItem.pop ? Math.round(currentItem.pop * 100) : 0,
      isSunrise: undefined,
      isSunset: undefined
    });

    // Interpolar horas intermedias
    if (hourDiff > 1 && hourDiff <= 4) { // Only interpolate up to 4 hours gaps (usually it's 3)
      for (let h = 1; h < hourDiff; h++) {
        const interpolatedTemp = Math.round(currentItem.main.temp + ((nextItem.main.temp - currentItem.main.temp) * h / hourDiff));
        const interpolatedHumidity = Math.round(currentItem.main.humidity + ((nextItem.main.humidity - currentItem.main.humidity) * h / hourDiff));
        const interpolatedPop = currentItem.pop !== undefined && nextItem.pop !== undefined
          ? Math.round((currentItem.pop + (nextItem.pop - currentItem.pop) * h / hourDiff) * 100)
          : (currentItem.pop ? Math.round(currentItem.pop * 100) : 0);

        const interpolatedDate = new Date(currentDate);
        interpolatedDate.setHours(currentHour + h);

        interpolatedHourly.push({
          dt: Math.floor(interpolatedDate.getTime() / 1000),
          hour: interpolatedDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
          temp: interpolatedTemp,
          humidity: interpolatedHumidity,
          condition: itemCondition.main,
          icon: itemCondition.icon,
          rainProbability: interpolatedPop,
          isSunrise: undefined,
          isSunset: undefined
        });
      }
    }
  }

  // Agregar el ultimo item
  if (rawHourly.length > 0) {
    const lastItem = rawHourly[rawHourly.length - 1];
    const lastDate = new Date(lastItem.dt * 1000);
    const lastCondition = lastItem.weather[0] ?? currentCondition;
    interpolatedHourly.push({
      dt: lastItem.dt,
      hour: lastDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(lastItem.main.temp),
      humidity: lastItem.main.humidity,
      condition: lastCondition.main,
      icon: lastCondition.icon,
      rainProbability: lastItem.pop ? Math.round(lastItem.pop * 100) : 0,
    });
  }

  // Generar eventos de amanecer y atardecer para cada dia del rango de forecast
  // La API solo devuelve el sunrise/sunset de hoy; para dias siguientes sumamos 86400s por dia
  const sunEvents: HourlyForecast[] = [];
  for (let dayOffset = -1; dayOffset <= 6; dayOffset++) {
    const daySunrise = citySunrise + dayOffset * 86400;
    const daySunset  = citySunset  + dayOffset * 86400;

    const srDate = new Date(daySunrise * 1000);
    sunEvents.push({
      dt: daySunrise,
      hour: srDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      temp: 0,
      humidity: 0,
      condition: 'Clear',
      icon: '01d',
      rainProbability: 0,
      isSunrise: true
    });

    const ssDate = new Date(daySunset * 1000);
    sunEvents.push({
      dt: daySunset,
      hour: ssDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      temp: 0,
      humidity: 0,
      condition: 'Clear',
      icon: '01n',
      rainProbability: 0,
      isSunset: true
    });
  }

  const startTime = interpolatedHourly[0].dt;
  const endTime = interpolatedHourly[interpolatedHourly.length - 1].dt;
  // Ventana ampliada para eventos de sol: ±6 horas del rango de forecast
  const sunWindowStart = startTime - 6 * 3600;
  const sunWindowEnd = endTime + 6 * 3600;

  const combined = [...interpolatedHourly, ...sunEvents]
    .sort((a, b) => a.dt - b.dt)
    .filter(item => {
      if (item.isSunrise || item.isSunset) {
        // Incluir si cae dentro de la ventana ampliada
        return item.dt >= sunWindowStart && item.dt <= sunWindowEnd;
      }
      // Horas normales: rango exacto
      return item.dt >= startTime && item.dt <= endTime;
    });

  for (let i = 0; i < combined.length; i++) {
    if (combined[i].isSunrise || combined[i].isSunset) {
      const prev = combined.slice(0, i).reverse().find(x => !x.isSunrise && !x.isSunset);
      const next = combined.slice(i + 1).find(x => !x.isSunrise && !x.isSunset);
      if (prev && next) {
        const ratio = (combined[i].dt - prev.dt) / (next.dt - prev.dt);
        combined[i].temp = Math.round(prev.temp + (next.temp - prev.temp) * ratio);
        combined[i].humidity = Math.round(prev.humidity + (next.humidity - prev.humidity) * ratio);
        combined[i].rainProbability = Math.round(prev.rainProbability + (next.rainProbability - prev.rainProbability) * ratio);
      } else if (prev) {
        combined[i].temp = prev.temp;
        combined[i].humidity = prev.humidity;
        combined[i].rainProbability = prev.rainProbability;
      } else if (next) {
        combined[i].temp = next.temp;
        combined[i].humidity = next.humidity;
        combined[i].rainProbability = next.rainProbability;
      }
    }
  }

  return {
    current,
    forecast: {
      daily: Array.from(dailyMap.values()).map(({ allItems, ...rest }) => rest).slice(0, 7),
      hourly: combined
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
