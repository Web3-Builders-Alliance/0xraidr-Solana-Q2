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
    const { nft } = await metaplex.nfts().create({
      name: "Mr. Rug",
      symbol: "RUG",
      sellerFeeBasisPoints: 300,
      uri: "https://arweave.net/b3G85UseUPrghenUZhe1YVQpl4t9zyzSG0XKkXTg3io",
      creators: [
        {
          address: keypair.publicKey,
          share: 100,
        },
      ],
      isMutable: true,
    });
    console.log(`nft address: ${nft.address.toBase58()}`);
  } catch (error) {
    console.log(`Oops, something went wrong: ${error}`);
  }
})();

// minted rug url! https://solscan.io/token/8xx9mhhhmzVQKMKkN27TYpXnpjQJWE2AsppWytxNUE32?cluster=devnet
