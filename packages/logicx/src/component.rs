use std::sync::Arc;
use leptos::logging;
use leptos::prelude::*;
use crate::project::{Component, Placement, Project};
use crate::project::ComponentDriver;
use crate::State;

#[component]
pub fn logicx_component(placement: Placement) -> impl IntoView {

    let project = use_context::<RwSignal<Project>>()
        .expect("Failed to get project");

    let state = use_context::<RwSignal<State>>()
        .expect("Failed to get state");

    let inputs = move || project.with(|project| project.components
        .get(&placement.component)
        .map(|i| i.inputs.len())
        .unwrap_or(0));
    let outputs = move || project.with(|project| project.components
        .get(&placement.component)
        .map(|i| i.outputs.len())
        .unwrap_or(0));

    view!(<svg class="logicx_component" x={move || placement.pos.0 * state.read().grid_scale} y={move || placement.pos.1 * state.read().grid_scale}>

        <rect class="logicx-component-outline" rx=5
              width={move || inputs().max(outputs()).max(1) as f64 * state.read().grid_scale}
              height={move || inputs().min(outputs()).max(1) as f64 * state.read().grid_scale}>

        </rect>

        {placement.label.map(|label| view!(<text x=10 y=10>{label}</text>))}
    </svg>)

}
