import { useQuery } from '@tanstack/react-query';
import { searchServiceV2 } from 'src/contexts/SearchServiceV2';

export const useSearch = (mintAddresses: string[], enabled: boolean = true) => {
  const mintAddressesString = mintAddresses.join(',');
  return useQuery({
    queryKey: ['search', mintAddressesString],
    queryFn: () => searchServiceV2.search(mintAddressesString),
    enabled,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
