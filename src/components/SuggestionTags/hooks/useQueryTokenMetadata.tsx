import { useConnection } from '@jup-ag/wallet-adapter';
import { TokenInfo } from '@solana/spl-token-registry';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';

export type transferFeeConfig = {
  extension: 'transferFeeConfig';
  state: {
    newerTransferFee: {
      epoch: number;
      maximumFee: number;
      transferFeeBasisPoints: number;
    };
    olderTransferFee: {
      epoch: number;
      maximumFee: number;
      transferFeeBasisPoints: number;
    };
    transferFeeConfigAuthority: string;
    withdrawWithheldAuthority: string;
    withheldAmount: number;
  };
};

export type mintCloseAuthority = {
  extension: 'mintCloseAuthority';
  state: {
    closeAuthority: '2apBGMsS6ti9RyF5TwQTDswXBWskiJP2LD4cUEDqYJjk';
  };
};

export type confidentialTransferMint = {
  extension: 'confidentialTransferMint';
  state: {
    auditorElgamalPubkey: null;
    authority: '2apBGMsS6ti9RyF5TwQTDswXBWskiJP2LD4cUEDqYJjk';
    autoApproveNewAccounts: false;
  };
};

export type transferHook = {
  extension: 'transferHook';
  state: {
    authority: '2apBGMsS6ti9RyF5TwQTDswXBWskiJP2LD4cUEDqYJjk';
    programId: null;
  };
};
export type metadataPointer = {
  extension: 'metadataPointer';
  state: {
    authority: '2apBGMsS6ti9RyF5TwQTDswXBWskiJP2LD4cUEDqYJjk';
    metadataAddress: 'HVbpJAQGNpkgBaYBZQBR1t7yFdvaYVp2vCQQfKKEN4tM';
  };
};
export type tokenMetadata = {
  extension: 'tokenMetadata';
  state: {
    additionalMetadata: [];
    mint: 'HVbpJAQGNpkgBaYBZQBR1t7yFdvaYVp2vCQQfKKEN4tM';
    name: 'Pax Dollar';
    symbol: 'USDP';
    updateAuthority: '2apBGMsS6ti9RyF5TwQTDswXBWskiJP2LD4cUEDqYJjk';
    uri: 'https://token-metadata.paxos.com/usdp_metadata/prod/solana/usdp_metadata.json';
  };
};

export type permanentDelegate = {
  extension: 'permanentDelegate';
  state: {
    delegate: string;
  };
};

type Extensions =
  | transferFeeConfig
  | mintCloseAuthority
  | confidentialTransferMint
  | transferHook
  | metadataPointer
  | tokenMetadata
  | permanentDelegate;

export interface TokenInfoWithParsedAccountData {
  tokenInfo: TokenInfo;
  parsed: {
    info: {
      decimals: number;
      freezeAuthority: string;
      isInitialized: boolean;
      mintAuthority: string;
      supply: string;
      extensions?: Array<Extensions>;
    };
    type: string;
  };
}

const useQueryTokenMetadata = ({
  fromTokenInfo,
  toTokenInfo,
}: {
  fromTokenInfo: TokenInfo | null | undefined;
  toTokenInfo: TokenInfo | null | undefined;
}) => {
  const { connection } = useConnection();
  const tokenInfos = [fromTokenInfo, toTokenInfo].filter(Boolean) as TokenInfo[];
  const mints = tokenInfos.map((item) => item?.address);

  return useQuery<TokenInfoWithParsedAccountData[] | undefined>(
    ['onchain-token-metadata', ...mints],
    async () => {
      try {
        const result = await connection.getMultipleParsedAccounts(mints.map((item) => new PublicKey(item)));
        if (result.value) {
          return result.value.map((item, idx) =>
            item?.data && 'parsed' in item?.data
              ? {
                  tokenInfo: tokenInfos[idx] as TokenInfo,
                  parsed: item?.data.parsed,
                }
              : null,
          ) as TokenInfoWithParsedAccountData[];
        }
      } catch (error) {
        throw new Error('Failed to fetch token metadata');
      }
    },
    {
      enabled: !!fromTokenInfo && !!toTokenInfo,
    },
  );
};

export default useQueryTokenMetadata;
