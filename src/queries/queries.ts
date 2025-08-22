import { queryOptions, QueryOptions, UseQueryOptions } from '@tanstack/react-query';
import { RouterResponse, ultraSwapService } from 'src/data/UltraSwapService';

export const UltraQueries:{
    routers: UseQueryOptions<RouterResponse, Error, RouterResponse, ['routers']>
} = {
  routers: queryOptions({
    queryKey: ['routers'],
    queryFn: ultraSwapService.getRouters,
    gcTime: Infinity,
    staleTime: Infinity,
  }),
};

