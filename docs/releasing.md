# Releasing

Every release of `@talxis/base-controls` starts as a [GitHub Release](https://github.com/TALXIS/base-controls/releases/new).
Publishing one runs the [Publish Release](../.github/workflows/publish.yml) workflow, which builds the package,
publishes it to npm under the right dist-tag and, for a new latest version, redeploys the
[Storybook](https://talxis.github.io/base-controls/). You never edit `package.json`'s version; the workflow takes it
from the release tag.

## Versioning

Versions are date-based: `MAJOR.YYMM.BUILD`, e.g. `1.2610.2` — the second build of the October 2026 release.

| Part | Bumped when |
|---|---|
| `MAJOR` | A **breaking change**: a removed or renamed export, a changed prop or contract. Starts at `1` |
| `YYMM` | A **feature release**, at most one a month. It carries the month it ships in — `2610` is October 2026 — and starts over at build `1` |
| `BUILD` | **Fixes only** to the month already released: `1.2610.2`, `1.2610.3`, … |

- Tags have no `v` prefix: `1.2610.2`, not `v1.2610.2`.
- A pre-release adds a suffix: `1.2610.2-beta.1`, `1.2610.2-rc.1`.
- The `YYMM` month is a **release line**. `1.2610.1`, `1.2610.2` and `1.2610.3` are all line `2610`.
- **Every release within one `MAJOR` is backwards compatible**, whether it opens a new month or adds a fix to the
  current one. Moving from `1.2609.1` to `1.2611.4` never breaks a consumer; only a bump to `2.x` does.
- Features never go out as a build bump. They wait for the next month's release, which is why a month line only
  ever grows by fixes.

## npm dist-tags

| Dist-tag | Holds | Install with |
|---|---|---|
| `latest` | The newest stable version | `npm install @talxis/base-controls` |
| `beta`, `rc`, … | The newest pre-release with that suffix | `npm install @talxis/base-controls@beta` |
| `next` | The newest pre-release whose suffix is a bare number, like `1.2610.2-1` | `npm install @talxis/base-controls@next` |
| `release-YYMM` | The newest fix to an older line | `npm install @talxis/base-controls@release-2609` |

A consumer depending on `~1.2609.0` gets every fix to line `2609` and no new features; `^1.2609.0` gets the monthly
feature releases too, up to the next breaking change, `2.0.0`.

## What the workflow does

| Release | npm dist-tag | Storybook | GitHub "Latest" badge |
|---|---|---|---|
| Stable, higher than npm `latest` | `latest` | Deployed | Moves to it |
| Stable, not higher than npm `latest` (a fix to an older line) | `release-YYMM` | Untouched | Stays on npm `latest` |
| Pre-release | The suffix (`beta`, `rc`), else `next` | Untouched | Untouched |

Before publishing, the workflow refuses a release when:

- the tag is not a version like `1.2610.2` or `1.2610.2-beta.1`;
- its middle part is not a `YYMM` month between `01` and `12`, or its build number is below `1`;
- the tag has a pre-release suffix but "Set as a pre-release" is unticked, or the other way round;
- a new `latest` release's commit is on neither `master` nor `release/YYMM`;
- a fix to an older line has its commit outside `release/YYMM`.

## Storybook

[talxis.github.io/base-controls](https://talxis.github.io/base-controls/) always documents the npm `latest` version.
It is rebuilt only when a release becomes `latest`, so pre-releases and fixes to older lines never change it.
To read the docs of any other version, check out its tag and run them locally:

```bash
git switch --detach 1.2610.2-beta.1 && npm install && npm --prefix ./storybook install && npm run storybook
```

## Monthly release

A stable release goes out at most once a month and carries that month's features.

1. Open [Draft a new release](https://github.com/TALXIS/base-controls/releases/new).
2. **Choose a tag**: type the current month with build `1`, e.g. `1.2611.1`, and pick **Create new tag on publish**.
3. **Target**: `master`.
4. Click **Generate release notes** and edit them.
5. Leave **Set as a pre-release** unticked and click **Publish release**.

The same from the terminal:

```bash
gh release create 1.2611.1 --target master --generate-notes
```

If the month's release is already out and more features land on `master`, they wait for next month — or go to
consumers early as a [pre-release](#pre-release).

## Breaking change

A breaking change bumps the leading number and keeps the date: the release after `1.2610.2` is `2.2610.1`, with the
build number at `1`. It is drafted and published like a monthly release, from `master` — spell out in the release
notes what consumers have to do.

A change that cannot be made backwards compatible waits for the next `MAJOR`; it never goes out with the month's
features or as a fix.

```bash
gh release create 2.2610.1 --target master --generate-notes
```

## Pre-release

Use a pre-release to let consumers try a version before it becomes `latest`.

1. Draft a new release with a tag like `1.2610.2-beta.1`. Count up for each new build: `-beta.2`, then `-rc.1`.
2. **Target**: `master`, or a feature branch for an early preview.
3. Tick **Set as a pre-release** and publish.

```bash
gh release create 1.2610.2-beta.1 --target master --prerelease --generate-notes
```

Consumers install it with `npm install @talxis/base-controls@beta`. When it is ready, release `1.2610.2` from the same
commit as a normal release.

## Fix release

Every fix to a month already released goes out as a build bump, e.g. `1.2610.2` over `1.2610.1`.

It can be released straight from `master` only while `master` holds nothing but that fix. As soon as next month's
features have landed there, the fix has to come from the month's `release/YYMM` branch instead — otherwise it would
drag those features out with it, which a build bump must never do. The same branch is what fixes an older line,
e.g. `1.2609.x` while `1.2610.1` is `latest`.

### 1. Create the release branch

Do this once per line; later fixes to the same line reuse the branch.

On GitHub: open the branch dropdown, switch to **Tags**, pick the line's last tag, e.g. `1.2609.2`, open the dropdown
again, type `release/2609` and click **Create branch release/2609 from '1.2609.2'**.

Or from the terminal:

```bash
git fetch --tags && git switch -c release/2609 1.2609.2 && git push -u origin release/2609
```

### 2. Get the fix onto the branch

Fix on `master` first so the next release doesn't bring the bug back, then cherry-pick it into the line:

```bash
git switch -c fix/2609-lookup-crash origin/release/2609 && git cherry-pick -x <commit> && git push -u origin HEAD
```

Open a PR from that branch into `release/2609`. A fix that only makes sense on the old line goes straight into
`release/2609` by PR.

### 3. Release it

Draft a new release with the next build number on that line, `1.2609.3`, and **Target** `release/2609`, leave
**Set as a pre-release** unticked and publish:

```bash
gh release create 1.2609.3 --target release/2609 --generate-notes
```

It goes to npm as `release-2609`, or as `latest` if `2609` is still the newest line.
