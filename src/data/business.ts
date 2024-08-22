import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { API_ENDPOINTS } from './client/endpoints';
import client from './client';

export function useBusinesses() {
  const { isPending, isFetching, isError, data, error } = useQuery({
    queryKey: [API_ENDPOINTS.BUSINESSES_ME],
    queryFn: client.business.me,
  });

  return {
    businesses: data ?? [],
    isLoading: isPending || isFetching,
    error,
    isError,
  };
}

export function useCreateBusinessMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: client.business.create,
    onSettled: () => {
      //   queryClient.invalidateQueries([API_ENDPOINTS.BUSINESS_ME]);
    },
  });
}
