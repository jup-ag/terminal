import { TokenInfo } from '@solana/spl-token-registry';
import { HeliusDASAsset } from '../hooks/useHeliusDasQuery';
import { useMemo } from 'react';
import Spinner from 'src/components/Spinner';
import PopoverTooltip from 'src/components/Tooltip/PopoverTooltip';
import InfoIconSVG from 'src/icons/InfoIconSVG';
import Decimal from 'decimal.js';
import { formatNumber } from 'src/misc/utils';
import AccountLink from 'src/components/TokenLink/AccountLink';

export function extractTokenExtensionsInfo(asset: HeliusDASAsset): {
  tokenExtension: boolean;
  transferFee: string | null;
  maxTransferFee: string | null;
  symbol: string;
  mintAuthority: string | undefined;
  freezeAuthority: string | undefined;
  permanentDelegate: string | undefined;
} {
  const { mint_extensions: mintExtensions, token_info: tokenInfo } = asset;

  const { permanent_delegate, transfer_fee_config } = mintExtensions || {};
  const mintExtensionsTransferFee = transfer_fee_config?.newer_transfer_fee || transfer_fee_config?.older_transfer_fee;

  const { decimals, mint_authority, freeze_authority, symbol } = tokenInfo;

  return {
    tokenExtension: Boolean(mintExtensions),
    // fee
    transferFee: mintExtensionsTransferFee
      ? new Decimal(mintExtensionsTransferFee.transfer_fee_basis_points).div(100).toFixed(1)
      : null,
    maxTransferFee: mintExtensionsTransferFee
      ? formatNumber.format(new Decimal(mintExtensionsTransferFee.maximum_fee).div(10 ** decimals))
      : null,
    symbol,

    // authority
    mintAuthority: mint_authority,
    freezeAuthority: freeze_authority,

    // delegate
    permanentDelegate: permanent_delegate?.delegate,
  };
}

interface Token2022InfoProps {
  tokenInfo: TokenInfo;
  dasAssets: (HeliusDASAsset | null)[] | undefined;
  isLoading: boolean;
}

export const Token2022Info = (props: Token2022InfoProps) => {
  // props
  const { tokenInfo, dasAssets, isLoading } = props;
  const { address } = tokenInfo;

  // variable
  const asset = useMemo(() => {
    const asset = dasAssets?.find((item) => item?.id === address);
    if (!asset) return null;
    return extractTokenExtensionsInfo(asset);
  }, [dasAssets, address]);

  // render
  if (isLoading) {
    return (
      <div className="flex justify-center my-5">
        <Spinner />
      </div>
    );
  }

  if (!asset) {
    return <div className="flex justify-center my-5 text-xs">Could not retrieve Token2022 information.</div>;
  }

  return (
    <div className="mt-3 mb-5">
      <p className="text-center text-xs text-v2-lily">
        This token utilizes the Token2022 program or Token Extension, which offer a superset of the features provided by
        the Token Program.
      </p>
      <p className="text-center text-xs text-warning mt-2">Please trade with caution.</p>

      <div className="bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10 px-[14px] py-3 mt-5 space-y-2">
        {asset.transferFee ? (
          <ListItem
            label="Transfer Fee"
            content={`${asset.transferFee}%`}
            tooltipText="A transfer fee derived from the amount being transferred."
          />
        ) : null}
        {asset.maxTransferFee ? (
          <ListItem
            label="Max Transfer Fee"
            content={`${asset.maxTransferFee} ${asset.symbol}`}
            tooltipText="Max cap transfer fee set by the authority mint."
          />
        ) : null}
        <ListItem
          label="Freeze Authority"
          content={!!asset.freezeAuthority ? <AccountLink address={asset.freezeAuthority} /> : 'False'}
          tooltipText="Mint accounts can be frozen, rendering them unusable for transactions until unfrozen."
        />
        <ListItem
          label="Permanent Delegate"
          content={!!asset.permanentDelegate ? <AccountLink address={asset.permanentDelegate} /> : 'False'}
          tooltipText="Token creator can permanently control all tokens."
        />
        <ListItem
          label="Mint Authority"
          content={!!asset.mintAuthority ? <AccountLink address={asset.mintAuthority} /> : 'False'}
          tooltipText="The token creator has the ability to mint additional tokens."
        />
      </div>
    </div>
  );
};

interface ListItemProps {
  label: string;
  content: React.ReactNode;
  tooltipText: string;
}

const ListItem = (props: ListItemProps) => {
  const { tooltipText, label, content } = props;

  return (
    <div className="flex justify-between space-x-1">
      <div className="flex items-center">
        <p className="text-xs font-semibold text-v2-lily">{label}:</p>
        <PopoverTooltip content={tooltipText}>
          <div className="flex items-center ml-[6px] text-v2-lily/50 fill-current">
            <InfoIconSVG height={12} width={12} />
          </div>
        </PopoverTooltip>
      </div>
      <div className="flex items-center space-x-1 text-right text-white text-xs font-semibold">{content}</div>
    </div>
  );
};
