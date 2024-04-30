import {
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from 'src/hooks/useLocalStorage';
import { toLamports } from 'src/misc/utils';

// --------------------
// Constants
// --------------------
const APP_NAME = 'jupiter-terminal';

const COMPUTE_UNIT_MAX_LIMIT = 1_400_000;
const COMPUTE_UNIT_LIMIT_MARGIN_ERROR = 1.2;

const PRIORITY_FEE_DEFAULT: number = 0.000_3;
const PRIORITY_LEVEL_DEFAULT: PriorityLevel = 'MEDIUM';
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

interface GetSimulationUnitsPayload {
  connection: Connection;
  instructions: TransactionInstruction[];
  payer: PublicKey;
  lookupTables: AddressLookupTableAccount[];
}

/**
 *
 * Code snippets from the Solana documentation
 * @see https://solana.com/developers/guides/advanced/how-to-request-optimal-compute#how-to-request-compute-budget
 */
const getSimulationUnits = async (payload: GetSimulationUnitsPayload) => {
  const { connection, instructions, payer, lookupTables } = payload;

  const testInstructions = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: COMPUTE_UNIT_MAX_LIMIT }),
    ...instructions,
  ];

  const testVersionedTxn = new VersionedTransaction(
    new TransactionMessage({
      instructions: testInstructions,
      payerKey: payer,
      recentBlockhash: PublicKey.default.toString(),
    }).compileToV0Message(lookupTables),
  );

  const simulation = await connection.simulateTransaction(testVersionedTxn, {
    replaceRecentBlockhash: true,
    sigVerify: false,
  });
  if (simulation.value.err) {
    return undefined;
  }
  return simulation.value.unitsConsumed;
};

const addMarginErrorForComputeUnitLimit = (units: number, margin: number) => Math.floor(units * margin);

// --------------------
// Context
// --------------------
interface GetOptimalComputeUnitLimitAndPricePayload extends GetSimulationUnitsPayload {
  referenceFee: number;
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
  getOptimalComputeUnitLimitAndPrice: (payload: GetOptimalComputeUnitLimitAndPricePayload) => Promise<{
    units: number;
    microLamports: number;
  }>;
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
  getOptimalComputeUnitLimitAndPrice: async () => ({ units: 0, microLamports: 0 }),
});

export function PrioritizationFeeContextProvider({ children }: { children: React.ReactNode }) {
  // state
  const [priorityFee, setPriorityFee] = useLocalStorage<number>(
    `${APP_NAME}-global-priority-fee`,
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

  const getOptimalComputeUnitLimitAndPrice = async (payload: GetOptimalComputeUnitLimitAndPricePayload) => {
    // Unit
    const simulationUnits = await getSimulationUnits(payload);
    /**
     * Best practices to always add a margin error to the simulation units (10% ~ 20%)
     * @see https://solana.com/developers/guides/advanced/how-to-request-optimal-compute#special-considerations
     */
    const simulationUnitsWithMarginError = addMarginErrorForComputeUnitLimit(
      simulationUnits ?? 0,
      COMPUTE_UNIT_LIMIT_MARGIN_ERROR,
    );

    // Price
    const userPriorityFeeMicroLamports = computePriceMicroLamportsFromFeeLamports(
      priorityFeeLamports,
      simulationUnitsWithMarginError,
    );
    /**
     * > If the user has selected `EXACT` mode, then the price should be the user's priority fee.
     * > If the user has selected `MAX` mode, then the price should be the
     *   minimum of the user's priority fee and the market reference fee.
     */
    const priceMicroLamports = Math.round(
      priorityMode === 'EXACT'
        ? userPriorityFeeMicroLamports
        : Math.min(userPriorityFeeMicroLamports, payload.referenceFee),
    );

    return {
      // `computeUnitLimit`
      units: simulationUnitsWithMarginError,
      // `computeUnitPrice`
      microLamports: priceMicroLamports,
    };
  };

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
        getOptimalComputeUnitLimitAndPrice,
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
