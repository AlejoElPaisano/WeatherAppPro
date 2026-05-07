<div align="center">

# 🌤 Climix

**A mobile-first weather web app with real-time forecasts, dynamic backgrounds, and smart city search.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## Overview

Climix is a weather application built with a mobile-first approach. It delivers current conditions, hourly forecasts, multi-day outlooks, and persistent favorite cities — all wrapped in a visually adaptive interface that changes with the weather.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Smart City Search** | Autocomplete powered by OpenWeather Geocoding with precise selection by city, state/province, and country |
| 📍 **Geolocation** | One-tap detection of your current location via the browser |
| 🌄 **Dynamic Backgrounds** | Full-screen imagery and particle effects that adapt to current weather conditions |
| 🌡️ **Current Conditions** | Temperature, feels-like, humidity, wind speed, visibility, pressure, and UV index |
| 📈 **Hourly Forecast** | Animated line chart with temperature labels following the curve and an integrated hour axis |
| 📅 **Daily Forecast** | Multi-day outlook with precipitation probability, including yesterday's historical record |
| ⭐ **Favorites** | Persistent favorite cities saved via `localStorage` |
| 💀 **Skeleton Loaders** | Custom loading states for a polished user experience |

---

## 🛠 Tech Stack

- **Framework:** Next.js 16 + React 19
- **Language:** TypeScript
- **Styling:** TailwindCSS 4
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React
- **Weather Data:** [OpenWeather API](https://openweathermap.org/api)
- **Persistence:** localStorage (MVP)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- An [OpenWeather API key](https://home.openweathermap.org/api_keys) (free tier works)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/AlejoElPaisano/WeatherAppPro.git
cd WeatherAppPro
```

2. **Navigate to the app directory**

```bash
cd weather-app-pro
```

3. **Configure environment variables**

Create a `.env.local` file inside `weather-app-pro/`:

```bash
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_api_key_here
```

4. **Install dependencies and start the dev server**

```bash
npm install
npm run dev
```

> **Windows PowerShell users:** If `npm` is blocked by execution policy, use `npm.cmd run dev` instead.

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
WeatherAppPro/
├── weather-app-pro/       # Next.js application
│   ├── src/
│   │   ├── app/           # App router, layout, metadata
│   │   └── components/    # UI components (search, forecast, details...)
│   ├── public/
│   ├── .env.local         # Local API key (git-ignored)
│   └── package.json
└── README.md
```

---

## 🗺 Roadmap

- [ ] PWA support — installable on mobile devices
- [ ] Real UV index via One Call API
- [ ] Rain notifications
- [ ] Interactive radar/map
- [ ] Optional backend (Supabase/Firebase) for multi-device favorites sync

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ☁️ and code by <a href="https://github.com/AlejoElPaisano">AlejoElPaisano</a></sub>
</div>
