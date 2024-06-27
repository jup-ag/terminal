import { ENV, TokenInfo } from "@solana/spl-token-registry";
import { Connection, PublicKey } from "@solana/web3.js";
import { fetchMintInfos, fetchTokenMetadatas } from '@mercurial-finance/optimist';
import { TOKEN_2022_PROGRAM_ID } from "src/constants";

export const checkImageURL = (url: string) => {
  return url.match(/\.(webp|svg|jpeg|jpg|gif|png)$/) != null;
};

export async function searchOnChainTokens(
  connection: Connection,
  mints: string[],
): Promise<Map<string, TokenInfo | null>> {
  const resultMap: Map<string, TokenInfo | null> = new Map();

  const onChainMintsInfo = await fetchMintInfos(
    connection,
    mints
      .map((mint) => {
        try {
          return new PublicKey(mint);
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean) as PublicKey[],
  );
  const onChainMetadatas = await fetchTokenMetadatas(
    connection,
    onChainMintsInfo.map(([mint, { programId }]) => ({
      mint: new PublicKey(mint),
      programId,
    })),
  );

  await Promise.all(
    onChainMintsInfo.map(async ([mint, mintInfo]) => {
      const tokenMetaData = onChainMetadatas.find((item) => item.account.mint.toString() === mint)?.account.data;

      resultMap.set(
        mint,
        mintInfo
          ? {
              chainId: ENV.MainnetBeta,
              address: mint,
              name: tokenMetaData?.name || mint.slice(0, 3), // If no metadata name, use first 3 symbol
              symbol: tokenMetaData?.symbol || mint.slice(0, 3), // If no metadata name, use first 3 symbol
              decimals: mintInfo.decimals,
              logoURI:
                tokenMetaData?.uri && checkImageURL(tokenMetaData?.uri)
                  ? tokenMetaData?.uri
                  : await (async () => {
                      try {
                        if (!tokenMetaData?.uri) return '';
                        const logo = await fetchWithTimeout(tokenMetaData?.uri).then((res) => res.json());
                        return logo?.image;
                      } catch (error) {
                        return '';
                      }
                    })(),
              tags: mintInfo.programId.equals(TOKEN_2022_PROGRAM_ID) ? ['token-2022', 'unknown'] : ['unknown'],
            }
          : null,
      );
    }),
  );

  return resultMap;
}

async function fetchWithTimeout(resource: string, options?: RequestInit & { timeout?: number }) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), options?.timeout ?? 3000);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}
