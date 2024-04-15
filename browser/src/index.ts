import State from '@j-cake/jcake-utils/state';
import { iterSync } from '@j-cake/jcake-utils/iter';
import * as Format from '@j-cake/jcake-utils/args';

import log from './log.js';

type LogLevel = keyof typeof log;

export const config: State<{ logLevel: LogLevel }> = new State({
    logLevel: 'info' as LogLevel
});

export default async function main(argv: string[]): Promise<boolean> {
    const logLevel = Format.oneOf(Object.keys(log) as LogLevel[], false);
    
    for (const { current: i, skip: next } of iterSync.peekable(argv))
        if (i == '--log-level')
            config.setState({ logLevel: logLevel(next()) });

    return true;
}
