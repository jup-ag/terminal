import Decimal from "decimal.js";
import { ExtPermanentDelegate, TokenInfoWithParsedAccountData, ExtTransferFeeConfig } from "./useQueryTokenMetadata";
import { formatNumber } from "src/misc/utils";

export function extractTokenExtensionsInfo(asset: TokenInfoWithParsedAccountData): {
  tokenExtension: boolean;
  transferFee: string | null;
  maxTransferFee: string | null;
  mintAuthority: string | undefined;
  freezeAuthority: string | undefined;
  permanentDelegate: string | undefined;
} | null {
  if (!asset.parsed.info.extensions) return null;

  const haveTransferFee = asset.parsed.info.extensions.find((item) => item.extension === 'transferFeeConfig') as
    | ExtTransferFeeConfig
    | undefined;
  const transferFeeObject = haveTransferFee?.state.newerTransferFee || haveTransferFee?.state.olderTransferFee;
  const transferFee = transferFeeObject?.transferFeeBasisPoints;
  const maxTransferFee = transferFeeObject?.maximumFee;

  const havePermanentDelegate = asset.parsed.info.extensions.find((item) => item.extension === 'permanentDelegate') as
    | ExtPermanentDelegate
    | undefined;
  const permanentDelegate = havePermanentDelegate?.state.delegate;

  return {
    tokenExtension: asset.parsed.info.extensions.length > 0,
    // fee
    transferFee: transferFee ? new Decimal(transferFee).div(100).toFixed(1) : null,
    maxTransferFee: maxTransferFee
      ? formatNumber.format(new Decimal(maxTransferFee).div(10 ** asset.tokenInfo.decimals))
      : null,

    // authority
    mintAuthority: asset.parsed.info.mintAuthority,
    freezeAuthority: asset.parsed.info.freezeAuthority,

    // delegate
    permanentDelegate,
  };
}
