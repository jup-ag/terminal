import * as React from 'react';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';

import { useAccounts } from '../contexts/accounts';

import { formatNumber } from '../misc/utils';
import { WRAPPED_SOL_MINT } from 'src/constants';

interface ICoinBalanceProps {
  mintAddress: string;
  hideZeroBalance?: boolean;
}

const CoinBalance: React.FunctionComponent<ICoinBalanceProps> = (props) => {
  const { accounts, nativeAccount } = useAccounts();
  const { wallet } = useWalletPassThrough();

  const walletPublicKey = React.useMemo(() => wallet?.adapter.publicKey?.toString(), [wallet?.adapter.publicKey]);

  const balance: number = React.useMemo(() => {
    if (props.mintAddress === WRAPPED_SOL_MINT.toString()) return nativeAccount?.balance || 0;
    return accounts[props.mintAddress]?.balance || 0;
  }, [accounts, nativeAccount, props.mintAddress]);

  if (props.hideZeroBalance && balance === 0) return null;

  if (!walletPublicKey) return <span translate="no">{formatNumber.format(0, 6)}</span>;
  return <span translate="no">{formatNumber.format(balance, 6)}</span>;
};

export default CoinBalance;
