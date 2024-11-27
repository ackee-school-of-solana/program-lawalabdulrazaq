use crate::errors::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;

// Retrieves all products stored in the account
pub fn check_store(ctx: Context<CheckStore>) -> Result<Vec<Store>> {
    let store_account = &ctx.accounts.store_account; // Access the account
    if store_account.products.is_empty() {
        // If the list is empty
        return Err(ErrorCode::NoProducts.into()); // Return an error
    }
    Ok(store_account.products.clone()) // Return a copy of the product list
}


// Defines the rules for looking inside the "box" to get trades
#[derive(Accounts)]
pub struct CheckStore<'info> {
    #[account(
        seeds = [b"store_account", user.key().as_ref()
        ], 
        bump = store_account.bump
    )]
    pub store_account: Account<'info, StoreAccount>, // The "box" holding the trades
    pub user: Signer<'info>, // The user signing the transaction
}
