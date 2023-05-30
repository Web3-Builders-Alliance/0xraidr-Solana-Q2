import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Escrow } from "../target/types/escrow";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { wallet } from "./wba-wallet";
import { ASSOCIATED_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import {
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import * as spl from "@solana/spl-token";

describe("wba_escrow", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.WbaEscrow as Program<Escrow>;

  const owner = Keypair.fromSecretKey(new Uint8Array(wallet));

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  let connection = new Connection("https://api.devnet.solana.com");

  let escrowState = Keypair.generate();

  const escrowAuth_seeds = [
    Buffer.from("authority"),
    escrowState.publicKey.toBuffer(),
  ];
  const vaultAuth = PublicKey.findProgramAddressSync(
    escrowAuth_seeds,
    program.programId
  )[0];

  const vault_seeds = [Buffer.from("state"), vaultAuth.toBuffer()];
  const vault = PublicKey.findProgramAddressSync(
    escrowAuth_seeds,
    program.programId
  )[0];

  // figure a mint addy

  let mint = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");

  it("Is initialized!", async () => {
    // Add your test here.
    let initializerTokenAcct = await spl.getOrCreateAssociatedTokenAccount(
      connection,
      owner,
      mint,
      owner.publicKey
    );

    // add args to the initialize method
    const tx = await program.methods
      .initialize()
      .accounts({
        initializer: owner.publicKey,
        mint,
        vaultAuthority: vaultAuth,
        vault,
        initializerDepositTokenAccount: initializerTokenAcct.address,
        escrowState: escrowState.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      })
      .signers([owner])
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
