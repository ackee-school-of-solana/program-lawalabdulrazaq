use crate::state::*;
use anchor_lang::prelude::*;

// Records a new product in the store
pub fn record_incoming(
    ctx: Context<RecordIncoming>,
    item: String,   // Product name
    price: String,  // Product price
    quantity: i64,  // Quantity of the product
    entrydate: i64, // Timestamp of when it was added
) -> Result<()> {
    let store_account = &mut ctx.accounts.store_account; // Access the account
    let store = Store { item, price, quantity, entrydate }; // Create a new product record
    store_account.products.push(store); // Add the record to the list
    Ok(())
}

// Defines the rules for adding a trade to the "box"
#[derive(Accounts)]
pub struct RecordIncoming<'info> {
    #[account(mut, seeds = [b"store_account", user.key().as_ref()], bump = store_account.bump)]
    pub store_account: Account<'info, StoreAccount>, // The "box" where trades are stored
    pub user: Signer<'info>, // The user signing the transaction
}
