import chalk from 'chalk';

import main from './main.js';
import log from './log.js';

const start = new Date();

const success = !!await main(process.argv.slice(1))
    .then(_ => true)
    .catch(err => log.err(err));

if (!success) {
    log.info(`${chalk.red('Build failed')}`);
    process.exit(1);
} else
    log.info(`${chalk.green('Done')} in ${(new Date() - start)}ms`);
