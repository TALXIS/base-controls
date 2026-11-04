import fs from 'fs';

/** The `@name` aliases from tsconfig's `paths`, each with the folder under the project root it names. */
export const readAliases = () => {
    const { paths } = JSON.parse(fs.readFileSync(new URL('../tsconfig.json', import.meta.url), 'utf8')).compilerOptions;
    return Object.entries(paths)
        .filter(([alias]) => alias.endsWith('/*') && alias !== '@/*')
        .map(([alias, [target]]) => [alias.slice(0, -2), target.slice(0, -2)]);
};
