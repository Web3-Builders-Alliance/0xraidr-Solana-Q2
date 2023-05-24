//D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o
import { Connection, Keypair, SystemProgram, PublicKey } from "@solana/web3.js";
import {
  Program,
  Wallet,
  AnchorProvider,
  Address,
} from "@project-serum/anchor";
import { WbaVault, IDL } from "./programs/wba_vault";
import wallet from "./wba-wallet.json";

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
const vaultState = Keypair.generate();
console.log(`vaultState keypair: ${vaultState.publicKey.toBase58()}`);

const vaultAuth_seeds = [Buffer.from("auth"), vaultState.publicKey.toBuffer()];
const vaultAuth = PublicKey.findProgramAddressSync(
  vaultAuth_seeds,
  program.programId
)[0];

const vault_seeds = [Buffer.from("vault"), vaultAuth.toBuffer()];
const vault = PublicKey.findProgramAddressSync(
  vault_seeds,
  program.programId
)[0];
//

// Execute our enrollment transaction
(async () => {
  try {
    const txhash = await program.methods
      .initialize()
      .accounts({
        owner: keypair.publicKey,
        vaultState: vaultState.publicKey,
        vaultAuth: vaultAuth,
        vault: vault,
        systemProgram: SystemProgram.programId,
      })
      .signers([keypair, vaultState])
      .rpc();
    console.log(`Success! Check out your TX here: 
      https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
  console.log(keypair.publicKey);
})();
