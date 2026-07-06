'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  // Auth states
  const [user, setUser] = useState<User | null>(null);
  const [isSignUp, setIsSignUp] = useState(false); // Default to login (iniciar sesión) for smoother flow, toggleable to register
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Helper to ensure a profile record exists in public.profiles table
  const ensureProfileExists = async (currentUser: User) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (!profile) {
        await supabase.from('profiles').insert([{
          id: currentUser.id,
          email: currentUser.email,
          full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || '',
          avatar_url: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || '',
          role: 'user'
        }]);
      }
    } catch (err) {
      console.error('Error ensuring profile exists:', err);
    }
  };

  // Check current session on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await ensureProfileExists(user);
          setUser(user);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await ensureProfileExists(session.user);
        setUser(session.user);
      } else {
        setUser(null);
      }
      setCheckingAuth(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Form input focus interactions
  useEffect(() => {
    const handleFocus = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const label = target.parentElement?.querySelector('label');
      if (label) label.classList.add('text-primary');
    };

    const handleBlur = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const label = target.parentElement?.querySelector('label');
      if (label) label.classList.remove('text-primary');
    };

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
    });

    return () => {
      inputs.forEach(input => {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      });
    };
  }, [isSignUp, user]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!email || !password) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      setLoading(false);
      return;
    }

    if (isSignUp) {
      if (!fullName) {
        setErrorMsg('Por favor ingresa tu nombre completo.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        setLoading(false);
        return;
      }

      // Supabase Sign Up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        if (data.session) {
          setSuccessMsg('¡Cuenta creada y sesión iniciada correctamente!');
          setUser(data.user);
          router.push('/');
        } else {
          setSuccessMsg('¡Cuenta creada con éxito! Por favor verifica tu correo para confirmar tu cuenta.');
          // Clear inputs
          setFullName('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }
      }
    } else {
      // Supabase Sign In
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Sesión iniciada correctamente.');
        setUser(data.user);
        router.push('/');
      }
    }
    setLoading(false);
  };

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/login`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error al iniciar sesión.');
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMsg(error.message);
    } else {
      setUser(null);
      setSuccessMsg('Sesión cerrada correctamente.');
    }
    setLoading(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface artisanal-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant font-body-md animate-pulse">Cargando...</p>
        </div>
      </div>
    );
  }

  // Render Logged In Profile State
  if (user) {
    const userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Artesano';
    const provider = user.app_metadata?.provider || 'correo electrónico';

    return (
      <div className="bg-surface text-on-surface artisanal-bg min-h-screen flex flex-col font-body-md">
        <main className="flex-grow flex items-center justify-center pb-12 px-margin-mobile py-12">
          <div className="max-w-md w-full bg-white p-8 rounded-xl soft-elevation border border-surface-variant/30 text-center">
            
            <div className="text-left mb-6">
              <Link href="/" className="inline-flex items-center gap-2 text-primary hover:opacity-80 font-bold transition-all text-body-sm">
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </Link>
            </div>

            {/* User Profile Info */}
            <h1 className="font-headline-lg text-headline-lg text-primary mb-6">Mi Perfil</h1>
            
            <div className="flex flex-col items-center gap-4 mb-8">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={displayName}
                  className="w-24 h-24 rounded-full border-4 border-primary/20 object-cover shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-4xl shadow-md uppercase">
                  {displayName.charAt(0)}
                </div>
              )}
              
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">{displayName}</h2>
                <p className="text-on-surface-variant text-body-md">{user.email}</p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant capitalize">
                  Conectado con {provider}
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 mb-6 text-sm text-error bg-error-container/30 border border-error/20 rounded-xl text-center">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-4 mb-6 text-sm text-primary bg-primary-fixed/20 border border-primary/20 rounded-xl text-center">
                {successMsg}
              </div>
            )}

            <div className="space-y-4">
              <Link
                href="/catalogo"
                className="block w-full bg-primary text-on-primary py-4 rounded-xl font-headline-sm text-headline-sm transition-transform active:scale-[0.98] hover:opacity-90 shadow-md text-center"
              >
                Explorar Catálogo
              </Link>
              
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full border-2 border-outline-variant text-on-surface-variant py-4 rounded-xl font-headline-sm text-headline-sm transition-all hover:bg-surface-container-low active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render Login / Sign Up Form State
  return (
    <div className="bg-surface text-on-surface artisanal-bg min-h-screen flex flex-col font-body-md lg:flex-row">
      
      {/* Form Side */}
      <main className="flex-grow flex items-center justify-center pb-12 px-margin-mobile py-12 lg:w-2/3">
        <div className="max-w-md w-full bg-white p-8 rounded-xl soft-elevation border border-surface-variant/30">
          
          {/* Back Home Link */}
          <div className="mb-4">
            <Link href="/" className="inline-flex items-center gap-1 text-primary hover:opacity-80 font-bold transition-all text-body-sm">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>

          {/* Branding/Heading */}
          <div className="text-center mb-8">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">
              {isSignUp ? 'Únete a Bordados Flores' : 'Inicia sesión'}
            </h1>
            <p className="font-body-md text-on-surface-variant">
              {isSignUp ? 'Vive el lujo de la auténtica artesanía boliviana.' : 'Descubre piezas textiles exclusivas con historia.'}
            </p>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-4 mb-6 text-sm text-error bg-error-container/30 border border-error/20 rounded-xl text-center">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-4 mb-6 text-sm text-primary bg-primary-fixed/20 border border-primary/20 rounded-xl text-center">
              {successMsg}
            </div>
          )}

          {/* Registration / Login Form */}
          <form className="space-y-6" onSubmit={handleEmailAuth}>
            
            {/* Full Name (Only on Sign Up) */}
            {isSignUp && (
              <div className="relative group">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider transition-colors" htmlFor="fullName">
                  Nombre Completo
                </label>
                <input
                  className="w-full bg-[#f5f5f5] border-t-0 border-x-0 border-b-2 border-outline-variant py-3 px-4 transition-colors focus:ring-0 focus:border-primary focus:outline-none"
                  id="fullName"
                  placeholder="Elena Flores"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Email */}
            <div className="relative group">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider transition-colors" htmlFor="email">
                Correo Electrónico
              </label>
              <input
                className="w-full bg-[#f5f5f5] border-t-0 border-x-0 border-b-2 border-outline-variant py-3 px-4 transition-colors focus:ring-0 focus:border-primary focus:outline-none"
                id="email"
                placeholder="elena@herencia.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider transition-colors" htmlFor="password">
                Contraseña
              </label>
              <input
                className="w-full bg-[#f5f5f5] border-t-0 border-x-0 border-b-2 border-outline-variant py-3 px-4 transition-colors focus:ring-0 focus:border-primary focus:outline-none"
                id="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm Password (Only on Sign Up) */}
            {isSignUp && (
              <div className="relative group">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider transition-colors" htmlFor="confirmPassword">
                  Confirmar Contraseña
                </label>
                <input
                  className="w-full bg-[#f5f5f5] border-t-0 border-x-0 border-b-2 border-outline-variant py-3 px-4 transition-colors focus:ring-0 focus:border-primary focus:outline-none"
                  id="confirmPassword"
                  placeholder="••••••••"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              className="w-full bg-primary-container text-on-primary py-4 rounded-xl font-headline-sm text-headline-sm transition-transform active:scale-[0.98] hover:opacity-90 shadow-md flex justify-center items-center gap-2 cursor-pointer disabled:opacity-75"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
              ) : isSignUp ? (
                'Crear Cuenta'
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-grow h-px bg-surface-variant"></div>
            <span className="px-4 font-label-md text-label-md text-on-surface-variant text-center uppercase whitespace-nowrap">
              O continúa con
            </span>
            <div className="flex-grow h-px bg-surface-variant"></div>
          </div>

          {/* Social Auth */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
              className="flex items-center justify-center gap-2 border-2 border-outline-variant py-3 rounded-xl hover:bg-surface-container-low transition-colors active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
              </svg>
              <span className="font-body-sm text-on-surface">Google</span>
            </button>
            
            <button
              onClick={() => handleOAuthSignIn('facebook')}
              disabled={loading}
              className="flex items-center justify-center gap-2 border-2 border-outline-variant py-3 rounded-xl hover:bg-surface-container-low transition-colors active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
              </svg>
              <span className="font-body-sm text-on-surface">Facebook</span>
            </button>
          </div>

          {/* Footer Navigation Toggle */}
          <div className="mt-10 text-center">
            <p className="font-body-sm text-on-surface-variant">
              {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-primary font-bold hover:underline ml-1 cursor-pointer bg-transparent border-none p-0 inline"
              >
                {isSignUp ? 'Inicia sesión aquí' : 'Regístrate aquí'}
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Decorative Side Content (Desktop Only) */}
      <div className="hidden lg:block w-1/3 bg-primary-container relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay bg-cover bg-center" 
          style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDD4pxKnFrBc57S3uRMWZU7s-swT6dOSteXLb9LRzTKjpOn30o1lMH-Y8FirFvVyDBWFCXVFYYhw71b0JVdt5D_m4q_a1HgkZG7W6z_mTzuGUEBdGhlbmY9IyikVACjoIhDU5pQrKh8-zGDLW0DhhVIex0s_hs_MPOFEK4hzGoLuPIWncWdDI2qpTn_3rtzlx4Deg3enn5uvyBiTYtLMXWD6Ytl0Ir3UP57kZl4oZ7A4wE0mPLFxoRdSmsfQnZXqY2bsOMqhqzLsQ')` }}
        ></div>
        <div className="h-full flex flex-col items-center justify-center text-on-primary p-12 text-center relative z-10">
          <Sparkles className="w-12 h-12 mb-6 text-white" />
          <h2 className="font-headline-xl text-headline-xl mb-4 leading-tight">Un Legado en Cada Hilo</h2>
          <p className="font-body-lg text-body-lg text-on-primary/80 leading-relaxed">
            Apoya a los artesanos locales y posee una pieza de la historia boliviana. Cada puntada cuenta una historia de generaciones.
          </p>
        </div>
      </div>
    </div>
  );
}
