import fs from 'fs';

//the bundle has no files left for a relative augmentation to name
const file = 'dist/index.d.ts';
const source = fs.readFileSync(file, 'utf8');
const opening = /declare module ["']\.{1,2}\/[^"']*["'] \{/g;
let result = '';
let position = 0;
let match;
while ((match = opening.exec(source)) !== null) {
    let depth = 1;
    let index = match.index + match[0].length;
    while (depth > 0) {
        const char = source[index++];
        if (char === '{') {
            depth++;
        }
        else if (char === '}') {
            depth--;
        }
    }
    result += source.slice(position, match.index) + source.slice(match.index + match[0].length, index - 1);
    position = index;
    opening.lastIndex = index;
}
fs.writeFileSync(file, result + source.slice(position));
