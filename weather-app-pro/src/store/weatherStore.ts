import { create } from 'zustand';
import { WeatherData, WeatherType } from '@/types/weather';

interface WeatherStore {
  // Estado
  currentWeather: WeatherData | null;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  weatherType: WeatherType;
  favorites: string[];
  unit: 'C' | 'F';
  searchResetKey: number;

  // Acciones
  setCurrentWeather: (weather: WeatherData) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setWeatherType: (type: WeatherType) => void;
  addFavorite: (city: string) => void;
  removeFavorite: (city: string) => void;
  toggleUnit: () => void;
  loadFavorites: () => void;
  clearWeather: () => void;
}

export const useWeatherStore = create<WeatherStore>((set, get) => ({
  currentWeather: null,
  searchQuery: '',
  loading: false,
  error: null,
  weatherType: 'clear',
  favorites: [],
  unit: 'C',
  searchResetKey: 0,

  setCurrentWeather: (weather) => set({ currentWeather: weather }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setWeatherType: (type) => set({ weatherType: type }),
  
  addFavorite: (city) => {
    const current = get().favorites;
    if (!current.includes(city)) {
      const updated = [...current, city];
      localStorage.setItem('weather-favorites', JSON.stringify(updated));
      set({ favorites: updated });
    }
  },

  removeFavorite: (city) => {
    const current = get().favorites;
    const updated = current.filter((c) => c !== city);
    localStorage.setItem('weather-favorites', JSON.stringify(updated));
    set({ favorites: updated });
  },

  toggleUnit: () => {
    const current = get().unit;
    set({ unit: current === 'C' ? 'F' : 'C' });
  },

  loadFavorites: () => {
    const saved = localStorage.getItem('weather-favorites');
    if (saved) {
      try {
        const favorites = JSON.parse(saved);
        set({ favorites });
      } catch (e) {
        console.error('Error loading favorites', e);
      }
    }
  },

  clearWeather: () => set((state) => ({ currentWeather: null, error: null, weatherType: 'clear', searchResetKey: state.searchResetKey + 1 }))
}));
