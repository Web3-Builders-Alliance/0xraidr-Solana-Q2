import {
  Commitment,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import wallet from "./wba-wallet.json";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import {
  createCreateMetadataAccountV2Instruction,
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import * as spl from "@solana/spl-token";

// keypair pubkey 6X9xwDPUGD6azipUmNPiW3daf3zaAebDNqY6G7JpeQop

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("EiWe84AQUoXggQLCqawcUyM4hdxY2ajsZqgge26BXKox");

// Recipient address
const to = new PublicKey("8NJZzogzzDbcuiEcZT3Azrs9fZPFirGDnKUCBDJLue58");

const token_decimals = 1_000_000n;

(async () => {
  try {
    // Get the token account of the fromWallet address, and if it does not exist, create it
    let fromWalletAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );
    // Get the token account of the toWallet address, and if it does not exist, create it
    let toWalletAta = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      to
    );
    // Transfer the new token to the "toTokenAccount" we just created
    let tx = await transfer(
      connection,
      keypair,
      fromWalletAta.address,
      toWalletAta.address,
      keypair,
      500000
    );
    console.log(fromWalletAta.address.toBase58());
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();

// successful transfer
//https://solscan.io/tx/3JXfYMRo3F5MTgYXMpwfFs4aDpAR9V1LCUNtH5Q6mnnPyug4xugqrWGhLwpHBPsy6y7DKiGpu5oRnFV71vc9H7Y8?cluster=devnet
