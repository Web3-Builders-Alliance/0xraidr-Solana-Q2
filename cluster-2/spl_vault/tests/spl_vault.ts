import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
import { Program } from "@project-serum/anchor";
import { SplVault } from "../target/types/missions_game";
import * as Token from "@solana/spl-token";
import * as utils from "../test_utils/utils";
import chai, { assert, expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { wallet } from "dev-wallet";
import { ASSOCIATED_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import * as spl from "@solana/spl-token";
import {
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";

chai.use(chaiAsPromised);

describe("SplVault", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.MissionsGame as Program<SplVault>;
  const provider = utils.getProvider();
  let connection = new Connection("https://api.devnet.solana.com");

  // We're going to import our keypair from the wallet file
  const owner = Keypair.fromSecretKey(new Uint8Array(wallet));

  const vaultState = Keypair.generate();

  // the spl mint address
  const mint = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");

  const vaultAuth_seeds = [
    Buffer.from("auth"),
    vaultState.publicKey.toBuffer(),
  ];
  const vaultAuth = PublicKey.findProgramAddressSync(
    vaultAuth_seeds,
    program.programId
  )[0];

  const vault_seeds = [Buffer.from("vault"), vaultAuth.toBuffer()];
  const vault = PublicKey.findProgramAddressSync(
    vault_seeds,
    program.programId
  )[0];

  it("Is initialized!", async () => {
    // try {
    const txhash = await program.methods
      .initialize()
      .accounts({
        owner: owner.publicKey,
        vaultState: vaultState.publicKey,
        vaultAuth: vaultAuth,
        vault: vault,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner, vaultState])
      .rpc();
    console.log(`Success! Check out your TX here:
        https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    // } catch (e) {
    //   console.error(`Oops, something went wrong: ${e}`);
    // }
  });

  it("Deposit SPL!", async () => {
    // REMEMBER!!! THE "ALLOW OWNER OFF CURVE" BOOLEAN PARAMETER!!! THIS IS TO GET OR CREATE AN ATA FROM A PDA!!!
    let vaultAta = await spl.getOrCreateAssociatedTokenAccount(
      connection,
      owner,
      mint,
      vaultAuth,
      true
    );

    let ownerAta = await spl.getOrCreateAssociatedTokenAccount(
      connection,
      owner,
      mint,
      owner.publicKey
    );

    const sx = await program.methods
      .deposit(new anchor.BN(1 * 1_000_000))
      .accounts({
        owner: owner.publicKey,
        vaultState: vaultState.publicKey,
        vaultAuth,
        systemProgram: SystemProgram.programId,
        ownerAta: ownerAta.address,
        vaultAta: vaultAta.address,
        tokenMint: mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([owner])
      .rpc();

    console.log(`Success! Check out your TX here:
      https://explorer.solana.com/tx/${sx}?cluster=devnet`);
  });

  it("Withdraw SPL!", async () => {
    // REMEMBER!!! THE "ALLOW OWNER OFF CURVE" BOOLEAN PARAMETER!!! THIS IS TO GET OR CREATE AN ATA FROM A PDA!!!
    let vaultAta = await spl.getOrCreateAssociatedTokenAccount(
      connection,
      owner,
      mint,
      vaultAuth,
      true
    );

    let ownerAta = await spl.getOrCreateAssociatedTokenAccount(
      connection,
      owner,
      mint,
      owner.publicKey
    );

    const sx = await program.methods
      .withdraw(new anchor.BN(1 * 1_000_000))
      .accounts({
        owner: owner.publicKey,
        vaultState: vaultState.publicKey,
        vaultAuth,
        systemProgram: SystemProgram.programId,
        ownerAta: ownerAta.address,
        vaultAta: vaultAta.address,
        tokenMint: mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([owner])
      .rpc();
    console.log(`Success! Check out your TX here:
      https://explorer.solana.com/tx/${sx}?cluster=devnet`);
  });

  it("Confirm Addresses!", async () => {
    let vaultAta = await spl.getOrCreateAssociatedTokenAccount(
      connection,
      owner,
      mint,
      vault,
      true
    );

    let ownerAta = await spl.getOrCreateAssociatedTokenAccount(
      connection,
      owner,
      mint,
      owner.publicKey
    );

    console.log(`HODLERS PUBKEY: ${owner.publicKey}`);
    console.log(`vaultAta: ${vaultAta.address}`);
    console.log(`vaultPubkey: ${vault.toBase58()}`);
    console.log(`vaultState Pubkey: ${vaultState.publicKey.toBase58()}`);
    console.log(`HOLDERS ATA: ${ownerAta.address.toBase58()}`);
    console.log(`VaultAuth: ${vaultAuth.toBase58()}`);
  });
});
