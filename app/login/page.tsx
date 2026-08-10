'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { DEPARTAMENTOS } from '@/lib/constants';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { User } from '@supabase/supabase-js';
import { 
  ArrowLeft, 
  Sparkles, 
  Edit2, 
  ClipboardList, 
  HelpCircle, 
  LogOut, 
  ArrowRight, 
  User as UserIcon, 
  BookOpen, 
  Package, 
  MapPin, 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  Search,
  Phone,
  Camera,
  Loader2
} from 'lucide-react';

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

  // Profile management states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [profileActiveTab, setProfileActiveTab] = useState<'menu' | 'pedidos' | 'ayuda'>('menu');

  // User orders tracking states
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<any | null>(null);
  const [orderSearchError, setOrderSearchError] = useState<string | null>(null);
  const [searchingOrder, setSearchingOrder] = useState(false);
  const [expandedUserOrderId, setExpandedUserOrderId] = useState<string | null>(null);
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name: string; avatar_url: string } | null>(null);
  const [avatarImgError, setAvatarImgError] = useState(false);
  const [editAvatarImgError, setEditAvatarImgError] = useState(false);

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

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setUserProfile({
          full_name: data.full_name || '',
          avatar_url: data.avatar_url || ''
        });
      }
    } catch (err) {
      console.error('Error fetching database profile:', err);
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
          await fetchProfile(user.id);
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
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setCheckingAuth(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch orders from Supabase for this logged in user
  const fetchUserOrders = async (userId: string) => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUserOrders(data || []);
    } catch (err) {
      console.error('Error fetching user orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Sync edit profile values and load orders when user session is updated
  useEffect(() => {
    if (user) {
      setEditFullName(userProfile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '');
      setEditAvatarUrl(userProfile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || '');
      setAvatarImgError(false);
      setEditAvatarImgError(false);
      fetchUserOrders(user.id);
    } else {
      setUserOrders([]);
    }
  }, [user, userProfile]);

  // Set mounted on client load
  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPG/PNG).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert('La imagen es demasiado grande. El límite de tamaño es de 2MB.');
      return;
    }

    setUploadingFile(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (!user) throw new Error('No se encontró sesión de usuario activa.');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload file to Supabase storage avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setEditAvatarUrl(publicUrl);
      setSuccessMsg('Imagen de perfil cargada correctamente. Recuerda guardar los cambios para aplicarla.');
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setErrorMsg(err.message || 'Error al subir el archivo de imagen.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFullName.trim()) {
      setErrorMsg('El nombre completo no puede estar vacío.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Update Auth metadata
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: editFullName,
          avatar_url: editAvatarUrl
        }
      });

      if (authError) throw authError;

      // 2. Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: editFullName,
          avatar_url: editAvatarUrl
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      setSuccessMsg('¡Perfil actualizado correctamente!');
      
      setUserProfile({
        full_name: editFullName,
        avatar_url: editAvatarUrl
      });

      // Update local state user object
      if (authData.user) {
        setUser(authData.user);
      }
      setIsEditingProfile(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setErrorMsg(err.message || 'No se pudo actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchGuestOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryRef = orderSearchQuery.trim().replace('#', '');
    if (queryRef.length < 4) {
      setOrderSearchError('Ingresa al menos 4 caracteres de tu código de referencia.');
      setSearchedOrder(null);
      return;
    }

    setSearchingOrder(true);
    setOrderSearchError(null);
    setSearchedOrder(null);

    try {
      const { data, error } = await supabase.rpc('buscar_pedido_por_referencia', { ref_code: queryRef });
      if (error) throw error;

      if (data && data.length > 0) {
        setSearchedOrder(data[0]);
      } else {
        setOrderSearchError('No se encontró ningún pedido con esa referencia.');
      }
    } catch (err) {
      console.error('Error searching guest order:', err);
      setOrderSearchError('Error al consultar. Inténtalo de nuevo.');
    } finally {
      setSearchingOrder(false);
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

  if (!mounted || checkingAuth) {
    return (
      <div className="bg-surface text-on-surface artisanal-bg min-h-screen flex flex-col font-body-md">
        <Header />
        <main className="flex-grow flex items-center justify-center pb-24 px-margin-mobile pt-24 lg:pb-12 lg:pt-16">
          <div className="max-w-md w-full bg-[#ffffff] p-8 rounded-2xl soft-elevation border border-surface-variant/30 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-on-surface-variant text-sm font-semibold animate-pulse">Cargando perfil...</p>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Render Logged In Profile State
  if (user) {
    const rawAvatar = (userProfile?.avatar_url && userProfile.avatar_url.trim() !== '')
      ? userProfile.avatar_url
      : (user.user_metadata?.avatar_url || user.user_metadata?.picture || '');
    const userAvatar = avatarImgError ? '' : rawAvatar;
    const displayName = userProfile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Artesano';
    const provider = user.app_metadata?.provider || 'correo electrónico';

    // Help Center FAQ Content
    const faqItems = [
      {
        q: '¿Cómo realizo el pago de mi pedido?',
        a: 'El pago se coordina directamente por WhatsApp. Al enviar tu cesta, recibiremos tu pedido y te facilitaremos un código QR o número de cuenta bancaria para realizar transferencia bancaria o depósito.'
      },
      {
        q: '¿Puedo dejar un adelanto y pagar el resto al recibir?',
        a: 'Sí, para prendas personalizadas o hechas "A Pedido" (como las polleras), puedes abonar un adelanto (generalmente el 50%) para que iniciemos la confección. El saldo restante se cancela una vez que la prenda esté totalmente terminada y lista para entrega.'
      },
      {
        q: '¿Hacen envíos a otros departamentos?',
        a: 'Hacemos envíos rápidos a toda Bolivia (La Paz, Cochabamba, Santa Cruz, Potosí, Chuquisaca, Tarija, Beni, Pando) por transporte terrestre coordinado. Si te encuentras en Oruro, puedes recoger tu pedido gratis directamente en nuestra tienda.'
      },
      {
        q: '¿Cuánto demora la confección de prendas "A Pedido"?',
        a: 'Las prendas "En Stock" se despachan de forma inmediata. Las prendas "A Pedido" (personalizadas a tu medida) demoran entre 10 a 20 días en nuestro taller artesanal para garantizar un bordado de máxima calidad.'
      },
      {
        q: '¿Cómo puedo medir mi cintura y largo para una pollera?',
        a: 'Con una cinta métrica, mide la cintura justo a la altura donde te colocas la pollera. Para el largo, mide desde la cintura hasta la parte media de la pantorrilla (o la altura deseada). Si tienes dudas, escríbenos por WhatsApp y te guiaremos paso a paso.'
      }
    ];

    const getShippingLabel = (shippingDest: string, customLoc: string | null) => {
      const dept = DEPARTAMENTOS.find(d => d.id === shippingDest);
      if (shippingDest === 'otro') {
        return customLoc || 'Otro Lugar (No especificado)';
      }
      return dept ? dept.name : shippingDest;
    };

    const orderStatuses: Record<string, string> = {
      pendiente: 'Pendiente',
      pagado: 'Confirmado',
      en_confeccion: 'En Taller',
      enviado: 'Enviado',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    };

    const orderStatusColors: Record<string, string> = {
      pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
      pagado: 'bg-blue-50 text-blue-700 border-blue-200',
      en_confeccion: 'bg-purple-50 text-purple-700 border-purple-200',
      enviado: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      entregado: 'bg-green-50 text-green-700 border-green-200',
      cancelado: 'bg-red-50 text-red-700 border-red-200'
    };

    const orderStatusDetails = {
      pendiente: {
        label: 'Pendiente de Pago',
        description: 'Hemos recibido la solicitud de tu pedido. Coordinaremos la seña o pago por WhatsApp.'
      },
      pagado: {
        label: 'Pago Confirmado',
        description: 'Tu depósito o adelanto ha sido confirmado. El pedido está listo para ingresar al taller.'
      },
      en_confeccion: {
        label: 'En Taller / Confección',
        description: 'Nuestros artesanos están bordando y confeccionando tus prendas a mano.'
      },
      enviado: {
        label: 'Enviado / En Camino',
        description: 'Tu paquete ha sido despachado y está en viaje hacia tu destino.'
      },
      entregado: {
        label: 'Pedido Entregado',
        description: 'Gracias por valorar el arte y cultura boliviana. ¡Disfruta tu prenda!'
      },
      cancelado: {
        label: 'Pedido Cancelado',
        description: 'Este pedido ha sido cancelado de nuestro sistema.'
      }
    };

    return (
      <div className="bg-surface text-on-surface artisanal-bg min-h-screen flex flex-col font-body-md">
        <Header />
        <main className="flex-grow flex items-center justify-center pb-24 px-margin-mobile pt-24 lg:pb-12 lg:pt-16">
          <div className="max-w-md w-full bg-white p-6 md:p-8 rounded-2xl soft-elevation border border-surface-variant/30 text-center relative">
            
            {/* Header title */}
            <h1 className="font-headline-lg text-headline-lg text-primary mb-5">Mi Perfil</h1>

            {/* Persistent Tab Navigation Header */}
            <div className="flex border-b border-outline-variant/20 mb-6">
              {[
                { id: 'menu', label: 'Mi Cuenta' },
                { id: 'pedidos', label: 'Mis Pedidos' },
                { id: 'ayuda', label: 'Centro de Ayuda' }
              ].map((tab) => {
                const isActive = profileActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setProfileActiveTab(tab.id as any);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`flex-grow pb-2.5 text-xs font-bold transition-all cursor-pointer border-b-2 text-center -mb-[1px] ${
                      isActive 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-on-surface-variant hover:text-primary/70'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Error & Success Messages */}
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

            {/* TAB VIEWS */}
            <div className="min-h-[480px] flex flex-col justify-between text-left">
              <div>
                {/* 1. Account Details Tab */}
                {profileActiveTab === 'menu' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        {userAvatar ? (
                          <img
                            src={userAvatar}
                            alt={displayName}
                            className="w-24 h-24 rounded-full border-4 border-primary/20 object-cover shadow-md"
                            referrerPolicy="no-referrer"
                            onError={() => setAvatarImgError(true)}
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-4xl shadow-md uppercase">
                            {displayName.charAt(0)}
                          </div>
                        )}
                        {/* Floating Edit Pencil Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditFullName(displayName);
                            setEditAvatarUrl(userAvatar || '');
                            setIsEditingProfile(true);
                            setErrorMsg(null);
                            setSuccessMsg(null);
                          }}
                          className="absolute bottom-0 right-0 p-2 bg-primary text-on-primary rounded-full hover:bg-primary-container transition-all active:scale-90 shadow-md cursor-pointer border-2 border-white flex items-center justify-center"
                          title="Editar Perfil"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div>
                        <h2 className="font-headline-md text-headline-md text-on-surface">{displayName}</h2>
                        <p className="text-on-surface-variant text-body-md">{user.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant capitalize">
                          Conectado con {provider}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <Link
                        href="/catalogo"
                        className="w-full h-12 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer hover:opacity-90 shadow-md text-sm"
                      >
                        <BookOpen className="w-4 h-4" />
                        Explorar Catálogo
                      </Link>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={loading}
                        className="w-full h-12 border-2 border-red-200 text-red-500 hover:bg-red-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        {loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. User Orders Subpage */}
                {profileActiveTab === 'pedidos' && (
                  <div className="space-y-5 text-left animate-fade-in">
                    {loadingOrders ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs text-on-surface-variant">Cargando tus pedidos...</p>
                      </div>
                    ) : userOrders.length === 0 ? (
                      <div className="text-center py-6 bg-surface rounded-2xl border border-outline-variant/20 p-4">
                        <Package className="w-8 h-8 mx-auto text-outline mb-2" />
                        <p className="text-xs text-on-surface-variant font-semibold">No tienes pedidos registrados con esta cuenta.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 no-scrollbar">
                        {userOrders.map((ord) => {
                          const isExpanded = expandedUserOrderId === ord.id;
                          const statusInfo = orderStatusDetails[ord.status as keyof typeof orderStatusDetails];
                          return (
                            <div key={ord.id} className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-lowest">
                              <div 
                                onClick={() => setExpandedUserOrderId(isExpanded ? null : ord.id)}
                                className="p-3.5 flex justify-between items-center cursor-pointer hover:bg-surface/30 select-none"
                              >
                                <div>
                                  <span className="font-mono text-xs font-bold text-primary block">#{ord.id.substring(0, 8)}</span>
                                  <span className="text-[10px] text-on-surface-variant">
                                    {new Date(ord.created_at).toLocaleDateString('es-BO')}
                                  </span>
                                </div>
                                <div className="text-right flex items-center gap-2">
                                  <div className="mr-2">
                                    <span className="text-[10px] text-on-surface-variant block">{ord.items.length} prendas</span>
                                    <span className="text-xs font-bold text-on-surface">{formatCurrency(ord.total, true)}</span>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${orderStatusColors[ord.status]}`}>
                                    {orderStatuses[ord.status]}
                                  </span>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="p-3.5 border-t border-outline-variant/10 bg-surface/20 space-y-3 text-xs">
                                  <div className="space-y-1">
                                    <span className="text-[9px] uppercase font-bold text-on-surface-variant block">Estado del Pedido</span>
                                    <p className="font-bold text-on-surface">{statusInfo?.label}</p>
                                    <p className="text-[10px] text-on-surface-variant leading-tight">{statusInfo?.description}</p>
                                  </div>

                                  <div className="space-y-1 border-t border-outline-variant/10 pt-2">
                                    <div className="flex justify-between">
                                      <span className="text-on-surface-variant text-[10px]">Total:</span>
                                      <span className="font-semibold">{formatCurrency(ord.total, true)}</span>
                                    </div>
                                    <div className="flex justify-between text-green-700 font-medium">
                                      <span className="text-[10px]">Adelanto recibido:</span>
                                      <span className="font-bold">{formatCurrency(ord.monto_adelanto || 0, true)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-outline-variant/10 pt-1 font-bold">
                                      <span>Saldo Pendiente:</span>
                                      <span className={ord.saldo_pendiente > 0 ? "text-amber-600" : "text-green-600"}>
                                        {formatCurrency(ord.saldo_pendiente, true)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="pt-1 flex gap-2">
                                    <Link
                                      href={`/pedidos?ref=${ord.id.substring(0, 8)}`}
                                      className="flex-grow py-2 bg-primary text-on-primary text-center font-bold rounded-lg text-[10px] hover:opacity-90 active:scale-95 transition-all"
                                    >
                                      Detalles y Seguimiento
                                    </Link>
                                    <a
                                      href={`https://wa.me/59171182580?text=${encodeURIComponent(
                                        `Hola, me gustaría coordinar el saldo/entrega de mi pedido #${ord.id.substring(0, 8)}.`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center rounded-lg active:scale-95 transition-all cursor-pointer"
                                      title="Coordinar en WhatsApp"
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Tracking search for guest checkouts */}
                    <div className="border-t border-outline-variant/15 pt-4 space-y-3">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-on-surface-variant block">¿Pediste como invitado?</span>
                      
                      <form onSubmit={handleSearchGuestOrder} className="flex gap-2">
                        <div className="relative flex-grow">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-3.5 h-3.5" />
                          <input
                            type="text"
                            value={orderSearchQuery}
                            onChange={(e) => setOrderSearchQuery(e.target.value)}
                            placeholder="Código de referencia (ej: e3b8a1c9)"
                            className="w-full h-9 pl-9 pr-3 bg-surface rounded-lg border border-outline-variant focus:border-primary text-xs outline-none uppercase font-mono tracking-wider"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={searchingOrder}
                          className="h-9 px-3 bg-primary text-on-primary text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer active:scale-95 transition-all flex items-center justify-center shrink-0"
                        >
                          {searchingOrder ? '...' : 'Buscar'}
                        </button>
                      </form>

                      {orderSearchError && (
                        <p className="text-[10px] text-error font-medium">{orderSearchError}</p>
                      )}

                      {searchedOrder && (
                        <div className="p-3 bg-green-50/50 border border-green-200/50 rounded-xl space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="font-bold text-on-surface text-[11px]">Pedido #{searchedOrder.id.substring(0, 8)}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${orderStatusColors[searchedOrder.status]}`}>
                              {orderStatuses[searchedOrder.status]}
                            </span>
                          </div>
                          <p className="text-[10px] text-on-surface-variant leading-tight">{orderStatusDetails[searchedOrder.status as keyof typeof orderStatusDetails]?.description}</p>
                          <div className="flex justify-between border-t border-outline-variant/10 pt-1.5">
                            <span className="font-semibold text-on-surface-variant text-[10px]">Saldo Restante:</span>
                            <span className={searchedOrder.saldo_pendiente > 0 ? "font-bold text-amber-600" : "font-bold text-green-600"}>
                              {formatCurrency(searchedOrder.saldo_pendiente, true)}
                            </span>
                          </div>
                          <Link
                            href={`/pedidos?ref=${searchedOrder.id.substring(0, 8)}`}
                            className="block w-full py-1.5 bg-primary text-on-primary text-center font-bold rounded-md text-[10px] hover:opacity-90 active:scale-95 transition-all mt-1"
                          >
                            Ver Detalles y Timeline
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Help Center (FAQ) Subpage */}
                {profileActiveTab === 'ayuda' && (
                  <div className="space-y-4 text-left animate-fade-in">
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                      {faqItems.map((faq, idx) => {
                        const isOpen = activeFaqIdx === idx;
                        return (
                          <div key={idx} className="border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-lowest shadow-2xs">
                            <button
                              type="button"
                              onClick={() => setActiveFaqIdx(isOpen ? null : idx)}
                              className="w-full p-4 flex justify-between items-center text-left font-bold text-xs text-on-surface hover:bg-surface/30 select-none cursor-pointer"
                            >
                              <span className="pr-2">{faq.q}</span>
                              {isOpen ? <ChevronUp className="w-4 h-4 text-outline shrink-0" /> : <ChevronDown className="w-4 h-4 text-outline shrink-0" />}
                            </button>
                            {isOpen && (
                              <div className="p-4 border-t border-outline-variant/10 bg-surface/10 text-xs text-on-surface-variant leading-relaxed">
                                {faq.a}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* EDIT PROFILE MODAL DIALOG OVERLAY */}
            {isEditingProfile && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
                <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-outline-variant/30 shadow-2xl space-y-6 animate-fade-in text-left">
                  <h3 className="font-headline-sm text-lg font-bold text-primary flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-primary" />
                    Editar Perfil
                  </h3>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    {/* Avatar Preview & Upload Area */}
                    <div className="flex flex-col items-center gap-3 p-4 bg-surface rounded-2xl border border-outline-variant/30">
                      <div className="relative">
                        {editAvatarUrl && !editAvatarImgError ? (
                          <img
                            src={editAvatarUrl}
                            alt="Vista previa de avatar"
                            className="w-20 h-20 rounded-full object-cover border-2 border-primary/20 shadow"
                            referrerPolicy="no-referrer"
                            onError={() => setEditAvatarImgError(true)}
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl uppercase">
                            {editFullName ? editFullName.charAt(0) : 'U'}
                          </div>
                        )}
                        
                        {uploadingFile && (
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                      </div>

                      <label 
                        htmlFor="avatar-file-input"
                        className="px-4 py-2 bg-white border border-outline hover:bg-surface-container text-on-surface-variant font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-2xs"
                      >
                        <Camera className="w-4 h-4 text-primary" />
                        {uploadingFile ? 'Subiendo...' : 'Subir foto desde dispositivo'}
                      </label>
                      <input
                        type="file"
                        id="avatar-file-input"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploadingFile}
                      />
                      <p className="text-[10px] text-on-surface-variant/60">Límite de tamaño: 2MB (JPG, PNG)</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Nombre Completo</label>
                      <input
                        type="text"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-body-md text-sm"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">O pega un enlace de imagen alternativo (URL)</label>
                      <input
                        type="url"
                        value={editAvatarUrl}
                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                        placeholder="https://ejemplo.com/foto.jpg"
                        className="w-full h-9 px-3 bg-surface rounded-xl border border-outline-variant/60 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-body-md text-xs"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={loading || uploadingFile}
                        className="flex-grow h-11 bg-primary text-on-primary font-bold rounded-xl active:scale-[0.98] hover:opacity-90 shadow-md text-sm transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
                      >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 h-11 border-2 border-outline-variant text-on-surface-variant font-semibold rounded-xl hover:bg-surface-container-low transition-all cursor-pointer text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Render Login / Sign Up Form State
  return (
    <div className="bg-surface text-on-surface artisanal-bg min-h-screen flex flex-col font-body-md">
      <Header />
      <div className="flex-grow flex flex-col lg:flex-row pt-20 pb-20 lg:pb-0">
        
        {/* Form Side */}
        <main className="flex-grow flex items-center justify-center pb-12 px-margin-mobile py-12 lg:w-2/3">
          <div className="max-w-md w-full bg-white p-8 rounded-xl soft-elevation border border-surface-variant/30">

            {/* Branding/Heading */}
            <div className="text-center mb-8">
              <h1 className="font-headline-lg text-headline-lg text-primary mb-2">
                {isSignUp ? 'Únete a Bordados Flores' : 'Inicia sesión'}
              </h1>
              <p className="font-body-md text-on-surface-variant">
                {isSignUp ? 'Vive el lujo de la auténtica artesanía boliviana.' : 'Descubre piezas textiles exclusivas.'}
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
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider transition-colors group-focus-within:text-primary" htmlFor="fullName">
                    Nombre Completo
                  </label>
                  <input
                    className="w-full bg-[#f5f5f5] border-t-0 border-x-0 border-b-2 border-outline-variant py-3 px-4 transition-colors focus:ring-0 focus:border-primary focus:outline-none text-sm"
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
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider transition-colors group-focus-within:text-primary" htmlFor="email">
                  Correo Electrónico
                </label>
                <input
                  className="w-full bg-[#f5f5f5] border-t-0 border-x-0 border-b-2 border-outline-variant py-3 px-4 transition-colors focus:ring-0 focus:border-primary focus:outline-none text-sm"
                  id="email"
                  placeholder="usuario@gmail.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="relative group">
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider transition-colors group-focus-within:text-primary" htmlFor="password">
                  Contraseña
                </label>
                <input
                  className="w-full bg-[#f5f5f5] border-t-0 border-x-0 border-b-2 border-outline-variant py-3 px-4 transition-colors focus:ring-0 focus:border-primary focus:outline-none text-sm"
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
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider transition-colors group-focus-within:text-primary" htmlFor="confirmPassword">
                    Confirmar Contraseña
                  </label>
                  <input
                    className="w-full bg-[#f5f5f5] border-t-0 border-x-0 border-b-2 border-outline-variant py-3 px-4 transition-colors focus:ring-0 focus:border-primary focus:outline-none text-sm"
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
            <div className="grid grid-cols-1 gap-4">
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
      <BottomNav />
    </div>
  );
}
