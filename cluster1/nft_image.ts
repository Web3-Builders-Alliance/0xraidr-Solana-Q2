import { Commitment, Connection, Keypair } from "@solana/web3.js";
import wallet from "./wba-wallet.json";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import { readFile } from "fs/promises";

// arweave url https://arweave.net/co0vtiG6FE0HKtcW2nFv9Of_YMradwGMgD3tD-YYrJE

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(keypair))
  .use(
    bundlrStorage({
      address: "https://devnet.bundlr.network",
      providerUrl: "https://api.devnet.solana.com",
      timeout: 60000,
    })
  );

(async () => {
  try {
    let image = await readFile("./images/generug.png");
    let metaplexImg = toMetaplexFile(image, "generug.png");
    const uri = await metaplex.storage().upload(metaplexImg);
    console.log("uri", uri);
  } catch (error) {
    console.log(`Oops, something went wrong: ${error}`);
  }
})();
