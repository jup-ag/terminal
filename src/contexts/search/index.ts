import TypesenseInstantsearchAdapter from 'typesense-instantsearch-adapter';
import { useMemo } from 'react';

const TYPESENSE_CLUSTER = {
  apiKey: '', // Jupiter search endpoint handles this.
  nodes: [{ url: 'https://search1.jup.ag' }, { url: 'https://search2.jup.ag' }, { url: 'https://search3.jup.ag' }],
  nearestNode: { url: 'https://search.jup.ag' },
  sort_by: 'daily_volume:desc',
};

function createTypesenseAdapter() {
  const typesenseInstantsearchAdapter = new TypesenseInstantsearchAdapter({
    server: {
      // This Key only allows SEARCH operations, so it's safe to expose it in the client-side
      apiKey: TYPESENSE_CLUSTER.apiKey,
      nodes: TYPESENSE_CLUSTER.nodes,
      nearestNode: TYPESENSE_CLUSTER.nearestNode,
      numRetries: 2,
      retryIntervalSeconds: 0.5,
      connectionTimeoutSeconds: 3_000,
      cacheSearchResultsForSeconds: 5, // The caching provided is very bad, does not recover from network error gracefully
    },
    additionalSearchParameters: {
      query_by: 'symbol,name,address',
      sort_by: TYPESENSE_CLUSTER.sort_by,
      perPage: 50,
    },
  });

  return typesenseInstantsearchAdapter;
}

export const useSearchAdapter = () => {
  const typesenseAdapter = useMemo(() => createTypesenseAdapter(), []);
  return typesenseAdapter;
};
