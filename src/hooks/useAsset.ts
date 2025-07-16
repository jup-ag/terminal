import { useQuery } from '@tanstack/react-query';
import { searchService } from 'src/contexts/SearchService';

export const ASSET_QUERY_KEY = ['search', 'assets'];

export const useAsset = (mint: string) => {
  return useQuery({
    queryKey: [...ASSET_QUERY_KEY, mint],
    queryFn: () => searchService.search(mint),
    enabled: !!mint,
    staleTime: Infinity,
    select: (data) => data[0],
  });
};
