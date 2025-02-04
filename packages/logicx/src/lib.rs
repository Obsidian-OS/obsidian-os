pub mod error;
mod project;
mod circuit;
mod component;

use std::cell::RefCell;
use std::rc::Rc;
use std::sync::{Arc, RwLock};
use leptos::wasm_bindgen::prelude::*;
use leptos::web_sys::*;
use leptos::*;
use leptos::prelude::*;
pub use error::*;
use crate::project::Project;

#[wasm_bindgen(js_name=LogicXContext)]
pub struct LogicX {
    project: RwSignal<Project>,
    state: RwSignal<State>
}

#[wasm_bindgen(js_class=LogicXContext)]
impl LogicX {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            project: RwSignal::new(Project::empty()),
            state: RwSignal::new(State {
                grid_scale: 35.0,
                scroll: (0.0, 0.0),
                snap: true
            })
        }
    }

    #[wasm_bindgen]
    pub fn mount(&self, root: HtmlDivElement) {
        std::panic::set_hook(Box::new(console_error_panic_hook::hook));

        root.set_inner_html("");

        let project = self.project.clone();
        let state = self.state.clone();

        mount_to(root.unchecked_into(), move || view!(<ContextProvider cx=state.clone()>
            <ContextProvider cx=project.clone()>
                <Project />
            </ContextProvider>
        </ContextProvider>)).forget();
    }


    #[wasm_bindgen(js_name=getData)]
    pub fn get_data(&self) -> String {
        serde_json::to_string_pretty(&self.project)
            .unwrap_throw()
    }

    #[wasm_bindgen(js_name=setData)]
    pub fn set_data(&mut self, data: String, clear: bool) {
        if let Ok(project) = serde_json::from_str(data.as_str()) {
            if clear {
                self.clear();
            }

            self.project = project;
        }
    }

    #[wasm_bindgen(js_name=clear)]
    pub fn clear(&mut self) {
        self.project.set(Project::empty());

        // if let Some(project) = Arc::get_mut(&mut self.project) {
        //     *project = Project::empty();
        // }
    }
}

pub struct State {
    pub scroll: (f64, f64),
    pub grid_scale: f64,
    pub snap: bool,
}

#[component]
pub fn context_provider<T: Send + Sync + 'static>(cx: T, children: Children) -> impl IntoView {
    provide_context(cx);

    children()
}

