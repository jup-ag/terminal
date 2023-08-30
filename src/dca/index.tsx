import { Program } from '@coral-xyz/anchor';
import { DCA, DCA_PROGRAM_ID_BY_CLUSTER } from '@jup-ag/dca-sdk';
import { web3 } from '@project-serum/anchor';
import { ASSOCIATED_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import { NATIVE_MINT, TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import { ComputeBudgetProgram, Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import BN from 'bn.js';
import { deriveEscrow, getOrCreateATAInstruction } from './helpers';
import { DcaIntegration } from './idl';

export async function setupDCA({
  program,
  dcaClient,
  connection,
  userPublicKey,
  userInTokenAccount,
  inputMint,
  outputMint,
  inAmount,
  inAmountPerCycle,
  cycleSecondsApart,
}: {
  program: Program<DcaIntegration>;
  dcaClient: DCA;
  connection: Connection;
  userPublicKey: PublicKey;
  userInTokenAccount: PublicKey;
  inputMint: PublicKey;
  outputMint: PublicKey;
  inAmount: BN;
  inAmountPerCycle: BN;
  cycleSecondsApart: BN;
}): Promise<Transaction> {
  const uid = new BN(parseInt((Date.now() / 1000).toString()));
  const escrow = deriveEscrow(program.programId, userPublicKey, inputMint, outputMint, uid);
  const dcaPubKey = await dcaClient.getDcaPubKey(escrow, inputMint, outputMint, uid);

  const preInstructions: TransactionInstruction[] = [
    ComputeBudgetProgram.setComputeUnitLimit({
      units: 500_000,
    }),
  ];

  if (inputMint.equals(NATIVE_MINT)) {
    const { ataPubKey, ix } = await getOrCreateATAInstruction(connection, inputMint, userPublicKey);
    const transferIx = web3.SystemProgram.transfer({
      fromPubkey: userPublicKey,
      lamports: new BN(inAmount).toNumber(),
      toPubkey: ataPubKey,
    });
    // This is not exposed by the types, but indeed it exists
    const syncNativeIX = (Token as any).createSyncNativeInstruction(ataPubKey);

    if (ix) {
      preInstructions.push(ix);
    }
    preInstructions.push(transferIx);
    preInstructions.push(syncNativeIX);
  }

  console.log({
    user: userPublicKey,
    userTokenAccount: userInTokenAccount,
    jupDcaProgram: DCA_PROGRAM_ID_BY_CLUSTER['mainnet-beta'],
    jupDca: dcaPubKey,
    jupDcaInAta: await Token.getAssociatedTokenAddress(
      ASSOCIATED_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      inputMint,
      dcaPubKey,
      true,
    ),
    jupDcaOutAta: await Token.getAssociatedTokenAddress(
      ASSOCIATED_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      outputMint,
      dcaPubKey,
      true,
    ),
    jupDcaEventAuthority: new PublicKey('Cspp27eGUDMXxPEdhmEXFVRn6Lt1L7xJyALF3nmnWoBj'),
    escrow,
    escrowInAta: await Token.getAssociatedTokenAddress(
      ASSOCIATED_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      inputMint,
      escrow,
      true,
    ),
    escrowOutAta: await Token.getAssociatedTokenAddress(
      ASSOCIATED_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      outputMint,
      escrow,
      true,
    ),
    inputMint: inputMint,
    outputMint: outputMint,
  });

  const tx = await program.methods
    .setupDca(uid, inAmount, inAmountPerCycle, cycleSecondsApart, null, null, null)
    .accounts({
      user: userPublicKey,
      userTokenAccount: userInTokenAccount,
      jupDcaProgram: DCA_PROGRAM_ID_BY_CLUSTER['mainnet-beta'],
      jupDca: dcaPubKey,
      jupDcaInAta: await Token.getAssociatedTokenAddress(
        ASSOCIATED_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        inputMint,
        dcaPubKey,
        true,
      ),
      jupDcaOutAta: await Token.getAssociatedTokenAddress(
        ASSOCIATED_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        outputMint,
        dcaPubKey,
        true,
      ),
      jupDcaEventAuthority: new PublicKey('Cspp27eGUDMXxPEdhmEXFVRn6Lt1L7xJyALF3nmnWoBj'),
      escrow,
      escrowInAta: await Token.getAssociatedTokenAddress(
        ASSOCIATED_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        inputMint,
        escrow,
        true,
      ),
      escrowOutAta: await Token.getAssociatedTokenAddress(
        ASSOCIATED_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        outputMint,
        escrow,
        true,
      ),
      inputMint: inputMint,
      outputMint: outputMint,
    })
    .preInstructions(preInstructions)
    .transaction();

  return tx;
}

export async function close({
  program,
  dcaClient,
  connection,
  userPublicKey,
  dca,
  escrow,
  inputMint,
  outputMint,
}: {
  program: Program<DcaIntegration>;
  dcaClient: DCA;
  connection: Connection;
  userPublicKey: PublicKey;
  dca: PublicKey;
  escrow: PublicKey;
  inputMint: PublicKey;
  outputMint: PublicKey;
}): Promise<Transaction> {
  const tx = await program.methods
    .close()
    .accounts({
      inputMint,
      outputMint,
      user: userPublicKey,
      userTokenAccount: await Token.getAssociatedTokenAddress(
        ASSOCIATED_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        outputMint,
        userPublicKey,
        false,
      ),
      escrow,
      dca,
      escrowInAta: await Token.getAssociatedTokenAddress(
        ASSOCIATED_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        inputMint,
        escrow,
        true,
      ),
      escrowOutAta: await Token.getAssociatedTokenAddress(
        ASSOCIATED_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        outputMint,
        escrow,
        true,
      ),
    })
    .transaction();
  return tx;
}

async function findByUser(program: Program<DcaIntegration>, user: PublicKey) {
  return program.account.escrow.all([
    {
      memcmp: {
        offset: 8 + 8,
        bytes: user.toBase58(),
      },
    },
  ]);
}
