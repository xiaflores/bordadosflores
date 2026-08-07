'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  UserCircle,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: 'user' | 'admin';
  created_at: string;
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Role update feedback
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    userId: string;
    userName: string;
    currentRole: string;
    newRole: string;
  } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentAdminId(user.id);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, role, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setUsers(data as UserProfile[]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleRoleChange = (userId: string, userName: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    // Prevent self-demotion
    if (userId === currentAdminId && newRole !== 'admin') {
      showToast('No puedes remover tu propio rol de administrador.', 'error');
      return;
    }

    setConfirmModal({ userId, userName, currentRole, newRole });
  };

  const confirmRoleUpdate = async () => {
    if (!confirmModal) return;

    // Save modal data before clearing
    const { userId, newRole, currentRole: previousRole, userName } = confirmModal;
    setConfirmModal(null);
    setUpdatingUserId(userId);

    // Optimistic update
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, role: newRole as 'user' | 'admin' } : u))
    );

    try {
      // Get the access token - try getSession first, fallback to cookie
      let accessToken: string | undefined;
      
      const { data: { session } } = await supabase.auth.getSession();
      accessToken = session?.access_token;
      
      // Fallback: read from cookie if getSession didn't return a token
      if (!accessToken && typeof document !== 'undefined') {
        const cookieMatch = document.cookie.match(/sb-access-token=([^;]+)/);
        accessToken = cookieMatch?.[1];
      }

      if (!accessToken) {
        throw new Error('No hay sesión activa. Intenta cerrar sesión e iniciar de nuevo.');
      }

      console.log('[Admin] Updating role for user:', userId, 'to:', newRole);

      const response = await fetch('/api/admin/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ userId, newRole })
      });

      const result = await response.json();
      console.log('[Admin] API Response:', response.status, result);

      if (!response.ok) {
        throw new Error(result.error || `Error del servidor (${response.status}).`);
      }

      showToast(
        `Rol de "${userName}" actualizado a "${newRole}" correctamente.`,
        'success'
      );
    } catch (err: any) {
      console.error('[Admin] Error updating role:', err);
      // Revert optimistic update
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: previousRole as 'user' | 'admin' } : u))
      );
      showToast(err.message || 'Error al actualizar el rol.', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Stats
  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant font-semibold">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-container-max mx-auto space-y-8 flex-grow flex flex-col">

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-sm animate-slide-in-right ${
            toast.type === 'success'
              ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
              : 'bg-red-50/95 border-red-200 text-red-800'
          }`}
          style={{
            animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="text-sm font-semibold max-w-xs">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 p-1 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
          >
            <XCircle className="w-4 h-4 opacity-50" />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-6"
            style={{ animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                confirmModal.newRole === 'admin' ? 'bg-amber-100' : 'bg-blue-100'
              }`}>
                {confirmModal.newRole === 'admin' ? (
                  <ShieldCheck className="w-6 h-6 text-amber-600" />
                ) : (
                  <Shield className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-on-surface">Confirmar cambio de rol</h3>
                <p className="text-sm text-on-surface-variant">Esta acción modifica los permisos del usuario.</p>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant font-medium">Usuario:</span>
                <span className="text-sm font-bold text-on-surface">{confirmModal.userName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant font-medium">Rol actual:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  confirmModal.currentRole === 'admin'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {confirmModal.currentRole}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant font-medium">Nuevo rol:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  confirmModal.newRole === 'admin'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {confirmModal.newRole}
                </span>
              </div>
            </div>

            {confirmModal.newRole === 'admin' && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-amber-800">
                  Al otorgar rol de administrador, este usuario tendrá acceso completo al panel de administración, 
                  incluyendo gestión de productos, pedidos, contenido y otros usuarios.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-6 py-3 bg-surface-container-low text-on-surface-variant rounded-xl font-bold hover:bg-surface-container-high transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRoleUpdate}
                className={`flex-1 px-6 py-3 text-white rounded-xl font-bold transition-all cursor-pointer active:scale-95 ${
                  confirmModal.newRole === 'admin'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-600/20'
                    : 'bg-primary hover:opacity-90 shadow-lg shadow-primary/20'
                }`}
              >
                Confirmar cambio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-on-surface mb-2">Gestión de Usuarios</h3>
          <p className="text-sm md:text-base text-on-surface-variant">Administra los roles y permisos de los usuarios registrados.</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-6 py-3 bg-surface-container-low text-on-surface-variant rounded-xl font-bold hover:bg-surface-container-high transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-outline-variant/10 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-on-surface">{users.length}</p>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Usuarios</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-outline-variant/10 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-on-surface">{adminCount}</p>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Administradores</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-outline-variant/10 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-on-surface">{userCount}</p>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Usuarios Regulares</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-outline-variant/10 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full bg-surface-container-low border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all focus:bg-white focus:outline-none"
            placeholder="Buscar por nombre, correo electrónico o rol..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <section className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden flex-grow flex flex-col justify-between">

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/30 border-b border-outline-variant/20">
                <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant">Usuario</th>
                <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant">Correo Electrónico</th>
                <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant">Rol Actual</th>
                <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant">Fecha de Registro</th>
                <th className="px-6 py-5 text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant text-center">Cambiar Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {currentItems.length > 0 ? (
                currentItems.map((user) => {
                  const isSelf = user.id === currentAdminId;
                  const isUpdating = updatingUserId === user.id;
                  return (
                    <tr key={user.id} className="hover:bg-surface-container-low/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container border border-outline-variant/20 shadow-inner shrink-0">
                            {user.avatar_url ? (
                              <img
                                alt={user.full_name || 'Avatar'}
                                className="w-full h-full object-cover"
                                src={user.avatar_url}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                                {(user.full_name || user.email || '?')[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-on-surface leading-snug flex items-center gap-2">
                              {user.full_name || 'Sin nombre'}
                              {isSelf && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-extrabold rounded-full uppercase">Tú</span>
                              )}
                            </div>
                            <div className="text-xs text-on-surface-variant font-mono">{user.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-on-surface">
                          <Mail className="w-4 h-4 text-on-surface-variant shrink-0" />
                          <span className="truncate max-w-[200px]">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          user.role === 'admin'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role === 'admin' ? (
                            <ShieldCheck className="w-3 h-3" />
                          ) : (
                            <Shield className="w-3 h-3" />
                          )}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                          <Calendar className="w-4 h-4 shrink-0" />
                          {formatDate(user.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleRoleChange(user.id, user.full_name || user.email, user.role)}
                            disabled={isUpdating || isSelf}
                            className={`relative inline-flex h-7 w-[52px] shrink-0 rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none ${
                              isUpdating ? 'opacity-50 cursor-wait' : isSelf ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                            } ${
                              user.role === 'admin' ? 'bg-amber-500' : 'bg-surface-container-highest'
                            }`}
                            title={
                              isSelf
                                ? 'No puedes cambiar tu propio rol'
                                : `Cambiar a ${user.role === 'admin' ? 'usuario' : 'admin'}`
                            }
                          >
                            {isUpdating ? (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              </span>
                            ) : (
                              <span
                                className={`pointer-events-none inline-block h-[22px] w-[22px] transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                                  user.role === 'admin' ? 'translate-x-[26px]' : 'translate-x-[1px]'
                                } mt-[1px]`}
                              />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-on-surface-variant font-medium">
                    No se encontraron usuarios con ese criterio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="lg:hidden divide-y divide-outline-variant/10">
          {currentItems.length > 0 ? (
            currentItems.map((user) => {
              const isSelf = user.id === currentAdminId;
              const isUpdating = updatingUserId === user.id;
              return (
                <div key={user.id} className="p-5 hover:bg-surface-container-low/20 transition-colors">
                  <div className="flex gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-container border border-outline-variant/20 shrink-0 shadow-inner">
                      {user.avatar_url ? (
                        <img
                          alt={user.full_name || 'Avatar'}
                          className="w-full h-full object-cover"
                          src={user.avatar_url}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                          {(user.full_name || user.email || '?')[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-on-surface text-base truncate">
                          {user.full_name || 'Sin nombre'}
                        </h4>
                        {isSelf && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-extrabold rounded-full uppercase shrink-0">Tú</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-1">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <Calendar className="w-3 h-3" />
                        {formatDate(user.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      user.role === 'admin'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'admin' ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <Shield className="w-3 h-3" />
                      )}
                      {user.role}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                        {user.role === 'admin' ? 'Admin' : 'Usuario'}
                      </span>
                      <button
                        onClick={() => handleRoleChange(user.id, user.full_name || user.email, user.role)}
                        disabled={isUpdating || isSelf}
                        className={`relative inline-flex h-5 w-10 shrink-0 rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none ${
                          isUpdating ? 'opacity-50 cursor-wait' : isSelf ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                        } ${
                          user.role === 'admin' ? 'bg-amber-500' : 'bg-surface-container-highest'
                        }`}
                        title={
                          isSelf
                            ? 'No puedes cambiar tu propio rol'
                            : `Cambiar a ${user.role === 'admin' ? 'usuario' : 'admin'}`
                        }
                      >
                        {isUpdating ? (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          </span>
                        ) : (
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out ${
                              user.role === 'admin' ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-on-surface-variant font-medium">
              No se encontraron usuarios con ese criterio.
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-6 border-t border-outline-variant/20 flex flex-col md:flex-row items-center justify-between bg-surface-container-low/10 gap-4">
          <span className="text-sm font-medium text-on-surface-variant order-2 md:order-1">
            Mostrando <span className="text-on-surface font-bold">{currentItems.length}</span> de <span className="text-on-surface font-bold">{totalItems}</span> usuarios
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 order-1 md:order-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 flex flex-col sm:flex-row justify-between items-center border-t border-outline-variant/15 text-xs md:text-sm text-on-surface-variant/70 gap-4">
        <div className="text-primary font-extrabold text-base">Bordados Flores</div>
        <div>© 2026 Bordados Flores. Todos los derechos reservados.</div>
      </footer>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
