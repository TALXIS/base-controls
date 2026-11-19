import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../grid/guide/gridGuide'
import { LockClosedDealsExample } from '../../../../grid/guide/features/lockClosedDealsExamples'

const STEP = 'Lock closed deals'

const DESCRIPTION = `
{{block: progress}}

Won and lost deals are closed: nobody may change them, but their stage stays open, so a deal can be reopened. This step locks closed deals with two hooks.

{{canvas: Lock closed deals}}

## How it works

This step adds two hooks to the grid of [**Group and total**](?path=/docs/controls-grid-guide-features-group-and-total--overview), in \`lockClosedDeals\`. In **Code**, the new lines carry \`//new:\`.

**Hooks.** A **hook** is a function the grid asks as it draws: it gets a result to change, such as whether a row is locked, and returns nothing. Each place that takes hooks has \`add(hook, priority?)\`, which returns the function that removes the hook. What a hook is across the library is on the Concepts guide's [**Open a store in a form**](?path=/docs/concepts-guide-basics-open-a-store-in-a-form--overview).

The grid calls \`onSetup\` with each new grid before it loads, the place to add hooks; the rest of what happens as it mounts is on [**From your code**](?path=/docs/controls-grid-guide-advanced-from-your-code--overview). The locks belong to the editing module, and \`grid.modules.observe('editing', …)\` calls back with the module once it has loaded.

**Locks.** A locked cell opens no editor. There are four levels; each starts from the one above, and its hooks have the last word:

| Level | Starts locked when | Hooks, given | Drawn as |
|---|---|---|---|
| Grid | The editing module is left out | | Nothing |
| Column | Its metadata sets \`IsValidForUpdate: false\` | \`editing.locks.hooks.column\`, \`{ columnName }\` | A lock in the header |
| Row | Its record is inactive | \`editing.locks.hooks.row\`, \`{ record }\` | A dimmed row, and a lock in a narrow column at the start |
| Cell | Its column or its row is locked | \`editing.locks.hooks.cell\`, \`{ record, columnName }\` | A lock in the cell, when neither its column nor its row is locked |

\`result.isLocked\` arrives set by the level above, so a hook can lock or open: the cell hook of this step opens *Stage* in a row the row hook locked. Set \`result.isLocked\` only when you mean to change it: \`result.isLocked = columnName !== 'stage' && isClosed(record)\` in the cell hook would also open *Account manager* on every open deal, though its column is locked.

Locks gate the grid's own editing only: \`record.setValue()\` ignores them. The lock column is \`RECORD_LOCK_COLUMN_KEY\`, hidden until a row is locked, and a locked row carries the class \`LOCKED_RECORD_ROW_CLASS\`. A lock that reads something outside its record, such as the user's role, needs the grid to draw again: see [**Hooks**](?path=/docs/controls-grid-guide-advanced-hooks--overview). To change the locks' tooltips, see [**Localization**](?path=/docs/concepts-localization--overview).

**Inactive records.** A record its provider reports inactive, \`record.isActive()\` \`false\`, starts locked. The memory, FetchXml and Power Apps providers report every record active, so lock inactive records in a row hook, such as from Dataverse's \`statecode\`, as this step locks closed deals from their stage.

**Summary rows.** The lock hooks run for group rows and the totals row too, the summary rows of [**Group and total**](?path=/docs/controls-grid-guide-features-group-and-total--overview). \`isClosed\` reads \`null\` there and answers \`false\`, so the hooks leave them alone.

**How hooks run.** Hooks of one kind run in ascending priority, then in the order they were added. The default priority is \`0\`. The legacy client API module runs before it, so your hook builds on what a script set; every other built-in module runs after it, so where one of them decides the same thing, the module wins, as the grouping module locks every cell of a group row. To run after module *x*, add at \`GRID_MODULE_PRIORITY.x + 1\`, as [**Shape the columns**](?path=/docs/controls-grid-guide-make-it-yours-shape-the-columns--overview) does.

Each module's priority is under *Module priorities*, and every hook of the grid under *Hooks*, on [**Reference**](?path=/docs/controls-grid-reference--overview).

## Try it

- The won and lost deals are dimmed, with a lock at the start of their rows: all of David Kim's, and one in each other group.
- Double-click a won deal's *Value*: no editor opens. Double-click its *Stage*: the picker opens.
- Set the lost deal in Anna Novak's group to *Negotiate* and press **Save**: its row brightens, and its values open.
- Click another open deal's row, then press **Mark 1 as won**: its row dims and locks.
- In **Code**, change the cell hook's condition to \`['stage', 'nextstep'].includes(columnName) && isClosed(record)\`: a closed deal's *Next step* opens too.

## Remember

- A hook changes one result the grid asks for, and returns nothing; \`add\` returns its remover.
- Each lock level starts from the one above, and its hooks have the last word.
- Hooks at the default priority run before every built-in module but the legacy client API.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Grid/Guide/Features/Lock closed deals',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { progress: () => <GuideProgress current={STEP} />, navigation: () => <GuideNavigation current={STEP} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const LockClosedDeals: Story = {
    name: 'Lock closed deals',
    tags: ['!dev'],
    render: () => renderStory(<LockClosedDealsExample />),
}
