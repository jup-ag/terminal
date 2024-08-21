import { DCA_HIGH_PRICE_IMPACT, JLP_MINT, USDC_MINT, USDT_MINT } from 'src/constants';
import { TokenInfo } from '@solana/spl-token-registry';
import { QuoteResponse } from '@jup-ag/react-hook';
import { useHeliusDASQuery } from './useHeliusDasQuery';
import { useBirdeyeRouteInfo } from './useSwapInfo';
import { useMemo } from 'react';
import { SystemProgram } from '@solana/web3.js';
import Decimal from 'decimal.js';
import JSBI from 'jsbi';
import { checkIsUnknownToken } from 'src/misc/tokenTags';
import { UnknownTokenSuggestion } from '../Tags/UnknownTokenSuggestion';
import { AuthorityAndDelegatesSuggestion } from '../Tags/AuthorityAndDelegatesSuggestion';
import { TransferTaxSuggestion } from '../Tags/TransferTaxSuggestion';
import { PriceWarningSuggestion } from '../Tags/PriceWarningSuggestion';
import { extractTokenExtensionsInfo } from '../Tags/Token2022Info';
import { useUSDValue } from 'src/contexts/USDValueProvider';

const HIGH_PRICE_IMPACT = 5; // 5%
const MINIMUM_THRESHOLD_FOR_DCA = 1_000; // 1,000 USD, not USDC

const FREEZE_AUTHORITY_IGNORE_LIST = [USDC_MINT.toString(), USDT_MINT.toString(), JLP_MINT.toString()];

export const useSuggestionTags = ({
  fromTokenInfo,
  toTokenInfo,
  quoteResponse,
}: {
  fromTokenInfo: TokenInfo | null | undefined;
  toTokenInfo: TokenInfo | null | undefined;
  quoteResponse: QuoteResponse | undefined;
}) => {
  const { data: dasQuery } = useHeliusDASQuery([fromTokenInfo, toTokenInfo].filter(Boolean) as TokenInfo[]);
  const birdeyeInfo = useBirdeyeRouteInfo();
  const { tokenPriceMap } = useUSDValue();

  const listOfSuggestions = useMemo(() => {
    const list: {
      fromToken: JSX.Element[];
      toToken: JSX.Element[];
      additional: JSX.Element[];
    } = {
      fromToken: [],
      toToken: [],
      additional: [],
    };

    if (fromTokenInfo && checkIsUnknownToken(fromTokenInfo)) {
      // is unknown
      list.fromToken.push(<UnknownTokenSuggestion key={'unknown' + fromTokenInfo.address} tokenInfo={fromTokenInfo} />);
    }

    if (toTokenInfo && checkIsUnknownToken(toTokenInfo)) {
      // is unknown
      list.toToken.push(<UnknownTokenSuggestion key={'unknown' + toTokenInfo.address} tokenInfo={toTokenInfo} />);
    }

    // Freeze authority, Permanent delegate, Transfer Tax
    if (dasQuery && fromTokenInfo && toTokenInfo) {
      const tokenExt1 = dasQuery[0] ? extractTokenExtensionsInfo(dasQuery[0]) : undefined;
      const tokenExt2 = dasQuery[1] ? extractTokenExtensionsInfo(dasQuery[1]) : undefined;

      // Freeze authority, Permanent delegate
      const freeze: TokenInfo[] = [];
      const permanent: TokenInfo[] = [];

      (() => {
        if (
          tokenExt1?.freezeAuthority &&
          FREEZE_AUTHORITY_IGNORE_LIST.includes(fromTokenInfo.address) === false && // Ignore bluechip like, USDC, USDT
          (tokenExt1.freezeAuthority === SystemProgram.programId.toString()) === false // Ignore system program
        ) {
          freeze.push(fromTokenInfo); // Only mark non-strict token, so USDC, USDT, don't get marked
        }

        if (tokenExt1?.permanentDelegate) {
          permanent.push(fromTokenInfo);
        }
      })();

      (() => {
        if (
          tokenExt2?.freezeAuthority &&
          FREEZE_AUTHORITY_IGNORE_LIST.includes(toTokenInfo.address) === false && // Ignore bluechip like, USDC, USDT
          (tokenExt2.freezeAuthority === SystemProgram.programId.toString()) === false // Ignore system program
        ) {
          freeze.push(toTokenInfo); // Only mark non-strict token, so USDC, USDT, don't get marked
        }
        if (tokenExt2?.permanentDelegate) {
          permanent.push(toTokenInfo);
        }

        if (freeze.length > 0 || permanent.length > 0) {
          list.additional.push(
            <AuthorityAndDelegatesSuggestion key={`additional-suggestions`} freeze={freeze} permanent={permanent} />,
          );
        }
      })();

      // Transfer Tax
      tokenExt1?.transferFee &&
        list.additional.push(
          <TransferTaxSuggestion
            key={'2022' + fromTokenInfo.address}
            tokenInfo={fromTokenInfo}
            dasAsset={dasQuery[0]}
            transferFee={tokenExt1.transferFee}
          />,
        );
      tokenExt2?.transferFee &&
        list.additional.push(
          <TransferTaxSuggestion
            key={'transfer-tax-' + toTokenInfo.address}
            tokenInfo={toTokenInfo}
            dasAsset={dasQuery[1]}
            transferFee={tokenExt2.transferFee}
          />,
        );
    }

    // Additional suggestion
    const priceImpactPct = Number(quoteResponse?.priceImpactPct || 0) * 100;
    const isHighPriceImpact = Number(priceImpactPct || 0) > HIGH_PRICE_IMPACT;

    // is launch page hide price impact
    if (quoteResponse && fromTokenInfo?.decimals && toTokenInfo?.decimals) {
      const inputAmount: JSBI = quoteResponse.inAmount;
      const outputAmount: JSBI = quoteResponse.outAmount;

      if (isHighPriceImpact || birdeyeInfo.isWarning || birdeyeInfo.isDanger) {
        // lst token
        list.additional.push(
          <PriceWarningSuggestion
            key={'warning-' + fromTokenInfo.address}
            inputAmount={inputAmount.toString()}
            inputTokenInfo={fromTokenInfo}
            outputAmount={outputAmount.toString()}
            outputTokenInfo={toTokenInfo}
            priceImpact={priceImpactPct}
            birdeyeRate={birdeyeInfo.rate || 0}
            isWarning={birdeyeInfo.isWarning}
            isDanger={birdeyeInfo.isDanger}
          />,
        );
      }
    }

    if (quoteResponse && fromTokenInfo && toTokenInfo) {
      const isDCASuggested = (() => {
        const inputTokenPrice = tokenPriceMap[fromTokenInfo?.address || '']?.usd || 0;
        const inputAmountInUSD = new Decimal(quoteResponse.inAmount.toString())
          .div(10 ** fromTokenInfo.decimals)
          .mul(inputTokenPrice);
        const isAboveThreshold = inputAmountInUSD.gte(MINIMUM_THRESHOLD_FOR_DCA);

        return isAboveThreshold && (priceImpactPct || 0) > DCA_HIGH_PRICE_IMPACT;
      })();
    }

    return list;
  }, [
    birdeyeInfo.isDanger,
    birdeyeInfo.isWarning,
    birdeyeInfo.rate,
    dasQuery,
    fromTokenInfo,
    quoteResponse,
    toTokenInfo,
    tokenPriceMap,
  ]);

  return listOfSuggestions;
};
