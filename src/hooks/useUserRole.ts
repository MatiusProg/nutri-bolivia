import { useMemo, useCallback } from 'react';
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
    staleTime: 5 * 60 * 1000,
  });

  // Valores memoizados (no funciones) para evitar re-renders infinitos
  const isAdmin = useMemo(() => 
    roles?.some(r => r.role === 'admin') || false, 
    [roles]
  );
  
  const isModerador = useMemo(() => 
    roles?.some(r => r.role === 'moderador') || false, 
    [roles]
  );
  
  const isStaff = useMemo(() => 
    isAdmin || isModerador, 
    [isAdmin, isModerador]
  );

  // hasRole sigue siendo función porque recibe parámetro
  const hasRole = useCallback((role: AppRole): boolean => {
    return roles?.some(r => r.role === role) || false;
  }, [roles]);

  return {
    roles,
    isLoading,
    hasRole,
    isAdmin,      // booleano
    isModerador,  // booleano
    isStaff,      // booleano
  };
}
