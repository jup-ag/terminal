import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ultraSwapService } from 'src/data/UltraSwapService';
import { RouterResponse } from 'src/data/UltraSwapService';

export const useUltraRouters = <TQueryData = RouterResponse, TData = TQueryData>(
  options?: Omit<UseQueryOptions<TQueryData, unknown, TData>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<TQueryData, unknown, TData>({
    queryKey: ['routers'],
    queryFn: () => ultraSwapService.getRouters() as TQueryData,
    cacheTime: Infinity,
    staleTime: Infinity,
    ...options,
  });
};
