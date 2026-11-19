import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../concepts/guide/startGuide'
import { EditAndSaveExample } from '../../../../concepts/guide/basics/editAndSaveExamples'

const STEP = 'Edit and save'

const DESCRIPTION = `
{{block: progress}}

A store's floor area changes with its plans, and the team corrects it where they see it. This step lets them edit, sort and filter the list, totals the floor area, and saves their changes from a bar of commands.

{{canvas: Edit and save}}

## How it works

The list is the one from [**Your first list**](?path=/docs/concepts-guide-basics-your-first-list--overview). In **Code**, the new lines carry \`//new:\`. From here on, the page's own providers stand in for the root providers, so \`GridExample\` draws \`StoreOpenings\` alone.

**Modules.** A **module** is a feature you add by listing it in a control's \`modules\`; a feature you leave out is not there at all. The grid's five modules here tick rows, edit a cell on a double-click, sort and filter from a column's menu, and total a column. Each of these controls lists its modules on a page of its own:

| Control | Its modules | See |
|---|---|---|
| Grid | Editing, selection, sorting, filtering, grouping, totals and more | *Modules* on Grid's [**Reference**](?path=/docs/controls-grid-reference--overview) |
| DatasetControl | The user's own views | [**Views of their own**](?path=/docs/controls-datasetcontrol-guide-your-data-views-of-their-own--overview) |
| TaskGrid | People, dependencies, checklists, templates, and the Gantt's own | [**How modules work**](?path=/docs/controls-taskgrid-guide-features-how-modules-work--overview) |
| Map | The library that draws the map, and modules of your own | *A module* on Map's [**Reference**](?path=/docs/controls-map-reference--overview) |

The total under *Floor area (m²)* comes from \`aggregation: { aggregationFunction: 'sum' }\` on its column in *stores.ts*, and the aggregation module draws it in a row pinned under the grid: see [**Group and total**](?path=/docs/controls-grid-guide-features-group-and-total--overview).

**Saving.** An edited value stays on its record as an **unsaved change** until it is saved. \`DatasetControl.Ribbon\` is a bar of commands in the header: \`enableSave\` adds **Save**, which saves every changed store, and \`enableDiscard\` adds **Discard changes**, which undoes them; each shows only while there are unsaved changes. While there are, the browser asks before the stores load again, such as on a sort. The ribbon's commands and that question are on [**Act on deals**](?path=/docs/controls-datasetcontrol-guide-features-act-on-deals--overview).

## Try it

- Double-click Lyon's *Floor area (m²)*, type 250 and press Enter: **Save** and **Discard changes** appear.
- Press **Discard changes**: the floor area is 180 again, and both commands go.
- Change it to 250 again: the total still reads *Sum 1,005.00*, since totals count saved values. Press **Save**: a green check shows in the row's checkbox for a moment, and the total reads *Sum 1,075.00*.
- Open the menu of *Opening date* and pick **Sort newer to older**: Gothenburg is at the top.

## Remember

- A module adds one feature to a control; a module you leave out is not there.
- Nothing is saved until **Save**: an edit stays on its record until then.

{{block: navigation}}
`

const meta = {
    title: 'Concepts/Guide/Basics/Edit and save',
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

export const EditAndSave: Story = {
    name: 'Edit and save',
    tags: ['!dev'],
    render: () => renderStory(<EditAndSaveExample />),
}
