import * as React from 'react';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';

import { useAccounts } from '../contexts/accounts';

import { formatNumber } from '../misc/utils';

interface ICoinBalanceProps {
  mintAddress: string;
  hideZeroBalance?: boolean;
}

const CoinBalance: React.FunctionComponent<ICoinBalanceProps> = (props) => {
  const { accounts } = useAccounts();
  const { wallet } = useWalletPassThrough();

  const walletPublicKey = React.useMemo(() => wallet?.adapter.publicKey?.toString(), [wallet?.adapter.publicKey]);

  const balance = React.useMemo(() => {
    return accounts[props.mintAddress]?.balance || 0;
  }, [accounts, props.mintAddress]);

  if (props.hideZeroBalance && balance === 0) return null;

  if (!walletPublicKey) return <span translate="no">{formatNumber.format(0, 6)}</span>;
  return <span translate="no">{formatNumber.format(balance, 6)}</span>;
};

export default CoinBalance;
