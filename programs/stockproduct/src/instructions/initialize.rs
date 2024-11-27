use crate::state::*;
use anchor_lang::prelude::*;

// Function to set up a new "box" (account) to store trades
pub fn initialize(ctx: Context<Initialize>, bump: u8) -> Result<()> {
    let store_account = &mut ctx.accounts.store_account; // Grab the "box"
    store_account.products = Vec::new(); // Make sure it's empty and ready for storing trades
    store_account.bump = bump; // Store the bump value in the account
    Ok(())
}

// Defines the rules for setting up the "box" to store trades
#[derive(Accounts)]
#[instruction(bump: u8)] // Pass the bump value as an instruction argument
pub struct Initialize<'info> {
    #[account(
        init, 
        seeds = [b"store_account", user.key().as_ref()], // Seed for deriving PDA
        bump, // Use the bump provided
        payer = user, 
        space = 8 + 1000
    )] // Make space in the "box" for trades
    pub store_account: Account<'info, StoreAccount>, // The "box" itself
    #[account(mut)]
    pub user: Signer<'info>, // The person setting up the "box"
    pub system_program: Program<'info, System>, // Helps with creating the "box"
}