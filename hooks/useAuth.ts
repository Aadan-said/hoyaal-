import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types/auth';

export function useAuth() {
  const { user, isAuthenticated } = useAuthStore();

  const hasRole = (role: UserRole) => {
    return user?.role === role;
  };



  const canManageUsers = () => {
    return user?.role === 'ADMIN';
  };


  const isSeeker = () => {
    return user?.role === 'SEEKER';
  };

  const canPostProperty = () => {
    return user?.role === 'OWNER' || user?.role === 'ADMIN';
  };

  return {
    user,
    isAuthenticated,
    hasRole,
    canManageUsers,
    isSeeker,
    canPostProperty,
  };
}
