import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const lang = searchParams.get('lang') || 'en';

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitud y longitud son requeridas' }, { status: 400 });
  }

  // Ahora leemos la variable sin NEXT_PUBLIC_ para que no se exponga en el cliente
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  if (!apiKey || apiKey === 'tu_api_key_aqui') {
    return NextResponse.json({ error: 'API key no configurada en el servidor' }, { status: 500 });
  }

  try {
    const params = `lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${lang}`;

    const [weatherRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}`)
    ]);

    if (!weatherRes.ok || !forecastRes.ok) {
      throw new Error('Error desde OpenWeatherMap');
    }

    const weatherData = await weatherRes.json();
    const forecastData = await forecastRes.json();

    return NextResponse.json({ weatherData, forecastData });
  } catch (error) {
    console.error('Error al obtener datos del clima:', error);
    return NextResponse.json({ error: 'Error interno del servidor al obtener el clima' }, { status: 500 });
  }
}
