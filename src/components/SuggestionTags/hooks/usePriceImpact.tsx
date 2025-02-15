import { useMemo } from 'react';
import Decimal from 'decimal.js';
import { useSwapRouteInfo } from './useSwapInfo';
import { formatNumber } from 'src/misc/utils';
import { FormattedUltraQuoteResponse } from 'src/entity/FormattedUltraQuoteResponse';

const PRICE_IMPACT_COLOR = {
  OK: 'text-white-50',
  WARN: 'text-jupiter-primary',
  DANGER: 'text-perps-red',
};

export const usePriceImpact = (route?: FormattedUltraQuoteResponse) => {
  const swapRouteInfo = useSwapRouteInfo();

  const priceImpactPct = useMemo(() => new Decimal(route?.priceImpactPct || 0).mul(100), [route?.priceImpactPct]);

  const formattedPct = useMemo(() => formatNumber.format(priceImpactPct.toDP(4)), [priceImpactPct]);

  const priceImpactText = priceImpactPct.lt(0.1) ? `< ${formatNumber.format('0.1')}%` : `~ ${formattedPct}%`;

  const priceImpactColor = useMemo(() => {
    if (swapRouteInfo) {
      if (swapRouteInfo.isMediumImpact) {
        return PRICE_IMPACT_COLOR.WARN;
      }
      if (swapRouteInfo.isHighImpact) {
        return PRICE_IMPACT_COLOR.DANGER;
      }
    }

    return PRICE_IMPACT_COLOR.OK;
  }, [swapRouteInfo]);

  return { priceImpactText, priceImpactColor, priceImpactPct };
};
