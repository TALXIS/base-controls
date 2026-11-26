#!/usr/bin/env node
//base-controls-labels-resx --bundle <bundle.js> <folder...>: puts the bundle's labels in its resx
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { values, positionals: folders } = parseArgs({
    allowPositionals: true,
    options: { bundle: { type: 'string' }, prefix: { type: 'string', default: 'translations' } },
});
if (!values.bundle || folders.length === 0) {
    console.error('Usage: base-controls-labels-resx --bundle <bundle.js> [--prefix translations] <folder...>');
    process.exit(1);
}
const DATA = /[ \t]*<data name="([^"]+)"[\s\S]*?<\/data>\r?\n?/g;
const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist/resx');
const bundle = await readFile(values.bundle, 'utf8');
//a label set is bundled whole, so each of its keys sits in the bundle as a string
const isBundled = key => bundle.includes(`"${key}"`) || bundle.includes(`'${key}'`);

for (const file of await readdir(source)) {
    const languageId = file.match(/\.(\d+)\.resx$/)?.[1];
    if (!languageId) {
        continue;
    }
    const labels = [...(await readFile(path.join(source, file), 'utf8')).matchAll(DATA)];
    const definedKeys = new Set(labels.map(([, key]) => key));
    const entries = labels.filter(([, key]) => isBundled(key)).map(([entry]) => entry.endsWith('\n') ? entry : `${entry}\n`).join('');
    for (const folder of folders) {
        const targetFile = path.join(folder, `${values.prefix}.${languageId}.resx`);
        if (!existsSync(targetFile)) {
            console.warn(`${targetFile} does not exist; its labels are skipped.`);
            continue;
        }
        //the PCF's own entries stay; every base-controls label is written anew
        const own = (await readFile(targetFile, 'utf8')).replace(DATA, (entry, key) => definedKeys.has(key) ? '' : entry);
        const end = own.lastIndexOf('</root>');
        await writeFile(targetFile, `${own.slice(0, end)}${entries}${own.slice(end)}`);
    }
}
