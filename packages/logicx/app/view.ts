import * as obs from 'obsidian';
import {LogicxFile} from "./LogicxFile.js";

import Logicx, {LOGICX_VIEW} from "./main.js";
import * as wasm from './wasm.js';

export default class LogicxView extends obs.TextFileView implements LogicxFile {

    private logicx: wasm.LogicXContext;

    constructor(leaf: obs.WorkspaceLeaf, private plugin: Logicx) {
        super(leaf);

        this.logicx = new wasm.LogicXContext();
    }

    getViewData(): string {
        console.log("Saving");
        return this.logicx.getData();
    }

    setViewData(data: string, clear: boolean): void {
        this.logicx.setData(data, clear);
    }

    clear(): void {
        this.logicx.clear();
    }

    getViewType(): string {
        return LOGICX_VIEW;
    }

    onload() {
        if (this.contentEl instanceof HTMLDivElement)
            this.logicx.mount(this.contentEl);
        else
            this.logicx.mount(this.contentEl.createDiv());
    }
}