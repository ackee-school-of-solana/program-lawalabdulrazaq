// use crate::state::*;
use anchor_lang::prelude::*;

// A blueprint for what a trade looks like
#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Store {
    pub item: String,   // The thing being traded (e.g., "Yoghurt")
    pub price: String,  // The price (e.g., "2 SOL")
    pub quantity: i64,  // The quantity
    pub entrydate: i64, // When the trade happened (e.g., 1234567890 for a timestamp)
}
