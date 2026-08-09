import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    console.error('[API update-role] Missing env vars:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceRoleKey,
      hasAnonKey: !!anonKey
    });
    return NextResponse.json(
      { error: 'Configuración del servidor incompleta.' },
      { status: 500 }
    );
  }

  // 1. Extract and validate the admin's JWT token
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'No autorizado. Token ausente.' }, { status: 401 });
  }

  try {
    // 2. Validate the token against Supabase Auth
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Token inválido o expirado.' }, { status: 401 });
    }

    const userData = await userResponse.json();
    const requesterId = userData.id;

    // 3. Verify the requester is an admin by checking public.profiles
    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${requesterId}&select=role`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!profileResponse.ok) {
      return NextResponse.json({ error: 'Error al verificar permisos.' }, { status: 500 });
    }

    const profileData = await profileResponse.json();
    const requesterRole = profileData[0]?.role;

    if (requesterRole !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo administradores pueden cambiar roles.' },
        { status: 403 }
      );
    }

    // 4. Parse request body
    const body = await request.json();
    const { userId, newRole } = body;

    if (!userId || !newRole) {
      return NextResponse.json({ error: 'Faltan campos requeridos: userId, newRole.' }, { status: 400 });
    }

    if (!['user', 'admin'].includes(newRole)) {
      return NextResponse.json(
        { error: 'Rol inválido. Los valores permitidos son: user, admin.' },
        { status: 400 }
      );
    }

    // 5. Prevent self-demotion
    if (userId === requesterId && newRole !== 'admin') {
      return NextResponse.json(
        { error: 'No puedes remover tu propio rol de administrador.' },
        { status: 400 }
      );
    }

    // 6. Use SERVICE_ROLE_KEY to bypass RLS and update the role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .select('id, role');

    if (updateError) {
      console.error('[API update-role] Error updating role in profiles:', updateError);
      return NextResponse.json(
        { error: `Error al actualizar el rol: ${updateError.message}` },
        { status: 500 }
      );
    }

    if (!updateData || updateData.length === 0) {
      return NextResponse.json(
        { error: 'No se encontró el usuario en la base de datos.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      userId,
      role: newRole,
      message: `Rol actualizado a "${newRole}" correctamente.`
    });

  } catch (error: any) {
    console.error('Exception in update-role API route:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
