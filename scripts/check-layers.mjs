import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const SRC = path.resolve('src');
const config = JSON.parse(fs.readFileSync('scripts/layers.json', 'utf8'));
const { paths } = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8')).compilerOptions;
const isReportOnly = process.argv.includes('--report');

const SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\bdeclare\s+module\s+)(['"])([^'"]+)\1/g;
const EXTENSIONS = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];

const toFile = (base) => EXTENSIONS.map(extension => base + extension).find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());

const resolveSpecifier = (specifier, fromFile) => {
    if (specifier.startsWith('.')) {
        return toFile(path.resolve(path.dirname(fromFile), specifier));
    }
    for (const [alias, [target]] of Object.entries(paths)) {
        if (alias.endsWith('/*') && specifier.startsWith(alias.slice(0, -1))) {
            return toFile(path.resolve(target.slice(0, -1) + specifier.slice(alias.length - 1)));
        }
        if (alias === specifier) {
            return toFile(path.resolve(target));
        }
    }
    return undefined;
};

const relative = (file) => path.relative(SRC, file).split(path.sep).join('/');
const layerOf = (file) => Object.entries(config.folders).find(([folder]) => relative(file).startsWith(folder))?.[1];
const widgetOf = (file) => relative(file).match(/^controls\/([^/]+)\//)?.[1];
const isInModule = (file) => /^controls\/[^/]+\/modules\//.test(relative(file));
//a widget's ui/ never reaches its own runtime or adapters, at any depth of modules
const partKind = (file) => relative(file).match(/\/(ui|runtime|adapters)\//)?.[1];

const violations = [];
for (const file of globSync('src/**/*.{ts,tsx}').map(file => path.resolve(file))) {
    const from = layerOf(file);
    if (!from || from === 'legacy') {
        continue;
    }
    const source = fs.readFileSync(file, 'utf8');
    for (const [, , specifier] of source.matchAll(SPECIFIER)) {
        const target = resolveSpecifier(specifier, file);
        if (!target || !target.startsWith(SRC)) {
            continue;
        }
        const to = layerOf(target);
        const where = `${relative(file)} -> ${specifier}`;
        if (!to) {
            continue;
        }
        if (to === 'legacy') {
            if (!config.importsLegacy.includes(from)) {
                violations.push(`${where}: ${from} may not import legacy`);
            }
            continue;
        }
        if (config.layers.indexOf(to) > config.layers.indexOf(from)) {
            violations.push(`${where}: ${from} may not import ${to}`);
            continue;
        }
        const [fromWidget, toWidget] = [widgetOf(file), widgetOf(target)];
        if (from === 'controls' && to === 'controls' && fromWidget && fromWidget !== toWidget && !isInModule(file)) {
            if (!config.widgets[fromWidget]?.includes(toWidget)) {
                violations.push(`${where}: ${fromWidget} may not import ${toWidget}`);
            }
            continue;
        }
        if (fromWidget && fromWidget === toWidget && partKind(file) === 'ui' && ['runtime', 'adapters'].includes(partKind(target))) {
            violations.push(`${where}: ui may not import ${partKind(target)}`);
        }
    }
}

for (const violation of violations) {
    console.log(violation);
}
console.log(`${violations.length} layer violation(s).`);
if (violations.length && !isReportOnly) {
    process.exit(1);
}
