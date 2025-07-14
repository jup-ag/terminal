import { useQuery } from '@tanstack/react-query';
import { searchService } from 'src/contexts/SearchService';

export const useSearch = (mintAddresses: string[], enabled: boolean = true) => {
  const mintAddressesString = mintAddresses.join(',');
  return useQuery({
    queryKey: ['search', mintAddressesString],
    queryFn: () => searchService.search(mintAddressesString),
    enabled,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
