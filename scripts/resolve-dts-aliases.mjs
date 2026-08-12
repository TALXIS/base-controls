import { globSync } from 'glob';
import fs from 'fs';
import path from 'path';

const distRoot = path.resolve('dist');
const aliasTargets = [
    ['@components', path.join(distRoot, 'components')],
    ['@hooks', path.join(distRoot, 'hooks')],
    ['@interfaces', path.join(distRoot, 'interfaces')],
    ['@legacy', path.join(distRoot, 'legacy', 'react-components')],
    ['@utils', path.join(distRoot, 'utils')],
];

const aliasPattern = /(['"])(@components(?:\/[^'"]*)?|@hooks(?:\/[^'"]*)?|@interfaces(?:\/[^'"]*)?|@legacy(?:\/[^'"]*)?|@utils(?:\/[^'"]*)?|@\/[^'"]+)\1/g;

const toPosixPath = (value) => value.split(path.sep).join('/');

const toRelativeModuleSpecifier = (fromFile, targetPath) => {
    let relativePath = path.relative(path.dirname(fromFile), targetPath);

    if (!relativePath.startsWith('.')) {
        relativePath = `./${relativePath}`;
    }

    return toPosixPath(relativePath);
};

const resolveAliasPath = (specifier) => {
    if (specifier.startsWith('@/')) {
        return path.join(distRoot, specifier.slice(2));
    }

    const match = aliasTargets.find(([alias]) => specifier === alias || specifier.startsWith(`${alias}/`));

    if (!match) {
        return null;
    }

    const [alias, targetRoot] = match;
    const remainder = specifier.slice(alias.length).replace(/^\//, '');

    return remainder ? path.join(targetRoot, remainder) : targetRoot;
};

for (const file of globSync('dist/**/*.d.ts')) {
    const source = fs.readFileSync(file, 'utf8');
    const next = source.replace(aliasPattern, (fullMatch, quote, specifier) => {
        const resolvedPath = resolveAliasPath(specifier);

        if (!resolvedPath) {
            return fullMatch;
        }

        return `${quote}${toRelativeModuleSpecifier(file, resolvedPath)}${quote}`;
    });

    if (next !== source) {
        fs.writeFileSync(file, next);
    }
}
