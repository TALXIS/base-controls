import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { BasicUsageExample, LaunchPlanExample } from '../../check-list/checklistExamples'

const DESCRIPTION = `
A checklist is a to-do list built on a [**Grid**](?path=/docs/controls-grid-get-started--overview): users tick items off, rename them, drag them into a new order, add items in the bottom row and delete them. Each item is a record of a data provider, so the list is stored wherever the provider stores it. Try it below: tick an item off, then drag it to a new place.

{{canvas: Plan a launch}}

## Build a checklist

\`Checklist\` takes no provider prop: like any grid, it shows the provider around it, such as a DatasetControl's, as *Hand it to controls* on [**Data providers**](?path=/docs/concepts-data-providers--overview) describes. \`fieldMapping\` tells it which of the provider's columns hold an item's name, its position and whether it is finished. The checklist draws items in the order the provider loads them, so sort the provider by position with \`sortChecklistProvider\` before it loads; the checklist warns in the console when it is not sorted.

{{story: Two items}}

## Map the fields

| Field | Data type | What it is |
|---|---|---|
| \`name\` | Text | The item's name. Typing one in the bottom row adds an item, and a finished item's name is struck through. |
| \`stackRank\` | Text | The item's position. The column is hidden, and a drag writes a new rank between the item's neighbours. |
| \`completed\` | \`TwoOptions\` | Whether the item is finished, drawn as the checkbox column. |

Each of the three must be a column of the provider, or the checklist throws. A rank is a string that sorts between any two others, so moving an item rewrites only that item; to give existing records a rank, call \`StackRank.between(previous, next)\` for each in turn. The provider's other columns are drawn and edited as in any grid.

## Props

\`Checklist\` takes every grid prop on [**Props and events**](?path=/docs/controls-grid-props-and-events--overview), \`onSetup\` included. These are its own, or differ:

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`fieldMapping\` | \`IChecklistFieldMapping\` | Required | At mount | The three columns above. |
| \`modules\` | \`IChecklistGridModule[]\` | An auto-saving editing module | At mount | Grid modules in place of the default; \`[]\` makes the list read-only. The row model and the checklist's own module are always added. Which grid modules work is on [**Customisation**](?path=/docs/controls-checklist-customisation--overview). |
| \`enableZebra\` | \`boolean\` | \`false\` | At mount | Shades every other row; off by default, unlike \`Grid\`. |
| \`enableOptionSetColors\` | \`boolean\` | \`true\` | At mount | Draws options that have a colour as tags; on by default, unlike \`Grid\`. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Customisation', iconName: 'Edit', href: '?path=/docs/controls-checklist-customisation--overview', text: 'Make the list read-only, add grid features, replace the checkbox or the name, and open an item.' },
    { title: 'Saving changes', iconName: 'Save', href: '?path=/docs/controls-checklist-saving-changes--overview', text: 'What every tick, drag, new item and delete writes, and sending it to your own API.' },
    { title: 'Data providers', iconName: 'Database', href: '?path=/docs/concepts-data-providers--overview', text: 'Where the items come from and where they are saved: in memory, in Dataverse or behind your API.' },
]

const meta = {
    title: 'Controls/Checklist/Get started',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { explore: () => <ExploreCards cards={EXPLORE} /> }),
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
}

export const TwoItems: Story = {
    name: 'Two items',
    render: () => renderStory(<BasicUsageExample />),
    parameters: {
        docs: {
            description: {
                story: `The smallest checklist: two items in a memory provider. Try: open **Code** and add a third item.`,
            },
        },
    },
}
