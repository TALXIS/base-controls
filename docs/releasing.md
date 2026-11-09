# Releasing

Every release of `@talxis/base-controls` starts as a [GitHub Release](https://github.com/TALXIS/base-controls/releases/new).
Publishing one runs the [Publish Release](../.github/workflows/publish.yml) workflow, which builds the package,
publishes it to npm under the right dist-tag and, for a new latest version, redeploys the
[Storybook](https://talxis.github.io/base-controls/). You never edit `package.json`'s version; the workflow takes it
from the release tag.

## Versioning

Versions follow [semver](https://semver.org/): `MAJOR.MINOR.PATCH`.

| Bump | When |
|---|---|
| `MAJOR` (`3.0.0`) | A breaking change: a removed or renamed export, a changed prop or contract |
| `MINOR` (`2.4.0`) | New features, backwards compatible |
| `PATCH` (`2.4.1`) | Fixes only |

- Tags have no `v` prefix: `2.4.0`, not `v2.4.0`.
- A pre-release adds a suffix: `2.4.0-beta.1`, `2.4.0-rc.1`.
- A `MAJOR.MINOR` pair is a **release line**. `2.3.0`, `2.3.1` and `2.3.2` are all line `2.3`.
- Versions before `2.0.0` used the date scheme `1.YYMM.N` and are not hotfixed.

## npm dist-tags

| Dist-tag | Holds | Install with |
|---|---|---|
| `latest` | The newest stable version | `npm install @talxis/base-controls` |
| `beta`, `rc`, … | The newest pre-release with that suffix | `npm install @talxis/base-controls@beta` |
| `next` | The newest pre-release whose suffix is a bare number, like `2.4.0-1` | `npm install @talxis/base-controls@next` |
| `release-X.Y` | The newest hotfix to an older line | `npm install @talxis/base-controls@release-2.3` |

A consumer depending on `~2.3.0` gets every fix to line `2.3` and nothing else; `^2.3.0` gets everything up to `3.0.0`.

## What the workflow does

| Release | npm dist-tag | Storybook | GitHub "Latest" badge |
|---|---|---|---|
| Stable, higher than npm `latest` | `latest` | Deployed | Moves to it |
| Stable, not higher than npm `latest` (a hotfix to an older line) | `release-X.Y` | Untouched | Stays on npm `latest` |
| Pre-release | The suffix (`beta`, `rc`), else `next` | Untouched | Untouched |

Before publishing, the workflow refuses a release when:

- the tag is not a version like `2.4.0` or `2.4.0-beta.1`;
- the tag has a pre-release suffix but "Set as a pre-release" is unticked, or the other way round;
- a new `latest` release's commit is on neither `master` nor `release/X.Y`;
- a hotfix to an older line has its commit outside `release/X.Y`.

## Storybook

[talxis.github.io/base-controls](https://talxis.github.io/base-controls/) always documents the npm `latest` version.
It is rebuilt only when a release becomes `latest`, so pre-releases and hotfixes to older lines never change it.
To read the docs of any other version, check out its tag and run them locally:

```bash
git switch --detach 2.4.0-beta.1 && npm install && npm --prefix ./storybook install && npm run storybook
```

## Release

1. Open [Draft a new release](https://github.com/TALXIS/base-controls/releases/new).
2. **Choose a tag**: type the new version, e.g. `2.4.0`, and pick **Create new tag on publish**.
3. **Target**: `master`.
4. Click **Generate release notes** and edit them.
5. Leave **Set as a pre-release** unticked and click **Publish release**.

The same from the terminal:

```bash
gh release create 2.4.0 --target master --generate-notes
```

## Pre-release

Use a pre-release to let consumers try a version before it becomes `latest`.

1. Draft a new release with a tag like `2.4.0-beta.1`. Count up for each new build: `-beta.2`, then `-rc.1`.
2. **Target**: `master`, or a feature branch for an early preview.
3. Tick **Set as a pre-release** and publish.

```bash
gh release create 2.4.0-beta.1 --target master --prerelease --generate-notes
```

Consumers install it with `npm install @talxis/base-controls@beta`. When it is ready, release `2.4.0` from the same
commit as a normal release.

## Hotfix

Use a hotfix to fix an older line, e.g. `2.3.x` while `2.4.0` is `latest`. A fix to the newest line is either a
normal patch release from `master`, or a hotfix from its `release/X.Y` branch when `master` already holds unreleased
features.

### 1. Create the release branch

Do this once per line; later fixes to the same line reuse the branch.

On GitHub: open the branch dropdown, switch to **Tags**, pick `2.3.0`, open the dropdown again, type `release/2.3` and
click **Create branch release/2.3 from '2.3.0'**.

Or from the terminal:

```bash
git fetch --tags && git switch -c release/2.3 2.3.0 && git push -u origin release/2.3
```

### 2. Get the fix onto the branch

Fix on `master` first so the next release doesn't bring the bug back, then cherry-pick it into the line:

```bash
git switch -c fix/2.3-lookup-crash origin/release/2.3 && git cherry-pick -x <commit> && git push -u origin HEAD
```

Open a PR from that branch into `release/2.3`. A fix that only makes sense on the old line goes straight into
`release/2.3` by PR.

### 3. Release it

Draft a new release with tag `2.3.1` and **Target** `release/2.3`, leave **Set as a pre-release** unticked and publish:

```bash
gh release create 2.3.1 --target release/2.3 --generate-notes
```

It goes to npm as `release-2.3`, or as `latest` if `2.3` is still the newest line.
