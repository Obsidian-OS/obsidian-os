import { config } from './main.js';

const file_tree = async function() {
    const files = [];

    if (files.length == 0)
        for await (const path of config.get().root.readdir())
            files.push(path);

    return files;
}

export async function* get_files(glob) {
    for (const path of await file_tree()) 
        if (await glob(path))
            yield path;
}

export async function has_changed(glob) {
    if (config.get().force)
        return true;

    const mtimes = await Promise.all(glob.dependents.map(i => i.mtime().catch(_ => new Date(0))));

    for await (const file of get_files(glob.glob))
        if (await Promise.race(mtimes.map(async i => await file.mtime() > i)))
            return true;

    return false;
}
