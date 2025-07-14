import { useQuery } from '@tanstack/react-query';
import { searchService } from 'src/contexts/SearchService';

export const useAsset = (mint: string) => {
  return useQuery({
    queryKey: ['search', 'assets', mint],
    queryFn: () => searchService.search(mint),
    enabled: !!mint,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    select: (data) => data[0],
  });
};
