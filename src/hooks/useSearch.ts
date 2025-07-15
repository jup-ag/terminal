import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchService } from 'src/contexts/SearchService';
import { SearchResponse } from 'src/entity/SearchResponse';

interface SearchOptions {
  enabled?: boolean;
  staleTime?: number;
}

const CHUNK_SIZE = 100;

export const useSearch = (mintAddresses: string[], options: SearchOptions = {}) => {

  const mintAddressesString = useMemo(() => mintAddresses.join(','), [mintAddresses]);
  
  return useQuery({
    queryKey:['search',mintAddressesString],
    queryFn: async () => {
      // If we have 100 or fewer addresses, make a single request
      if (mintAddresses.length <= CHUNK_SIZE) {
        return searchService.search(mintAddressesString);
      }

      // Split into chunks of 100
      const chunks: string[][] = [];
      for (let i = 0; i < mintAddresses.length; i += CHUNK_SIZE) {
        chunks.push(mintAddresses.slice(i, i + CHUNK_SIZE));
      }
      // Make requests for each chunk
      const chunkPromises = chunks.map(chunk => 
        searchService.search(chunk.join(','))
      );

      // Wait for all requests to complete
      const results: SearchResponse[] = await Promise.all(chunkPromises);

      return results.flat();
    },
    enabled: options.enabled ?? true,
    staleTime: options.staleTime ?? Infinity,
  });
};
