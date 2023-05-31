use anchor_spl::token::TokenAccount;

use {
    anchor_lang::prelude::*,
    anchor_spl::{
        token,
        associated_token,
    },
};
use anchor_spl::token::Token;

declare_id!("4h6B2zVorFm3F9Ab1QVfC191Gaj648Bh8oFrvWDMP2yG");

#[program]
pub mod missions_game {


    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.vault_state.owner = *ctx.accounts.owner.key;
        ctx.accounts.vault_state.auth_bump = *ctx.bumps.get("vault_auth").unwrap();
        ctx.accounts.vault_state.vault_bump = *ctx.bumps.get("vault").unwrap();
        ctx.accounts.vault_state.score = 0;
        Ok(())
    }

pub fn deposit(
    ctx: Context<DepositSpl>, 
    quantity: u64,
    // mission_choice: u8,
) -> Result<()> {
    // require!( mission_choice == 0 || mission_choice == 1, MissionError::InvalidMissionChoice);

    // let mission_choice_text = match mission_choice {
    //     0 => "Mission 1",
    //     1 => "Mission 2",
    //     _ => "Error" //let's add error handle
    // }.to_string();

    // msg!("Player chose {}", mission_choice_text);
    msg!("Transferring token(s)...");
    msg!("Mint: {}", &ctx.accounts.token_mint.to_account_info().key());   
    msg!("From Token Address: {}", &ctx.accounts.owner_ata.key());     
    msg!("To Token Address: {}", &ctx.accounts.vault_ata.key());     
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.owner_ata.to_account_info(),
                to: ctx.accounts.vault_ata.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        ),
        quantity,
    )?;



    msg!("Tokens transferred successfully.");

    Ok(())
}

pub fn withdraw(
    ctx: Context<WithdrawSpl>, 
    quantity: u64,
) -> Result<()> {

    msg!("Transferring tokens...");
    msg!("Mint: {}", &ctx.accounts.token_mint.to_account_info().key());   
    msg!("From Token Address: {}", &ctx.accounts.vault_ata.key());     
    msg!("To Token Address: {}", &ctx.accounts.owner_ata.key());

// Create the PDA Seeds! This seeds variable needs 3 values, 1. The seed string of the "vault_auth",
// 2. The vault_state.key(), and 3. The vault_state.auth_bump from the VaultState struct!
    let seeds = &["auth".as_bytes(), 
    &ctx.accounts.vault_state.key().clone().to_bytes(), 
    &[ctx.accounts.vault_state.auth_bump]];  

    let signer_seeds = &[&seeds[..]];

let cpi_program = ctx.accounts.token_program.to_account_info();
let cpi_accounts = token::Transfer{
    from: ctx.accounts.vault_ata.to_account_info(),
    to: ctx.accounts.owner_ata.to_account_info(),
    authority: ctx.accounts.vault_auth.to_account_info()
};
let cpi_context = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
token::transfer(cpi_context, quantity)?;

    msg!("Tokens Withdrawn successfully.");
    Ok(())
}
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(init, payer = owner, space = 8 + 32 + 3)]
    pub vault_state: Account<'info, VaultState>,
    #[account(seeds = [b"auth", vault_state.key().as_ref()], bump)]
    ///CHECK: NO NEED TO CHECK THIS
    pub vault_auth:  UncheckedAccount<'info,>,
    #[account(mut, seeds = [b"vault", vault_auth.key().as_ref()], bump)]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositSpl<'info> {
    #[account(mut, has_one = owner)]
    vault_state: Account<'info, VaultState>,
    #[account(seeds = [b"auth", vault_state.key().as_ref()], bump)]
    /// CHECK Dont need to check this
    vault_auth: UncheckedAccount<'info>,
    #[account(mut)]
    owner_ata: Account<'info, TokenAccount>,
    #[account(mut)]
    vault_ata: Account<'info, TokenAccount>,
    /// CHECK Dont need to check this
    token_mint: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    #[account(mut)]
    pub owner: Signer<'info>
}

#[derive(Accounts)]
pub struct WithdrawSpl<'info> {
    #[account(mut, has_one = owner)]
    vault_state: Account<'info, VaultState>,
    #[account(seeds = [b"auth", vault_state.key().as_ref()], bump)]
    /// CHECK Dont need to check this
    vault_auth: UncheckedAccount<'info>,
    #[account(mut)]
    owner_ata: Account<'info, TokenAccount>,
    #[account(mut)]
    vault_ata: Account<'info, TokenAccount>,
    /// CHECK Dont need to check this
    token_mint: UncheckedAccount<'info>,
    /// CHECK Dont need to check this
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    #[account(mut)]
    owner: Signer<'info>
}

#[error_code] 
pub enum MissionError {
    #[msg("Choose a valid Mission!")]
    InvalidMissionChoice,
}


#[account]
pub struct VaultState {
    owner: Pubkey,
    auth_bump: u8,
    vault_bump: u8,
    score: u8
}