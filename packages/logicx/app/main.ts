import * as obs from 'obsidian';

import LogicxView from "./view.js";
import SettingsTab from "./settings.js";

export const LOGICX_VIEW = "logicx-view";

export interface Settings {

}

export const default_settings: Settings = {

};

export default class Logicx extends obs.Plugin {

    settingsTab: SettingsTab | null = null;
    settings: Settings = default_settings;

    async onload() {
        this.registerView(LOGICX_VIEW, leaf => new LogicxView(leaf, this));
        this.registerExtensions(["logicx", "logic"], LOGICX_VIEW);

        this.addSettingTab(new SettingsTab(this.app, this));
    }
}