import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types/auth';

export function useAuth() {
  const { user, isAuthenticated } = useAuthStore();

  const hasRole = (role: UserRole) => {
    return user?.role === role;
  };

  const canPostProperty = () => {
    return user?.role === 'OWNER' || user?.role === 'AGENT' || user?.role === 'ADMIN';
  };

  const canManageUsers = () => {
    return user?.role === 'ADMIN';
  };

  const isOwnerOrAgent = () => {
    return user?.role === 'OWNER' || user?.role === 'AGENT';
  };

  const isSeeker = () => {
    return user?.role === 'SEEKER';
  };

  return {
    user,
    isAuthenticated,
    hasRole,
    canPostProperty,
    canManageUsers,
    isOwnerOrAgent,
    isSeeker,
  };
}
