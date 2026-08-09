import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return NextResponse.json(
      { error: 'Configuración del servidor incompleta (Variables de entorno ausentes).' },
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

    // 4. Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'product-images';

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo.' }, { status: 400 });
    }

    // 5. Initialize Supabase Admin client with service_role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Ensure bucket exists or create it
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucket);

    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });
    } else {
      // Ensure bucket is public
      await supabaseAdmin.storage.updateBucket(bucket, { public: true });
    }

    // 6. Upload file
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('[API upload] Error uploading image:', uploadError);
      return NextResponse.json({ error: `Error al subir imagen: ${uploadError.message}` }, { status: 500 });
    }

    // 7. Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName
    });

  } catch (error: any) {
    console.error('[API upload] Exception:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
