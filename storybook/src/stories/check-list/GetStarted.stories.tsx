import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { BasicUsageExample, LaunchPlanExample } from '../../check-list/checkListExamples'

const DESCRIPTION = `
A checklist is a to-do list: users tick items off, rename them, drag them into a new order, add items in the row at the bottom and delete the ones they no longer need. Every item is a record in a data provider and every change goes back to it, so the list is stored wherever the provider stores it. Underneath it is a [**Grid**](?path=/docs/controls-grid-get-started--overview), so its columns, cells and events work as in any grid. Try it below: tick an item off, drag one to a new place, and type a new item in the bottom row.

{{canvas: Plan a launch}}

## Basic usage

A *provider* holds the records and everything about them; the checklist only draws it. Creating one is on [**Data providers**](?path=/docs/concepts-data-providers--overview).

{{story: Two items}}

## How it fits together

1. **\`fieldMapping\` names three columns**: the item's name, its position and whether it is finished. See *Field mapping* below.
2. **The provider is sorted by position before it loads.** The checklist draws items in the order the provider loaded them, and sorting is the provider owner's job: \`sortCheckListProvider(provider, fieldMapping)\` sorts it by the position column and returns it. An unsorted provider still draws, and the checklist logs a warning naming \`sortCheckListProvider\`.
3. **Every change goes to the provider.** With the default auto-save, each tick, rename, move or new item saves its record at once. See [**Saving changes**](?path=/docs/controls-checklist-saving-changes--overview).
4. **The checklist finds its provider around it**, like any grid: in a [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview), or in a \`DataProviderScope\` for a checklist on its own, where you call \`refresh()\` yourself.

\`PcfContextProvider\` must wrap the checklist. See [**PCF context**](?path=/docs/concepts-pcf-context--overview).

## Field mapping

| Field | Data type | Description |
|---|---|---|
| \`name\` | Text | The item's name. Typing a name in the bottom row adds the item; a finished item's name is struck through. |
| \`stackRank\` | Text, holding a rank such as \`'0\\|100000:'\` | The item's position. A drag writes a new rank between the item's new neighbours. The column is hidden. |
| \`completed\` | \`TwoOptions\` | Whether the item is finished, drawn as the checkbox column. |

- A rank is a string that sorts between any two others, so moving an item rewrites only that item. To give existing records ranks, call \`StackRank.between(previousRank, undefined)\` from \`@talxis/base-controls\` for each in turn, starting from \`undefined\`.
- A \`fieldMapping\` entry that names a column the provider does not have throws when the checklist mounts.
- The provider's other columns are drawn and edited as in any grid, such as *Priority*, *Owner*, *Due* and *Estimate* above. See [**Columns**](?path=/docs/controls-grid-columns--overview).

## Props

\`CheckList\` takes every prop of \`Grid\`, listed on [**Props and events**](?path=/docs/controls-grid-props-and-events--overview). These differ:

| Prop | Type | Default | Description |
|---|---|---|---|
| \`fieldMapping\` | \`ICheckListFieldMapping\` | Required | The columns the checklist works with. Read at mount. |
| \`modules\` | \`IGridModule[]\` | \`[createEditingModule({ autoSave: true })]\` | Replaces the default; a list without editing is read-only. The row model is always the client-side one. Which modules work is under *Configure the grid* on [**Customization**](?path=/docs/controls-checklist-customization--overview). Read at mount. |
| \`labels\` | \`Partial<IGridLabels & ICheckListLabels>\` | English | The grid's strings and the checklist's own. See *Change its wording* on [**Customization**](?path=/docs/controls-checklist-customization--overview). Read at mount. |
| \`enableZebra\` | \`boolean\` | \`false\`, unlike \`Grid\` | Shades every other row. |
| \`enableOptionSetColors\` | \`boolean\` | \`true\`, unlike \`Grid\` | Draws options that have a colour as tags. |

## Where next

- [**Customization**](?path=/docs/controls-checklist-customization--overview): make the list read-only, change its wording, add grid features, open an item.
- [**Saving changes**](?path=/docs/controls-checklist-saving-changes--overview): what the checklist writes, and sending it to your API.
`

const meta = {
    title: 'Controls/Checklist/Get started',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const PlanALaunch: Story = {
    name: 'Plan a launch',
    render: () => renderStory(<LaunchPlanExample />),
    parameters: {
        docs: {
            description: {
                story: `A product launch's checklist. Try: tick an item off, drag one to a new place, and type a new item in the bottom row.`,
            },
        },
    },
}

export const TwoItems: Story = {
    name: 'Two items',
    render: () => renderStory(<BasicUsageExample />),
    parameters: {
        docs: {
            description: {
                story: `Two items, the first ticked and struck through, and an empty row at the bottom to add the next one. Try: type a new item in the bottom row and drag it above the others.`,
            },
        },
    },
}
