import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client-unsafe';
import { useAuth } from '@/hooks/useAuth';

type AppRole = 'admin' | 'moderador';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  granted_at: string;
}

export function useUserRole() {
  const { user } = useAuth();

  const { data: roles, isLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return (data || []) as UserRole[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });

  const hasRole = (role: AppRole): boolean => {
    return roles?.some(r => r.role === role) || false;
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isModerador = (): boolean => hasRole('moderador');
  const isStaff = (): boolean => isAdmin() || isModerador();

  return {
    roles,
    isLoading,
    hasRole,
    isAdmin,
    isModerador,
    isStaff,
  };
}
