import * as React from 'react';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';

import { useAccounts } from '../contexts/accounts';

import { formatNumber } from '../misc/utils';
import { WRAPPED_SOL_MINT } from 'src/constants';
import Decimal from 'decimal.js';

interface ICoinBalanceProps {
  mintAddress: string;
  hideZeroBalance?: boolean;
}

const CoinBalance: React.FunctionComponent<ICoinBalanceProps> = (props) => {
  const { accounts, nativeAccount } = useAccounts();
  const { connected } = useWalletPassThrough();

  const formattedBalance: string | null = React.useMemo(() => {
    const accBalanceObj =
      props.mintAddress === WRAPPED_SOL_MINT.toString() ? nativeAccount : accounts[props.mintAddress];
      if (!accBalanceObj) return '';

    const balance = new Decimal(accBalanceObj.balanceLamports.toString()).div(10 ** accBalanceObj.decimals);
    return formatNumber.format(balance, accBalanceObj.decimals);
  }, [accounts, nativeAccount, props.mintAddress]);

  if (props.hideZeroBalance && !formattedBalance) return null;

  if (!connected) return null;
  return <span translate="no">{formattedBalance}</span>;
};

export default CoinBalance;
