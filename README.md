# Climix

Climix es una aplicacion web mobile-first para consultar clima actual, pronostico por horas, proximos dias y ciudades favoritas.

## Features

- Busqueda de ciudades con autocompletado usando OpenWeather Geocoding.
- Seleccion precisa por ciudad, estado/provincia y pais.
- Geolocalizacion desde el navegador.
- Fondo dinamico segun el clima.
- Temperatura principal con sensacion termica, humedad, viento, visibilidad, presion e indice UV.
- Pronostico por horas con grafico de linea dinamico, etiquetas sobre la curva y eje horario integrado.
- Pronostico de proximos dias.
- Favoritos persistidos con localStorage.
- Loading state con skeletons.

## Stack

- Next.js
- React
- TypeScript
- TailwindCSS
- Zustand
- Framer Motion
- Recharts
- Lucide React

## Configuracion local

La aplicacion vive en `weather-app-pro/`.

Crear un archivo `.env.local` dentro de `weather-app-pro/`:

```bash
NEXT_PUBLIC_OPENWEATHER_API_KEY=tu_api_key
```

Instalar dependencias y correr el servidor:

```bash
cd weather-app-pro
npm install
npm run dev
```

En Windows PowerShell, si `npm` queda bloqueado por execution policy, usar:

```bash
npm.cmd run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Roadmap

- PWA para instalacion mobile.
- Mejoras visuales en mobile real.
- Notificaciones de lluvia.
- Radar/mapa interactivo.
- Backend opcional para sincronizar favoritos entre dispositivos.
