import { appendFileSync } from 'node:fs';

const tag = process.env.RELEASE_TAG ?? '';
const isPrerelease = process.env.IS_PRERELEASE === 'true';
const npmLatest = process.env.NPM_LATEST ?? '';

const fail = (message) => {
    console.error(`::error::${message}`);
    process.exit(1);
};

const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(tag);
if (!match) {
    fail(`Release tag "${tag}" is not a version like 2.4.0 or 2.4.0-beta.1.`);
}
const [, major, minor, patch, prerelease] = match;
const version = tag.replace(/^v/, '');
const line = `${major}.${minor}`;

if (Boolean(prerelease) !== isPrerelease) {
    fail(isPrerelease
        ? `Release ${version} is ticked as a pre-release but has no pre-release suffix like -beta.1.`
        : `Release ${version} has a pre-release suffix but is not ticked as a pre-release.`);
}

const isGreaterThanNpmLatest = () => {
    const latest = /^(\d+)\.(\d+)\.(\d+)$/.exec(npmLatest);
    if (!latest) {
        return true;
    }
    const current = [major, minor, patch].map(Number);
    const previous = latest.slice(1).map(Number);
    const index = current.findIndex((part, i) => part !== previous[i]);
    return index !== -1 && current[index] > previous[index];
};

const getDistTag = () => {
    if (prerelease) {
        const identifier = prerelease.split('.')[0];
        if (identifier === 'latest') {
            fail('A pre-release cannot be published as "latest".');
        }
        return /^[A-Za-z][A-Za-z-]*$/.test(identifier) ? identifier : 'next';
    }
    return isGreaterThanNpmLatest() ? 'latest' : `release-${line}`;
};

const outputs = { version, line, dist_tag: getDistTag(), npm_latest: npmLatest };
const lines = Object.entries(outputs).map(([key, value]) => `${key}=${value}`).join('\n');
console.log(lines);
if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${lines}\n`);
}
