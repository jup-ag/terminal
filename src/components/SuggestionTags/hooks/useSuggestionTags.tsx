import { QuoteResponse } from '@jup-ag/react-hook';
import { TokenInfo } from '@solana/spl-token-registry';
import { SystemProgram } from '@solana/web3.js';
import Decimal from 'decimal.js';
import { useMemo } from 'react';
import { JLP_MINT, USDC_MINT, USDT_MINT } from 'src/constants';
import { checkIsUnknownToken } from 'src/misc/tokenTags';
import { AuthorityAndDelegatesSuggestion } from '../Tags/AuthorityAndDelegatesSuggestion';
import PriceImpactWarningSuggestion from '../Tags/PriceImpactWarningSuggestion';
import { TransferTaxSuggestion } from '../Tags/TransferTaxSuggestion';
import { UnknownTokenSuggestion } from '../Tags/UnknownTokenSuggestion';
import { extractTokenExtensionsInfo } from './extractTokenExtensionsInfo';
import { usePriceImpact } from './usePriceImpact';
import useQueryTokenMetadata from './useQueryTokenMetadata';
import { useBirdeyeRouteInfo } from './useSwapInfo';

const HIGH_PRICE_IMPACT = 5; // 5%
const HIGH_PRICE_DIFFERENCE = 5; // 5%

const FREEZE_AUTHORITY_IGNORE_LIST: string[] = []; // Used to be USDC, USDT, JLP

export const useSuggestionTags = ({
  fromTokenInfo,
  toTokenInfo,
  quoteResponse,
}: {
  fromTokenInfo: TokenInfo | null | undefined;
  toTokenInfo: TokenInfo | null | undefined;
  quoteResponse: QuoteResponse | undefined;
}) => {
  const { data: tokenMetadata } = useQueryTokenMetadata({ fromTokenInfo, toTokenInfo });
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
    }

    if (toTokenInfo) {
      // is unknown
      if (checkIsUnknownToken(toTokenInfo)) {
        list.toToken.push(<UnknownTokenSuggestion key={'unknown' + toTokenInfo.address} tokenInfo={toTokenInfo} />);
      }
    }

    // Freeze authority, Permanent delegate, Transfer Tax
    if (tokenMetadata && fromTokenInfo && toTokenInfo) {
      const tokenExt1 = tokenMetadata[0] ? extractTokenExtensionsInfo(tokenMetadata[0]) : undefined;
      const tokenExt2 = tokenMetadata[1] ? extractTokenExtensionsInfo(tokenMetadata[1]) : undefined;

      // Freeze authority, Permanent delegate
      const freeze: TokenInfo[] = [];
      const permanent: TokenInfo[] = [];

      if (
        tokenExt1?.freezeAuthority &&
        FREEZE_AUTHORITY_IGNORE_LIST.includes(fromTokenInfo.address) === false && // Ignore bluechip like, USDC, USDT
        (tokenExt1.freezeAuthority === SystemProgram.programId.toString()) === false // Ignore system program
      ) {
        freeze.push(fromTokenInfo); // Only mark non-strict token
      }

      if (tokenExt1?.permanentDelegate) {
        permanent.push(fromTokenInfo);
      }

      if (
        tokenExt2?.freezeAuthority &&
        FREEZE_AUTHORITY_IGNORE_LIST.includes(toTokenInfo.address) === false && // Ignore bluechip like, USDC, USDT
        (tokenExt2.freezeAuthority === SystemProgram.programId.toString()) === false // Ignore system program
      ) {
        freeze.push(toTokenInfo); // Only mark non-strict token
      }
      if (tokenExt2?.permanentDelegate) {
        permanent.push(toTokenInfo);
      }

      if (freeze.length > 0 || permanent.length > 0) {
        list.additional.push(
          <AuthorityAndDelegatesSuggestion key={`additional-suggestions`} freeze={freeze} permanent={permanent} />,
        );
      }

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
  }, [
    birdeyeInfo.isDanger,
    birdeyeInfo.isWarning,
    birdeyeInfo.percent,
    birdeyeInfo.rate,
    fromTokenInfo,
    priceImpactPct,
    quoteResponse,
    toTokenInfo,
    tokenMetadata,
  ]);

  return listOfSuggestions;
};
