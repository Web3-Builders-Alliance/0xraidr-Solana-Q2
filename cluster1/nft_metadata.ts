import { Commitment, Connection, Keypair } from "@solana/web3.js";
import wallet from "./wba-wallet.json";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import { readFile } from "fs/promises";

// arweave image url https://arweave.net/co0vtiG6FE0HKtcW2nFv9Of_YMradwGMgD3tD-YYrJE

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

let imgUrl = "https://arweave.net/co0vtiG6FE0HKtcW2nFv9Of_YMradwGMgD3tD-YYrJE";

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
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: "Mr. Rug",
      symbol: "RUG",
      description: "The Most Comfy Rug!",
      seller_fee_basis_points: 300,
      image: imgUrl,
      attributes: [
        {
          trait_type: "Feature",
          value: "COOL",
        },
        {
          trait_type: "Softness",
          value: "Super",
        },
        {
          trait_type: "Style",
          value: "Pixelated",
        },
      ],
      properties: {
        files: [
          {
            type: "image/png",
            uri: "https://arweave.net/co0vtiG6FE0HKtcW2nFv9Of_YMradwGMgD3tD-YYrJE",
          },
        ],
        creators: [
          {
            address: keypair.publicKey.toBase58(),
            share: 100,
          },
        ],
      },
    });
    console.log(`uri: ${uri}`);
  } catch (error) {
    console.log(`Oops, something went wrong: ${error}`);
  }
})();
