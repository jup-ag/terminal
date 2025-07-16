export declare class TransactionError extends Error {
    txid?: string;
    code?: number;
    programIds?: string[];
    serializedTx?: string;
    
    constructor(
        message: string,
        txid?: string,
        code?: number,
        programIds?: string[],
        serializedTx?: string
    );
}