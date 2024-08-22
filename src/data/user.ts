import { useQuery } from '@tanstack/vue-query';
import { useAuth } from 'src/stores/auth.store';
import { User } from 'src/types/user';
import { API_ENDPOINTS } from './client/endpoints';
import client from './client';

export function useMe() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, error } = useQuery<User, Error>({
    queryFn: client.users.me,
    queryKey: [API_ENDPOINTS.USERS_ME],
    enabled: isAuthenticated,
  });
  return {
    me: data,
    isLoading,
    error,
    isAuthenticated,
  };
}
