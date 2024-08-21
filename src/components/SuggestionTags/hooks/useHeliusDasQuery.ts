import { TokenInfo } from '@solana/spl-token-registry';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { HELIUS_MAIN_FRONTEND_RPC } from 'src/constants';

export interface HeliusDASAsset {
  interface: string;
  id: string;
  content: {
    $schema: string;
    json_uri: string;
    files: any[];
    metadata: {
      attributes: any[];
      description: string;
      name: string;
      symbol: string;
      links: {
        external_url: string;
      };
    };
  };
  authorities: {
    address: string;
    scopes: string[];
  };
  compression: {
    eligible: boolean;
    compressed: boolean;
    data_hash: string;
    creator_hash: string;
    asset_hash: string;
    tree: string;
  };
  grouping: {
    group_key: string;
    group_value: string;
  };
  royalty: {
    royalty_model: string;
    target: string;
    percent: number;
    primary_sale_happened: boolean;
    locked: boolean;
  };
  creators: {
    address: string;
    verified: boolean;
  };
  ownership: {
    frozen: boolean;
    delegated: boolean;
    delegate: string;
    ownership_model: string;
    owner: string;
    supply: string;
    mutable: boolean;
    burnt: boolean;
  };
  token_info: {
    decimals: number;
    mint_authority?: string;
    freeze_authority?: string;
    price_info: {
      currency: string;
      price_per_token: number;
    };
    supply: number;
    symbol: string;
    token_program: string;
  };
  // Only for Token2022
  mint_extensions?: {
    permanent_delegate?: {
      delegate: string;
    };
    interest_bearing_config: {
      current_rate: number;
      initialization_timestamp: number;
      last_update_timestamp: number;
      pre_update_average_rate: number;
      rate_authority: string;
    };
    transfer_fee_config?: {
      newer_transfer_fee?: {
        epoch: number;
        maximum_fee: number;
        transfer_fee_basis_points: number;
      };
      older_transfer_fee?: {
        epoch: number;
        maximum_fee: number;
        transfer_fee_basis_points: number;
      };
    };
  };
  mutable: boolean;
}

export const useHeliusDASQuery = (tokenInfos: TokenInfo[]) => {
  const keys = useMemo(() => tokenInfos.map((item) => item.address.toString()), [tokenInfos]);

  return useQuery<(HeliusDASAsset | null)[]>({
    queryKey: ['get_asset_batch', keys.join('')],
    queryFn: async () => {
      try {
        const response = await fetch(HELIUS_MAIN_FRONTEND_RPC || '', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'getAssetBatch',
            method: 'getAssetBatch',
            params: { ids: keys },
          }),
        });

        const res = await response.json();
        if (res && res.result) {
          return res.result;
        }
        return null;
      } catch (error) {
        return null;
      }
    },
    enabled: keys.length > 0,
  });
};
