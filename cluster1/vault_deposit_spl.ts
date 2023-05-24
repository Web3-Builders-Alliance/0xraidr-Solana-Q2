//D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o
import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  Program,
  Wallet,
  AnchorProvider,
  Address,
  BN,
} from "@project-serum/anchor";
import { WbaVault, IDL } from "./programs/wba_vault";
import wallet from "./wba-wallet.json";
import {
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Github account
const github = Buffer.from("https://github.com/0xraidr", "utf8");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment: "confirmed",
});

// Create our program
const program = new Program<WbaVault>(
  IDL,
  "D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o" as Address,
  provider
);
// done in class
const vaultState = new PublicKey(
  "7yWHEVtAukJefmr9i4H8rYNbcWqeW1LhXSVD4RKh4bme"
);

const vaultAuth_seeds = [Buffer.from("auth"), vaultState.toBuffer()];
const vaultAuth = PublicKey.findProgramAddressSync(
  vaultAuth_seeds,
  program.programId
)[0];

const vault_seeds = [Buffer.from("vault"), vaultAuth.toBuffer()];

// const vault = PublicKey.findProgramAddressSync(
//   vault_seeds,
//   program.programId
// )[0];

//

// Execute our enrollment transaction
(async () => {
  try {
    // Mint address
    const mint = new PublicKey("EiWe84AQUoXggQLCqawcUyM4hdxY2ajsZqgge26BXKox");

    let ownerAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );

    let vaultAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      vaultAuth,
      true
    );

    const txhash = await program.methods
      .depositSpl(new BN(0.1 * LAMPORTS_PER_SOL))
      .accounts({
        owner: keypair.publicKey,
        vaultState: vaultState,
        vaultAuth,
        systemProgram: SystemProgram.programId,
        ownerAta: ownerAta.address,
        vaultAta: vaultAta.address,
        tokenMint: mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([keypair])
      .rpc();
    console.log(`Success! Check out your TX here: 
        https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
  console.log(keypair.publicKey);
})();
