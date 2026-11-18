import { appendFileSync } from 'node:fs';

const tag = process.env.RELEASE_TAG ?? '';
const isPrerelease = process.env.IS_PRERELEASE === 'true';
const npmLatest = process.env.NPM_LATEST ?? '';

const fail = (message) => {
    console.error(`::error::${message}`);
    process.exit(1);
};

const match = /^v?(\d+)\.(\d{4})\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(tag);
if (!match) {
    fail(`Release tag "${tag}" is not a version like 1.2610.2 or 1.2610.2-beta.1.`);
}
const [, major, month, build, prerelease] = match;
const version = tag.replace(/^v/, '');
const line = month;

if (Number(major) < 1) {
    fail(`Release ${version} must start at 1; the leading number is bumped only by a breaking change.`);
}
if (Number(month.slice(2)) < 1 || Number(month.slice(2)) > 12) {
    fail(`Release ${version} does not carry a YYMM month like 2610; "${month}" has no month between 01 and 12.`);
}
if (Number(build) < 1) {
    fail(`Release ${version} must end in a build number of 1 or more.`);
}

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
    const current = [major, month, build].map(Number);
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
