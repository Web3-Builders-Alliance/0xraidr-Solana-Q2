import {
  Commitment,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import wallet from "./wba-wallet.json";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

// keypair pubkey 6X9xwDPUGD6azipUmNPiW3daf3zaAebDNqY6G7JpeQop

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Define our Mint address
const mint = new PublicKey("EiWe84AQUoXggQLCqawcUyM4hdxY2ajsZqgge26BXKox");

// Add the Token Metadata Program
const token_metadata_program_id = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// Create PDA for token metadata
const metadata_seeds = [
  Buffer.from("metadata"),
  token_metadata_program_id.toBuffer(),
  mint.toBuffer(),
];
const [metadata_pda, _bump] = PublicKey.findProgramAddressSync(
  metadata_seeds,
  token_metadata_program_id
);

(async () => {
  try {
    // Start here
    let metadataIx = new Transaction().add(
      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadata_pda,
          mint: mint,
          mintAuthority: keypair.publicKey,
          payer: keypair.publicKey,
          updateAuthority: keypair.publicKey,
        },
        {
          createMetadataAccountArgsV3: {
            data: {
              name: "raidr Token!",
              symbol: "raidr",
              uri: "https://madlads.s3.us-west-2.amazonaws.com/json/8476.json",
              sellerFeeBasisPoints: 1000,
              creators: [
                {
                  address: keypair.publicKey,
                  verified: true,
                  share: 100,
                },
              ],
              collection: {
                verified: true,
                key: mint,
              },
              uses: null,
            },
            isMutable: true,
            collectionDetails: null,
          },
        },
        token_metadata_program_id
      )
    );

    // //  sign txn
    // metadataIx.recentBlockhash = (
    //   await connection.getLatestBlockhash()
    // ).blockhash;
    // await metadataIx.sign(keypair);

    // send txn
    let signature = await sendAndConfirmTransaction(connection, metadataIx, [
      keypair,
    ]);

    console.log("Transaction Hash:", signature);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
