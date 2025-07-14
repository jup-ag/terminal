import { SearchResponse } from 'src/entity/SearchResponse';

const BASE_URL = 'https://datapi.jup.ag';

class SearchServiceV2 {
  private ROUTE = {
    SEARCH: `${BASE_URL}/v1/assets`,
  };

  async search(query: string): Promise<SearchResponse> {
    const response = await fetch(`${this.ROUTE.SEARCH}/search?query=${query}`, {
      credentials: 'include',
    });
    const data: SearchResponse = await response.json();
    return data;
  }
}

export const searchServiceV2 = new SearchServiceV2();
