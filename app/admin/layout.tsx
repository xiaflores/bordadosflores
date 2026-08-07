'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { 
  LayoutGrid, 
  X, 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  ShoppingCart, 
  BarChart3, 
  Plus, 
  Store, 
  LogOut, 
  Menu, 
  Search, 
  Bell, 
  HelpCircle,
  Sparkles,
  Users
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string } | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (user) {
      const getProfile = async () => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .maybeSingle();
          if (data) {
            setProfile({
              full_name: data.full_name || '',
              avatar_url: data.avatar_url || ''
            });
          }
        } catch (err) {
          console.error('Error loading admin profile:', err);
        }
      };
      getProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  useEffect(() => {
    setAvatarError(false);
  }, [user, profile]);
  
  // Sidebar states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarActive, setMobileSidebarActive] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirigir al login si no hay usuario
        router.push('/login');
      } else {
        setUser(user);
      }
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        router.push('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleSidebar = () => {
    if (window.innerWidth > 1024) {
      setSidebarCollapsed(!sidebarCollapsed);
    } else {
      setMobileSidebarActive(!mobileSidebarActive);
    }
  };

  // Close mobile sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMobileSidebarActive(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar on route changes
  useEffect(() => {
    setMobileSidebarActive(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface artisanal-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant font-body-md animate-pulse">Verificando credenciales...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Administrador';
  const rawAvatar = (profile?.avatar_url && profile.avatar_url.trim() !== '')
    ? profile.avatar_url
    : (user.user_metadata?.avatar_url || user.user_metadata?.picture || '');
  const userAvatar = avatarError ? '' : rawAvatar;

  return (
    <div className={`min-h-screen bg-surface-container-low text-on-surface font-manrope transition-all duration-300 ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      
      {/* Mobile Drawer Overlay */}
      {mobileSidebarActive && (
        <div
          className="fixed inset-0 bg-black/40 z-45 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileSidebarActive(false)}
        />
      )}

      {/* Side Navigation Bar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white shadow-sm flex flex-col py-8 px-4 z-50 transition-all duration-300 border-r border-outline-variant/30 w-64 ${
          mobileSidebarActive
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Details */}
        <div className="mb-10 px-2 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
              <LayoutGrid className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="brand-details whitespace-nowrap animate-fade-in">
                <h1 className="font-manrope text-headline-sm font-bold text-primary leading-tight">Bordados Flores</h1>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Admin Console</p>
              </div>
            )}
          </div>
          {mobileSidebarActive && (
            <button
              onClick={() => setMobileSidebarActive(false)}
              className="p-2 text-on-surface-variant hover:text-primary transition-colors lg:hidden flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-grow space-y-1 overflow-x-hidden">
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              pathname === '/admin'
                ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" fill={pathname === '/admin' ? 'currentColor' : 'none'} />
            {!sidebarCollapsed && <span className="font-beVietnamPro text-body-md">Dashboard</span>}
          </Link>

          <Link
            href="/admin/productos"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              pathname.startsWith('/admin/productos')
                ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
            }`}
          >
            <Package className="w-5 h-5 shrink-0" fill={pathname.startsWith('/admin/productos') ? 'currentColor' : 'none'} />
            {!sidebarCollapsed && <span className="font-beVietnamPro text-body-md">Productos</span>}
          </Link>

          <Link
            href="/admin/home"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              pathname.startsWith('/admin/home')
                ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
            }`}
          >
            <Sparkles className="w-5 h-5 shrink-0" fill={pathname.startsWith('/admin/home') ? 'currentColor' : 'none'} />
            {!sidebarCollapsed && <span className="font-beVietnamPro text-body-md">Contenido Home</span>}
          </Link>

          <Link
            href="/admin/usuarios"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              pathname.startsWith('/admin/usuarios')
                ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
            }`}
          >
            <Users className="w-5 h-5 shrink-0" fill={pathname.startsWith('/admin/usuarios') ? 'currentColor' : 'none'} />
            {!sidebarCollapsed && <span className="font-beVietnamPro text-body-md">Usuarios</span>}
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all"
          >
            <ClipboardList className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span className="font-beVietnamPro text-body-md">Inventario</span>}
          </Link>

          <Link
            href="/admin/pedidos"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              pathname.startsWith('/admin/pedidos')
                ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
            }`}
          >
            <ShoppingCart className="w-5 h-5 shrink-0" fill={pathname.startsWith('/admin/pedidos') ? 'currentColor' : 'none'} />
            {!sidebarCollapsed && <span className="font-beVietnamPro text-body-md">Pedidos</span>}
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all"
          >
            <BarChart3 className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span className="font-beVietnamPro text-body-md">Estadísticas</span>}
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-auto space-y-1 border-t border-surface-container-highest pt-6">
          <Link
            href="/admin/productos/nuevo"
            className={`w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all active:scale-95 shadow-lg shadow-primary/20 ${
              sidebarCollapsed ? 'px-0' : 'px-4'
            }`}
          >
            <Plus className="w-4 h-4" />
            {!sidebarCollapsed && <span className="text-label-md">Añadir Producto</span>}
          </Link>

          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
          >
            <Store className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span className="font-beVietnamPro text-body-md">Ver Tienda</span>}
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/10 transition-colors text-left"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span className="font-beVietnamPro text-body-md">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area wrapper */}
      <div className={`transition-all duration-300 min-h-screen flex flex-col ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        
        {/* Top Header */}
        <header className="h-16 bg-white/85 backdrop-blur-md sticky top-0 px-4 md:px-8 flex items-center justify-between z-40 border-b border-surface-container-highest/50">
          <div className="flex items-center gap-4 flex-grow max-w-md">
            <button
              onClick={toggleSidebar}
              className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1 hidden md:block">
              <div className="relative group">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-body-sm focus:ring-2 focus:ring-primary/20 transition-all focus:bg-white"
                  placeholder="Buscar pedidos, productos..."
                  type="text"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6 shrink-0">
            <button className="text-on-surface-variant hover:text-primary transition-colors relative cursor-pointer flex items-center justify-center">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full"></span>
            </button>
            <button className="hidden sm:block text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-surface-container-highest">
              <div className="text-right hidden sm:block">
                <p className="text-label-md font-bold text-on-surface">{displayName}</p>
                <p className="text-[10px] text-on-surface-variant font-semibold uppercase tracking-wider">Administrador</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container border border-surface-container-highest shadow-inner">
                {userAvatar ? (
                  <img
                    alt={displayName}
                    className="w-full h-full object-cover"
                    src={userAvatar}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold uppercase">
                    {displayName.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
}
