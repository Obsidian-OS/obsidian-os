import util from 'node:util';
import chalk from 'chalk';

import { config } from './main.js';

export const stripAnsi = str => str.replace(/[\u001b\u009b][[()#;?]*(?:\d{1,4}(?:;\d{0,4})*)?[\dA-ORZcf-nqry=><]/g, '');
export const centre = (text, width) => {
    const colourless = stripAnsi(text);
    const pad = Math.floor((width - colourless.length) / 2);
    return `${' '.repeat(pad)}${text}${' '.repeat(pad)}`.padStart(width, ' ');
}
export function stdout(tag, ...msg) {
    const log = msg
        .map(i => ['string', 'number', 'bigint', 'boolean'].includes(typeof i) ? i : util.inspect(i, false, null, true))
        .join(' ')
        .split('\n')
        .map((i, a) => `${a ? centre('\u2502', stripAnsi(tag).length) : tag} ${i}\n`);

    for (const i of log)
        process.stdout.write(i);
}

export function stderr(tag, ...msg) {
    const log = msg
        .map(i => ['string', 'number', 'bigint', 'boolean'].includes(typeof i) ? i : util.inspect(i, false, null, true))
        .join(' ')
        .split('\n')
        .map((i, a) => `${a ? centre('\u2502', stripAnsi(tag).length) : tag} ${i}\n`);

    for (const i of log)
        process.stderr.write(i);
}

export default {
    err: (...arg) => void     (['err', 'info', 'verbose', 'debug'].includes(config.get().logLevel) && stderr(chalk.grey(`[${chalk.red('Error')}]`), ...arg)),
    info: (...arg) => void    (['info', 'verbose', 'debug'].includes(config.get().logLevel) && stdout(chalk.grey(`[${chalk.blue('Info')}]`), ...arg)),
    verbose: (...arg) => void (['verbose', 'debug'].includes(config.get().logLevel) && stdout(chalk.grey(`[${chalk.yellow('Verbose')}]`), ...arg)),
    debug: (...arg) => void   (['debug'].includes(config.get().logLevel) && stdout(chalk.grey(`[${chalk.cyan('Debug')}]`), ...arg))
}