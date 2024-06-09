#![allow(irrefutable_let_patterns)]

mod handlers;

mod grabs;
mod input;
mod state;
mod winit;

use smithay::{
    reexports::calloop::EventLoop, reexports::wayland_server::Display,
    reexports::wayland_server::DisplayHandle,
};

pub use state::Smallvil;

pub struct CalloopData {
    state: Smallvil,
    display_handle: DisplayHandle,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    if let Ok(env_filter) = tracing_subscriber::EnvFilter::try_from_default_env() {
        tracing_subscriber::fmt().with_env_filter(env_filter).init();
    } else {
        tracing_subscriber::fmt().init();
    }

    let mut event_loop: EventLoop<CalloopData> = EventLoop::try_new()?;

    let display: Display<Smallvil> = Display::new()?;
    let display_handle = display.handle();
    let state = Smallvil::new(&mut event_loop, display);

    let mut data = CalloopData {
        state,
        display_handle,
    };

    crate::winit::init_winit(&mut event_loop, &mut data)?;

    // Launch Obsidian here

    event_loop.run(None, &mut data, move |_| {
        // Smallvil is running
    })?;

    Ok(())
}
