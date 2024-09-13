import { TokenInfo } from '@solana/spl-token-registry';
import { useMemo } from 'react';
import Spinner from 'src/components/Spinner';
import PopoverTooltip from 'src/components/Tooltip/PopoverTooltip';
import InfoIconSVG from 'src/icons/InfoIconSVG';
import Decimal from 'decimal.js';
import { formatNumber } from 'src/misc/utils';
import AccountLink from 'src/components/AccountLink';
import { permanentDelegate, TokenInfoWithParsedAccountData, transferFeeConfig } from '../hooks/useQueryTokenMetadata';

export function extractTokenExtensionsInfo(asset: TokenInfoWithParsedAccountData): {
  tokenExtension: boolean;
  transferFee: string | null;
  maxTransferFee: string | null;
  mintAuthority: string | undefined;
  freezeAuthority: string | undefined;
  permanentDelegate: string | undefined;
} | null {
  if (!asset.parsed.info.extensions) return null;

  const haveTransferFee = asset.parsed.info.extensions.find((item) => item.extension === 'transferFeeConfig') as transferFeeConfig | undefined;
  const transferFeeObject = haveTransferFee?.state.newerTransferFee || haveTransferFee?.state.olderTransferFee;
  const transferFee = transferFeeObject?.transferFeeBasisPoints;
  const maxTransferFee = transferFeeObject?.maximumFee;

  const havePermanentDelegate = asset.parsed.info.extensions.find((item) => item.extension === 'permanentDelegate') as permanentDelegate | undefined;
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

interface Token2022InfoProps {
  asset: TokenInfoWithParsedAccountData;
  isLoading: boolean;
}

export const Token2022Info = (props: Token2022InfoProps) => {
  // props
  const tokenInfo = props.asset.tokenInfo;

  // variable
  const asset = useMemo(() => {
    return extractTokenExtensionsInfo(props.asset);
  }, [props.asset]);

  // render
  if (props.isLoading) {
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
            content={`${asset.maxTransferFee} ${tokenInfo.symbol}`}
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
