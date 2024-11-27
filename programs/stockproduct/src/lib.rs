use anchor_lang::prelude::*;
pub mod errors;
pub mod state;
pub mod instructions;

use state::*;
use instructions::*;

use anchor_lang::prelude::*;

// The program's unique identifier, kind of like its name tag
declare_id!("865m9ePhc85sKxN5LgTzYkxG3hQWiwgfxfuzGQUjjiCM");

#[program] // This is where the main program lives
pub mod stockproduct {
    use super::*;

    // Function to set up a new "box" (account) to store trades
    pub fn initialize(ctx: Context<Initialize>, bump: u8) -> Result<()> {
        instructions::initialize(ctx, bump);
    }

    // Function to add a trade to the "box"
    pub fn record_incoming(
        ctx: Context<RecordIncoming>,
        item: String,   // Name of what was traded
        price: String,  // How much it cost
        quantity: i64,  // Number of unit goods
        entrydate: i64, // When the trade happened
    ) -> Result<()> {
        instructions::record_incoming(ctx, item, price, quantity, entrydate);
        
    }
    // Function to get all trades saved in the "box"
    pub fn check_store(ctx: Context<CheckStore>) -> Result<Vec<Store>> {
        instructions::check_store(ctx); // Give back a copy of all the saved trades
    }
}

