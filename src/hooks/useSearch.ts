import { useQuery } from '@tanstack/react-query';
import { searchService } from 'src/contexts/SearchService';

interface SearchOptions {
  enabled?: boolean;
  staleTime?: number;
}

export const useSearch = (mintAddresses: string[], options: SearchOptions = {}) => {
  const mintAddressesString = mintAddresses.join(',');
  return useQuery({
    queryKey: ['search', mintAddressesString],
    queryFn: () => searchService.search(mintAddressesString),
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? Infinity,
  });
};
