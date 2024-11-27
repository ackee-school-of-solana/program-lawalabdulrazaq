// use crate::state::*;
use anchor_lang::prelude::*;

// Special messages for when things go wrong
#[error_code]
pub enum ErrorCode {
    #[msg("No Products in Store.")] // Message to show if no trades are found
    NoProducts,
}