import * as React from 'react';
import { useWalletPassThrough } from 'src/contexts/WalletPassthroughProvider';
import { useBalances } from 'src/hooks/useBalances';

interface ICoinBalanceProps {
  mintAddress: string;
  hideZeroBalance?: boolean;
}

const CoinBalance: React.FunctionComponent<ICoinBalanceProps> = (props) => {
  const { data: balances } = useBalances();
  const { connected } = useWalletPassThrough();

  const formattedBalance: string | null = React.useMemo(() => {
    if (!balances) {
      return '0';
    }
    const accBalanceObj = balances[props.mintAddress];
      if (!accBalanceObj) return '0';

    const balance = accBalanceObj.uiAmount.toString();
    return balance;
  }, [balances, props.mintAddress]);

  if (props.hideZeroBalance && (formattedBalance === '0' || !formattedBalance)) return null;

  if (!connected) return null;
  return <span translate="no">{formattedBalance}</span>;
};

export default CoinBalance;
