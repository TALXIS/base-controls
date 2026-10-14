import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const version = '0.0.2610.1';
const controls = { TagPicker: 'tagpicker' };
const manifestFile = 'ControlManifest.xml';
const unzip = (archive, file) => execFileSync('unzip', ['-p', archive, file], { maxBuffer: 8 * 1024 * 1024 });
// Every <code>, <css>, <resx> and <img> resource the manifest declares, so the control gets the same files it has in Dataverse
const getResourcePaths = manifest => [...manifest.matchAll(/<(?:code|css|resx|img)\b[^>]*\bpath="([^"]+)"/g)].map(match => match[1]);
for (const [name, slug] of Object.entries(controls)) {
    const url = `https://solution-feed.talxis.com/feed-develop/flatcontainer/${slug}.solution/${version}/${slug}.solution.${version}.nupkg`;
    const output = fileURLToPath(new URL(`../public/pcf/${slug}/`, import.meta.url));
    const marker = path.join(output, 'version.txt');
    const manifestPath = path.join(output, manifestFile);
    if (existsSync(marker) && readFileSync(marker, 'utf8') === version && existsSync(manifestPath)
        && getResourcePaths(readFileSync(manifestPath, 'utf8')).every(file => existsSync(path.join(output, file)))) {
        console.log(`${name} ${version} assets ready.`);
    } else {
        const temporary = mkdtempSync(path.join(tmpdir(), `storybook-${slug}-`));
        try {
            const archive = path.join(temporary, 'package.nupkg');
            execFileSync('curl', ['--fail', '--location', '--retry', '2', '--output', archive, url], { stdio: 'inherit' });
            const solutionPath = path.join(temporary, 'solution.zip');
            writeFileSync(solutionPath, unzip(archive, `content/solution/${name}.Solution.zip`));
            const folder = `Controls/talxis_TALXIS.PCF.${name}`;
            // Overwrite in place: deleting the folder makes a running Storybook stop serving it until restart
            mkdirSync(output, { recursive: true });
            const manifest = unzip(solutionPath, `${folder}/${manifestFile}`);
            writeFileSync(manifestPath, manifest);
            for (const file of [...getResourcePaths(manifest.toString('utf8')), 'bundle.js.LICENSE.txt']) {
                mkdirSync(path.dirname(path.join(output, file)), { recursive: true });
                writeFileSync(path.join(output, file), unzip(solutionPath, `${folder}/${file}`));
            }
            writeFileSync(marker, version);
            console.log(`Prepared original ${name} ${version} assets.`);
        } finally {
            rmSync(temporary, { recursive: true, force: true });
        }
    }
}
