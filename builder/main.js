import * as fs from 'node:fs/promises';
import State from '@j-cake/jcake-utils/state';
import {iterSync} from '@j-cake/jcake-utils/iter';
import * as Format from '@j-cake/jcake-utils/args';
import chalk from 'chalk';

import log from './log.js';
import Path from './path.js';

export const config = new State({
    logLevel: 'info',
    force: false,

    root: new Path(process.cwd()),
    out: new Path(process.cwd()).concat('build'),

    components: null,

    selected: []
});

export default async function main(argv) {
    const logLevel = Format.oneOf(Object.keys(log), false);

    for (const {current: i, skip: next} of iterSync.peekable(argv))
        if (i === '--log-level')
            config.setState({logLevel: logLevel(next())});

        else if (i === '-f' || i === '--force')
            config.setState({force: true});

        else if (i === '-o' || i === '--out')
            config.setState({out: new Path(next())});

        else if (i === '-b' || i === '--build')
            config.setState({components: await import(next()).then(components => components.default)});

        else
            config.setState(prev => ({selected: [...prev.selected, i]}));

    if (!config.get().components)
        await config.setStateAsync(async prev => ({
            components: await fs.readFile(prev.root.join("package.json").path, 'utf8')
                .then(pkg => prev.root.join(JSON.parse(pkg).build).path)
                .then(pkg => import(pkg))
                .then(components => components.default)
                .catch(err => log.err(err))
        }));

    log.debug("Config:", config.get());

    await fs.mkdir(config.get().out.path, {recursive: true});

    const components = config.get().components;

    if (!components)
        log.err(`No build script found.`);
    else
        for (const component of config.get().selected)
            if (component in components)
                await components[component](config.get())
                    .then(_ => log.info(`${chalk.grey(component)}: Done`));
}