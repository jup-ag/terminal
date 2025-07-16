export class TransactionError extends Error {
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
    ) {
        super(message);
        this.name = 'TransactionError';
        this.txid = txid;
        this.code = code;
        this.programIds = programIds;
        this.serializedTx = serializedTx;
    }
}