import { TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { ASSOCIATED_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';

const ESCROW_SEED = 'escrow';

interface GetOrCreateATAResponse {
  ataPubKey: PublicKey;
  ix?: TransactionInstruction;
}

export async function getOrCreateATAInstruction(
  connection: Connection,
  tokenMint: PublicKey,
  owner: PublicKey,
  payer: PublicKey = owner,
  allowOwnerOffCurve = true,
): Promise<GetOrCreateATAResponse> {
  try {
    const toAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      tokenMint,
      owner,
      allowOwnerOffCurve,
    );

    const account = await connection.getAccountInfo(toAccount);

    if (account) return { ataPubKey: toAccount, ix: undefined };

    const ix = Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      payer,
      toAccount,
      owner,
      tokenMint,
    );

    return { ataPubKey: toAccount, ix };
  } catch (e) {
    /* handle error */
    console.error('Error::getOrCreateATAInstruction', e);
    throw e;
  }
}

export function deriveEscrow(
  programId: PublicKey,
  user: PublicKey,
  inputMint: PublicKey,
  outputMint: PublicKey,
  uid: BN,
) {
  const uidBuffer = uid.toArrayLike(Buffer, 'le', 8);

  const [dcaPubKey] = PublicKey.findProgramAddressSync(
    [Buffer.from(ESCROW_SEED), user.toBuffer(), inputMint.toBuffer(), outputMint.toBuffer(), uidBuffer],
    programId,
  );

  return dcaPubKey;
}
