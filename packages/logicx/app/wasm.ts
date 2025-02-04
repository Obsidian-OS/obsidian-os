import mod from 'logicx/logicx_bg.wasm';
import * as util from 'logicx/logicx_bg.js';

const wasm = new WebAssembly.Instance(new WebAssembly.Module(mod), {
    "./logicx_bg.js": util
});

util.__wbg_set_wasm(wasm.exports);

export * from 'logicx/logicx_bg.js';