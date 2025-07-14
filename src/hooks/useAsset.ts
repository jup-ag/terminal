import { useQuery } from '@tanstack/react-query';
import { searchServiceV2 } from 'src/contexts/SearchServiceV2';

export const useAsset = (mint: string) => {
  return useQuery({
    queryKey: ['search', 'assets', mint],
    queryFn: () => searchServiceV2.search(mint),
    enabled: !!mint,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    select: (data) => data[0],
  });
};
