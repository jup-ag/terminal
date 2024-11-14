import { Transaction, VersionedTransaction } from '@solana/web3.js';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { useLocalStorage } from 'src/hooks/useLocalStorage';
import { toLamports } from 'src/misc/utils';
import { extractComputeUnitLimit, modifyComputeUnitLimitIx, modifyComputeUnitPriceIx } from '@mercurial-finance/optimist';

// --------------------
// Constants
// --------------------
const APP_NAME = 'jupiter-terminal';

const PRIORITY_FEE_DEFAULT: number = 0.004;
const PRIORITY_LEVEL_DEFAULT: PriorityLevel = 'HIGH';
const PRIORITY_MODE_DEFAULT: PriorityMode = 'MAX';

export const PRIORITY_LEVEL_MULTIPLIER_HIGH = 1.5;
export const PRIORITY_LEVEL_MULTIPLIER_VERY_HIGH = 3;

// --------------------
// Types
// --------------------
export type PriorityMode = 'MAX' | 'EXACT';
export type PriorityLevel = 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

// --------------------
// Helper methods
// --------------------
function computePriceMicroLamportsFromFeeLamports(feeLamports: number, computeUnitLimit: number = 0) {
  return Math.floor((feeLamports * 1_000_000) / computeUnitLimit);
}

interface PrioritizationFeeContextValue {
  // state
  priorityFee: number;
  priorityMode: PriorityMode;
  priorityLevel: PriorityLevel;

  // derived state
  priorityFeeLamports: number;

  // method
  setPriorityFee: (priority: number) => void;
  setPriorityMode: React.Dispatch<React.SetStateAction<PriorityMode>>;
  setPriorityLevel: React.Dispatch<React.SetStateAction<PriorityLevel>>;
  modifyComputeUnitPriceAndLimit: (
    tx: Transaction | VersionedTransaction,
    options: { referenceFee?: number | null; minimumFee?: number | null; requestComputeBudgetLimit?: number },
  ) => Promise<void>;
}

const PrioritizationFeeContext = createContext<PrioritizationFeeContextValue>({
  // state
  priorityFee: PRIORITY_FEE_DEFAULT,
  priorityMode: PRIORITY_MODE_DEFAULT,
  priorityLevel: PRIORITY_LEVEL_DEFAULT,

  // derived state
  priorityFeeLamports: 0,

  // method
  setPriorityFee: () => {},
  setPriorityMode: () => {},
  setPriorityLevel: () => {},
  modifyComputeUnitPriceAndLimit: async () => {},
});

export function PrioritizationFeeContextProvider({ children }: { children: React.ReactNode }) {
  // state
  const [priorityFee, setPriorityFee] = useLocalStorage<number>(
    `${APP_NAME}-global-priority-fee-0.004`,
    PRIORITY_FEE_DEFAULT,
  );
  const [priorityMode, setPriorityMode] = useLocalStorage<PriorityMode>(
    `${APP_NAME}-global-priority-mode`,
    PRIORITY_MODE_DEFAULT,
  );
  const [priorityLevel, setPriorityLevel] = useLocalStorage<PriorityLevel>(
    `${APP_NAME}-global-priority-level`,
    PRIORITY_LEVEL_DEFAULT,
  );

  // derrived state
  const priorityFeeLamports = useMemo(() => toLamports(priorityFee, 9), [priorityFee]); // 1 SOL = 1_000_000_000 lamports

  const modifyComputeUnitPriceAndLimit = useCallback(
    async (
      tx: Transaction | VersionedTransaction,
      options: { referenceFee?: number | null; minimumFee?: number | null; requestComputeBudgetLimit?: number },
    ) => {
      if (priorityFee > 0) {
        const computeUnitLimit = options.requestComputeBudgetLimit || extractComputeUnitLimit(tx) || 1_400_000;
        const userMaxPriorityFee = computePriceMicroLamportsFromFeeLamports(priorityFee * 10 ** 9, computeUnitLimit);

        const minimumFee = options.minimumFee
          ? computePriceMicroLamportsFromFeeLamports(options.minimumFee * 10 ** 9, computeUnitLimit)
          : null;

        let priceMicroLamports = 0;

        const marketAndRpcReference = Math.max(options.referenceFee || 0, minimumFee || 0);

        priceMicroLamports = Math.round(
          priorityMode === 'EXACT' ? userMaxPriorityFee : Math.min(userMaxPriorityFee, marketAndRpcReference),
        );

        if (options.requestComputeBudgetLimit) {
          modifyComputeUnitLimitIx(tx, options.requestComputeBudgetLimit);
        }
        modifyComputeUnitPriceIx(tx, priceMicroLamports);
      }
    },
    [priorityFee, priorityMode],
  );

  return (
    <PrioritizationFeeContext.Provider
      value={{
        priorityFee,
        priorityFeeLamports,
        priorityMode,
        priorityLevel,

        setPriorityFee,
        setPriorityMode,
        setPriorityLevel,

        modifyComputeUnitPriceAndLimit,
      }}
    >
      {children}
    </PrioritizationFeeContext.Provider>
  );
}

// --------------------
// Hook (context)
// --------------------
export const usePrioritizationFee = () => {
  const context = useContext(PrioritizationFeeContext);
  return context;
};
