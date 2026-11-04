import { execFileSync } from 'child_process';
import fs from 'fs';

const read = (file) => new Map(fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(line => {
    const [entry, name, kind] = line.split(' ');
    return [`${entry} ${name}`, kind];
}));

const current = execFileSync('node', ['scripts/list-exports.mjs'], { encoding: 'utf8', maxBuffer: 1 << 26 });
fs.writeFileSync('scripts/.exports-current.txt', current);

const baseline = read('scripts/exports-baseline.txt');
const now = read('scripts/.exports-current.txt');
//each key is "<entry> <name>"; null marks a deliberate removal
const renames = JSON.parse(fs.readFileSync('scripts/export-renames.json', 'utf8'));

const missing = [];
const brokenRenames = [];
for (const key of baseline.keys()) {
    if (now.has(key)) {
        continue;
    }
    if (!(key in renames)) {
        missing.push(key);
        continue;
    }
    const target = renames[key];
    if (target !== null && !now.has(`${key.split(' ')[0]} ${target}`)) {
        brokenRenames.push(`${key} -> ${target}`);
    }
}
const renamedTo = new Set(Object.entries(renames).filter(([, target]) => target).map(([key, target]) => `${key.split(' ')[0]} ${target}`));
const added = [...now.keys()].filter(key => !baseline.has(key) && !renamedTo.has(key));

const report = (title, items) => items.length && console.log(`${title} (${items.length}):\n  ${items.join('\n  ')}`);
report('Gone without an entry in export-renames.json', missing);
report('Renamed to a name that is not exported', brokenRenames);
report('New exports', added);

if (missing.length || brokenRenames.length) {
    process.exit(1);
}
console.log(`Exports OK: ${now.size} exported, ${added.length} new.`);
