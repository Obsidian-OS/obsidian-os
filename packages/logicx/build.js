import fss from "node:fs";
import fs from "node:fs/promises";
import cp from "node:child_process";
import {chalk, esbuild, is_source, log, Path, util} from 'builder';

export default {
    async "build:main.wasm"(config) {
        if (!await util.has_changed({
            glob: path => is_source(path),
            dependents: [config.out.join("mod/logicx_bg.wasm")]
        }))
            return log.verbose("Skipping Rebuild");

        const out = config.out.join("mod");
        const wasmPack = cp.spawn('wasm-pack', [
            'build',
            '--out-dir',
            out.path,
        ], {
            stdio: "inherit"
        });
        await new Promise((ok, err) => wasmPack.once("exit", code => code === 0 ? ok() : err(code)));
    },
    async "build:plugin"(config) {
        await esbuild.build({
            entryPoints: ["app/main.ts"],
            bundle: true,
            sourcemap: true,
            platform: 'node',
            format: 'cjs',
            loader: {
                ".ttf": "copy",
                ".wasm": "binary"
            },
            external: ['electron', 'obsidian'],
            outdir: config.out.path
        });
    },
    async "build:package.json"(config) {
        if (!await util.has_changed({
            glob: path => is_source(path),
            dependents: [config.out.join("package.json")]
        }))
            return log.verbose("Skipping Rebuild");

        const jq = cp.spawn('jq', ['-r', '. *  .deploy * {deploy:null} | with_entries(select(.value |. != null))']);

        fss.createReadStream(config.root.join("package.json").path)
            .pipe(jq.stdin);

        jq.stdout.pipe(fss.createWriteStream(config.out.join("package.json").path));

        await new Promise((ok, err) => jq.on("exit", code => code === 0 ? ok() : err(code)));
    },
    async "build:manifest.json"(config) {
        if (!await util.has_changed({
            glob: path => is_source(path),
            dependents: [config.out.join("manifest.json")]
        }))
            return log.verbose("Skipping Rebuild");

        const jq = cp.spawn('jq', ['-r', '.']);

        fss.createReadStream(config.root.join("manifest.json").path)
            .pipe(jq.stdin);

        jq.stdout.pipe(fss.createWriteStream(config.out.join("manifest.json").path));

        await new Promise((ok, err) => jq.on("exit", code => code === 0 ? ok() : err(code)));
    },
    async "build:style.css"(config) {
        if (!await util.has_changed({
            glob: path => path.path.endsWith(".css"),
            dependents: [config.out.join("styles.css")]
        }))
            return log.verbose("Skipping Rebuild");

        await esbuild.build({
            entryPoints: ["css/main.css"],
            bundle: true,
            sourcemap: true,
            loader: {
                ".ttf": "copy"
            },
            outfile: config.out.join("styles.css").path
        });
    },
    async "phony:install"(config) {
        const pkg = await fs.readFile(config.root.join("package.json").path, 'utf8')
            .then(pkg => JSON.parse(pkg).name);

        const install = new Path(process.env['vault_dir']).join(".obsidian/plugins").join(pkg);

        await fs.mkdir(install.path, {recursive: true});

        for await (const file of config.out.readdir())
            if (await file.isFile())
                await fs.copyFile(file.path, file.replaceBase(config.out, install).path);
            else if (await file.isDir())
                await fs.mkdir(file.replaceBase(config.out, install).path, {recursive: true});
    },
    async "phony:all"(config) {
        for (const [key, comp] of Object.entries(config.components))
            if (key.startsWith("build:"))
                await comp(config)
                    .then(_ => log.info(`  ${chalk.grey(key)}: Done`));
    }
}