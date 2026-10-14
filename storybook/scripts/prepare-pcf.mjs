import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const version = '0.0.2610.1';
const controls = { TagPicker: 'tagpicker' };
const files = ['bundle.js', 'bundle.js.LICENSE.txt', 'ControlManifest.xml'];
for (const [name, slug] of Object.entries(controls)) {
    const url = `https://solution-feed.talxis.com/feed-develop/flatcontainer/${slug}.solution/${version}/${slug}.solution.${version}.nupkg`;
    const output = fileURLToPath(new URL(`../public/pcf/${slug}/`, import.meta.url));
    const marker = path.join(output, 'version.txt');
    if (files.every(file => existsSync(path.join(output, file)))
        && existsSync(marker) && readFileSync(marker, 'utf8') === version) {
        console.log(`${name} ${version} assets ready.`);
    } else {
        const temporary = mkdtempSync(path.join(tmpdir(), `storybook-${slug}-`));
        try {
            const archive = path.join(temporary, 'package.nupkg');
            execFileSync('curl', ['--fail', '--location', '--retry', '2', '--output', archive, url], { stdio: 'inherit' });
            const solution = execFileSync('unzip', ['-p', archive, `content/solution/${name}.Solution.zip`], { maxBuffer: 8 * 1024 * 1024 });
            const solutionPath = path.join(temporary, 'solution.zip');
            writeFileSync(solutionPath, solution);
            mkdirSync(output, { recursive: true });
            for (const file of files) {
                const content = execFileSync('unzip', ['-p', solutionPath, `Controls/talxis_TALXIS.PCF.${name}/${file}`], { maxBuffer: 8 * 1024 * 1024 });
                writeFileSync(path.join(output, file), content);
            }
            writeFileSync(marker, version);
            console.log(`Prepared original ${name} ${version} assets.`);
        } finally {
            rmSync(temporary, { recursive: true, force: true });
        }
    }
}