use crate::state::*;
use anchor_lang::prelude::*;

// The "box" that stores all the trades
#[account]
pub struct StoreAccount {
    pub products: Vec<Store>, // A list of all the trades
    pub bump: u8,             // The bump seed for PDA
}
