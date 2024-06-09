pub mod error;
pub mod state;

use smithay::backend::drm::DrmNode;
use smithay::backend::drm::NodeType;
use smithay::backend::egl::context::ContextPriority;
use smithay::backend::libinput::LibinputInputBackend;
use smithay::backend::renderer::multigpu::gbm::GbmGlesBackend;
use smithay::backend::renderer::multigpu::GpuManager;
use smithay::backend::session::libseat::LibSeatSession;
use smithay::backend::session::Session;
use smithay::backend::session::Event as SessionEvent;
use smithay::backend::udev::primary_gpu;
use smithay::backend::udev::all_gpus;
use smithay::backend::udev::UdevBackend;
use smithay::reexports::calloop::EventLoop;
use smithay::reexports::input::Libinput;
use smithay::reexports::wayland_server::Display;

pub use crate::error::*;
use crate::state::ObsidianCompositor;

pub fn main() -> Result<()> {
    env_logger::init();

    let mut event_loop = EventLoop::<ObsidianCompositor>::try_new()?;
    let display = Display::new()?;
    let mut handle = display.handle();

    let ((session, notifier)) = LibSeatSession::new()?;

    let gpu = match primary_gpu(session.seat())? {
        Some(path) => DrmNode::from_path(path)?,
        None => DrmNode::from_path(all_gpus(session.seat())?.get(0).expect("No GPUs found"))?
    };

    let renderer = gpu.node_with_type(NodeType::Render)
        .expect("No Render Node")?;

    let gpu_mgr = GpuManager::new(GbmGlesBackend::with_context_priority(ContextPriority::High))
        .expect("Failed to initialise GPU Manager");
    let udev = UdevBackend::new(session.seat())?;
    let mut input = Libinput::new_with_udev(session.clone().into());

    input.udev_assign_seat(session.seat().as_str())?;

    event_loop
        .handle()
        .insert_source(LibinputInputBackend::new(input.clone()), move |mut e, _, data| {
            let handle = handle.clone();

            // TODO: Handle insert/removal of input devices
        })
        .expect("Failed to insert LibInputBackend");

    event_loop
        .handle()
        .insert_source(notifier, move |e, _, data| match e {
            // TODO: Handle seat events
            _ => {}
        })
        .expect("Failed to insert SeatBackend");

    let devices = udev.device_list()
        .into_iter()
        .map(|(id, path)| DrmNode::from_dev_id(id))
        .collect::<Vec<_>>();

    Ok(())
}
