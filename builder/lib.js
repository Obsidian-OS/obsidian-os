export * as esbuild from 'esbuild';
export { default as chalk } from 'chalk';
export * as util from './util.js';
export { default as log } from './log.js';
export { default as Path } from './path.js';

import { config } from './main.js';

export const is_source = path => path.startsWith(config.get().root.join("src"));
