import * as fs from 'node:fs/promises';
import * as fss from 'node:fs';
import * as path from 'node:path';

import log from './log.js';

export default class Path {
    constructor(str) {
        if (str instanceof fss.Dirent)
            this.path = path.join(str.parentPath, str.name);
        else if (str instanceof Path)
            this.path = str.path;
        else
            this.path = path.isAbsolute(str) ? str : path.join(process.cwd(), str);
    }
    
    concat(...paths) {
        this.path = path.join(this.path, ...paths.map(i => i instanceof Path ? i.path : i));
        return this;
    }

    join(...paths) {
        return new Path(path.join(this.path, ...paths.map(i => i instanceof Path ? i.path : i)));
    }

    ext() {
        return this.path.split(path.sep).pop()?.split('.').pop()?.toLowerCase() ?? '';
    }

    async *readdir(recursive = true) {
        const files = await fs.readdir(this.path, { recursive, withFileTypes: true })

        for (const dirent of files)
            yield new Path(dirent);

        // for await (const dir of await fs.readdir(config.get().root.path, { recursive: true, withFileTypes: true }))
        //     if (dir.isFile())
        //         log.info(new Path(dir));
    }

    async mtime() {
        return await fs.stat(this.path).then(stat => stat.mtime);
    }

    async isFile() {
        return await fs.stat(this.path).then(stat => stat.isFile());
    }

    async isDir() {
        return await fs.stat(this.path).then(stat => stat.isDirectory());
    }

    async isBlockdev() {
        return await fs.stat(this.path).then(stat => stat.isBlockDevice());
    }

    async isChardev() {
        return await fs.stat(this.path).then(stat => stat.isCharacterDevice());
    }

    async isPipe() {
        return await fs.stat(this.path).then(stat => stat.isFIFO() || stat.isSocket());
    }

    async isFifo() {
        return await fs.stat(this.path).then(stat => stat.isFIFO());
    }

    async isSocket() {
        return await fs.stat(this.path).then(stat => stat.isSocket());
    }

    async isSymlink() {
        return await fs.stat(this.path).then(stat => stat.isSymbolicLink());
    }

    replaceBase(base, newBase) {
        if (this.path.startsWith(base.path))
            return newBase.join(this.path.slice(base.path.length));

        else
            throw { 
                err: 'Could not substitute path',
                reason: `Path does not start with '${base.path}'`, 
                path: this 
            };
    }

    parent() {
        return new Path(this.path.split(path.sep).slice(0, -1).join(path.sep));
    }

    startsWith(base) {
        const chunks = this.path.split(path.sep);
        return base.path.split(path.sep).every(i => chunks.shift() == i);
    }
}