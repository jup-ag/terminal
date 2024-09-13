import { DCA_HIGH_PRICE_IMPACT, JLP_MINT, USDC_MINT, USDT_MINT } from 'src/constants';
import { TokenInfo } from '@solana/spl-token-registry';
import { QuoteResponse } from '@jup-ag/react-hook';
import { useLstApyFetcher } from './useLstApy';
import { useBirdeyeRouteInfo } from './useSwapInfo';
import { useMemo } from 'react';
import { SystemProgram } from '@solana/web3.js';
import Decimal from 'decimal.js';
import { checkIsUnknownToken } from 'src/misc/tokenTags';
import { UnknownTokenSuggestion } from '../Tags/UnknownTokenSuggestion';
import { LSTSuggestion } from '../Tags/LSTSuggestion';
import { AuthorityAndDelegatesSuggestion } from '../Tags/AuthorityAndDelegatesSuggestion';
import { TransferTaxSuggestion } from '../Tags/TransferTaxSuggestion';
import { extractTokenExtensionsInfo } from '../Tags/Token2022Info';
import useQueryTokenMetadata from './useQueryTokenMetadata';
import { usePriceImpact } from './usePriceImpact';
import PriceImpactWarningSuggestion from '../Tags/PriceImpactWarningSuggestion';

const HIGH_PRICE_IMPACT = 5; // 5%
const HIGH_PRICE_DIFFERENCE = 5; // 5%

const FREEZE_AUTHORITY_IGNORE_LIST = [USDC_MINT.toString(), USDT_MINT.toString(), JLP_MINT.toString()];

export const useSuggestionTags = ({
  fromTokenInfo,
  toTokenInfo,
  quoteResponse,
}: {
  fromTokenInfo: TokenInfo | undefined;
  toTokenInfo: TokenInfo | undefined;
  quoteResponse: QuoteResponse | undefined;
}) => {
  const { data: tokenMetadata } = useQueryTokenMetadata({ fromTokenInfo, toTokenInfo });
  const { data: lstApy } = useLstApyFetcher(['JupSOL']);
  const birdeyeInfo = useBirdeyeRouteInfo();
  const { priceImpactPct } = usePriceImpact(quoteResponse);

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

    if (fromTokenInfo) {
      // is unknown
      if (checkIsUnknownToken(fromTokenInfo)) {
        list.fromToken.push(
          <UnknownTokenSuggestion key={'unknown' + fromTokenInfo.address} tokenInfo={fromTokenInfo} />,
        );
      }

      // lst token
      if (lstApy && lstApy.apys[fromTokenInfo.symbol]) {
        list.fromToken.push(
          <LSTSuggestion
            key={'lst' + fromTokenInfo.symbol}
            tokenInfo={fromTokenInfo}
            apyInPercent={lstApy.apys[fromTokenInfo.symbol]}
          />,
        );
      }
    }

    if (toTokenInfo) {
      // is unknown
      if (checkIsUnknownToken(toTokenInfo)) {
        list.toToken.push(<UnknownTokenSuggestion key={'unknown' + toTokenInfo.address} tokenInfo={toTokenInfo} />);
      }

      // lst token
      if (lstApy && lstApy.apys[toTokenInfo.symbol]) {
        list.fromToken.push(
          <LSTSuggestion
            key={'lst' + toTokenInfo.symbol}
            tokenInfo={toTokenInfo}
            apyInPercent={lstApy.apys[toTokenInfo.symbol]}
          />,
        );
      }
    }

    // Freeze authority, Permanent delegate, Transfer Tax
    if (tokenMetadata && fromTokenInfo && toTokenInfo) {
      const tokenExt1 = tokenMetadata[0] ? extractTokenExtensionsInfo(tokenMetadata[0]) : undefined;
      const tokenExt2 = tokenMetadata[1] ? extractTokenExtensionsInfo(tokenMetadata[1]) : undefined;

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
            asset={tokenMetadata[0]}
            transferFee={tokenExt1.transferFee}
          />,
        );
      tokenExt2?.transferFee &&
        list.additional.push(
          <TransferTaxSuggestion
            key={'transfer-tax-' + toTokenInfo.address}
            asset={tokenMetadata[1]}
            transferFee={tokenExt2.transferFee}
          />,
        );
    }

    // Additional suggestion
    const isHighPriceImpact = priceImpactPct.gt(HIGH_PRICE_IMPACT);
    const isHighPriceDifference = new Decimal(birdeyeInfo.percent).gte(HIGH_PRICE_DIFFERENCE);

    if (quoteResponse && fromTokenInfo && toTokenInfo) {
      if (isHighPriceImpact || isHighPriceDifference) {
        list.additional.unshift(
          <PriceImpactWarningSuggestion
            quoteResponse={quoteResponse}
            birdeyeRate={birdeyeInfo.rate}
            isHighPriceImpact={isHighPriceImpact}
            priceDifferencePct={birdeyeInfo.percent}
            isWarning={birdeyeInfo.isWarning}
            isDanger={birdeyeInfo.isDanger}
            fromTokenInfo={fromTokenInfo}
            toTokenInfo={toTokenInfo}
          />,
        );
      }
    }

    return list;
  }, [birdeyeInfo, priceImpactPct, fromTokenInfo, lstApy, quoteResponse, toTokenInfo, tokenMetadata]);

  return listOfSuggestions;
};
