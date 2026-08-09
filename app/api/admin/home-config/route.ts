import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_HERO_SLIDES, DEFAULT_HOME_TEXTS } from '@/lib/homeContent';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({
      slides: DEFAULT_HERO_SLIDES,
      texts: DEFAULT_HOME_TEXTS
    });
  }

  try {
    const supabase = createClient(supabaseUrl, anonKey);
    const { data, error } = await supabase
      .from('home_config')
      .select('slides, texts')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({
        slides: DEFAULT_HERO_SLIDES,
        texts: DEFAULT_HOME_TEXTS
      });
    }

    return NextResponse.json({
      slides: data.slides && Array.isArray(data.slides) && data.slides.length > 0 ? data.slides : DEFAULT_HERO_SLIDES,
      texts: data.texts ? { ...DEFAULT_HOME_TEXTS, ...data.texts } : DEFAULT_HOME_TEXTS
    });
  } catch (err) {
    console.error('Error fetching home config:', err);
    return NextResponse.json({
      slides: DEFAULT_HERO_SLIDES,
      texts: DEFAULT_HOME_TEXTS
    });
  }
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return NextResponse.json(
      { error: 'Configuración del servidor incompleta (Variables de entorno faltantes).' },
      { status: 500 }
    );
  }

  // 1. Extract and validate JWT token
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'No autorizado. Token ausente.' }, { status: 401 });
  }

  try {
    // 2. Validate token against Supabase Auth
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${token}` }
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Token inválido o expirado.' }, { status: 401 });
    }

    const userData = await userResponse.json();

    // 3. Verify admin role
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${userData.id}&select=role`,
      { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } }
    );
    const profileData = await profileResponse.json();

    if (profileData[0]?.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado. Se requiere rol de administrador.' }, { status: 403 });
    }

    // 4. Parse payload
    const body = await request.json();
    const { slides, texts } = body;

    // 5. Initialize admin client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { error: upsertError } = await supabaseAdmin
      .from('home_config')
      .upsert({
        id: 'default',
        slides: slides || DEFAULT_HERO_SLIDES,
        texts: texts || DEFAULT_HOME_TEXTS,
        updated_at: new Date().toISOString()
      });

    if (upsertError) {
      console.error('[API home-config] Error upserting home_config:', upsertError);
      return NextResponse.json(
        { error: `Error al guardar en base de datos: ${upsertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración del inicio actualizada globalmente.'
    });

  } catch (error: any) {
    console.error('[API home-config] Exception:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
