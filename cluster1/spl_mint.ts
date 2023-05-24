import {
  Keypair,
  PublicKey,
  Connection,
  Commitment,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import wallet from "./wba-wallet.json";

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// const token_decimals = 1_000_000n;
const amount = 1 * 1000000;

// Mint address
const mint = new PublicKey("EiWe84AQUoXggQLCqawcUyM4hdxY2ajsZqgge26BXKox");

(async () => {
  try {
    let ata = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      mint,
      keypair.publicKey
    );
    console.log(ata.address.toBase58());
    let sendToken = await mintTo(
      connection,
      keypair,
      mint,
      ata.address,
      keypair,
      amount
    );
    console.log(ata.amount);
    console.log(ata.address);
  } catch (error) {
    console.log(`Oops, something went wrong: ${error}`);
  }
})();
