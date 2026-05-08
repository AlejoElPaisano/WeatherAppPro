import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'La ciudad es requerida' }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  if (!apiKey || apiKey === 'tu_api_key_aqui') {
    return NextResponse.json({ error: 'API key no configurada en el servidor' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${apiKey}`);
    
    if (!res.ok) {
      throw new Error('Error al consultar geocoding directo');
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error geo direct:', error);
    return NextResponse.json({ error: 'Error interno al buscar ciudades' }, { status: 500 });
  }
}
