import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitud y longitud son requeridas' }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  if (!apiKey || apiKey === 'tu_api_key_aqui') {
    return NextResponse.json({ error: 'API key no configurada en el servidor' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`);
    
    if (!res.ok) {
      throw new Error('Error al consultar geocoding inverso');
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error geo reverse:', error);
    return NextResponse.json({ error: 'Error interno al obtener nombre de la ubicación' }, { status: 500 });
  }
}
