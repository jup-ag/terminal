import { atom, useAtomValue } from 'jotai';
import { calculateFeeForSwap } from '@jup-ag/react-hook';

export interface SwapRouteInfo extends ReturnType<typeof calculateFeeForSwap> {
  isHighImpact: boolean;
  isMediumImpact: boolean;
  priceImpact: number;
}

export interface BirdeyeRouteInfo {
  isCheaper: boolean;
  isMoreExp: boolean;
  isWithinTwoPercent: boolean;
  isWithinFivePercent: boolean;
  isDanger: boolean;
  isWarning: boolean;
  percent: number;
  formattedPercent: string;
  rate: number | null;
  rateDiff: number | null;
  apiURL: string;
}

const swapRouteInfoAtom = atom<SwapRouteInfo | null>(null);
const birdeyeRouteInfoAtom = atom<BirdeyeRouteInfo>({
  isCheaper: false,
  isMoreExp: false,
  isWithinTwoPercent: false,
  isWithinFivePercent: false,
  isDanger: false,
  isWarning: false,
  percent: 0,
  formattedPercent: '',
  rate: null,
  rateDiff: null,
  apiURL: '',
});

export const useSwapRouteInfo = () => {
  return useAtomValue(swapRouteInfoAtom);
};

export const useBirdeyeRouteInfo = () => {
  return useAtomValue(birdeyeRouteInfoAtom);
};
