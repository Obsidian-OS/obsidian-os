pub mod error;
pub use error::*;

pub fn main() -> Result<()> {
    env_logger::init();

    Ok(())
}
