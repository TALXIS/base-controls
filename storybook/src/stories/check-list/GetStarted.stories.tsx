import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { BasicUsageExample, LaunchPlanExample } from '../../check-list/checkListExamples'

const DESCRIPTION = `
A checklist is a to-do list built on a [**Grid**](?path=/docs/controls-grid-get-started--overview): users tick items off, rename them, drag them into a new order, add items in the row at the bottom and delete the ones they no longer need. Every item is a record of a [**data provider**](?path=/docs/concepts-data-providers--overview), and every change goes back to it, so the list is stored wherever the provider stores it. Try it below: tick an item off, drag one to a new place, and type a new item in the bottom row.

{{canvas: Plan a launch}}

## Basic usage

Give the checklist a provider and tell it, through \`fieldMapping\`, which of the provider's columns hold an item's name, its position and whether it is finished. Sort the provider by position with \`sortCheckListProvider\` before it loads: the checklist draws items in the order they were loaded, and warns when they are not sorted.

{{story: Two items}}

## Field mapping

| Field | Data type | What it is |
|---|---|---|
| \`name\` | Text | The item's name. Typing one in the bottom row adds an item, and a finished item's name is struck through. |
| \`stackRank\` | Text | The item's position. The column is hidden, and a drag writes a new rank between the item's neighbours. |
| \`completed\` | \`TwoOptions\` | Whether the item is finished, drawn as the checkbox column. |

A rank is a string that sorts between any two others, so moving an item rewrites only that item. To give existing records a rank, call \`StackRank.between(previous, next)\` for each in turn. The provider's other columns are drawn and edited as in any grid.

## Props

\`CheckList\` takes every [**Grid prop**](?path=/docs/controls-grid-props-and-events--overview), \`colDefs\` and the events included. These are its own, or differ:

| Prop | Default | Description |
|---|---|---|
| \`fieldMapping\` | Required | The three columns above. Read at mount. |
| \`modules\` | Auto-saving editing | \`[]\` makes the list read-only. Which grid modules work is on [**Customization**](?path=/docs/controls-checklist-customization--overview). Read at mount. |
| \`enableZebra\` | \`false\` | Unlike \`Grid\`, rows are not striped. |
| \`enableOptionSetColors\` | \`true\` | Unlike \`Grid\`, options with a colour are drawn as tags. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Customization', iconName: 'Edit', href: '?path=/docs/controls-checklist-customization--overview', text: 'Make the list read-only, add grid features, replace the checkbox or the name, and open an item.' },
    { title: 'Saving changes', iconName: 'Save', href: '?path=/docs/controls-checklist-saving-changes--overview', text: 'What every tick, drag, new item and delete writes, and sending it to your own API.' },
    { title: 'Data providers', iconName: 'Database', href: '?path=/docs/concepts-data-providers--overview', text: 'Where the items come from and where they are saved: in memory, in Dataverse or behind your API.' },
    { title: 'Grid', iconName: 'Table', href: '?path=/docs/controls-grid-get-started--overview', text: 'Everything the checklist is built on: columns, cells, modules and events.' },
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
    parameters: {
        docs: {
            description: {
                story: `A product launch's checklist.`,
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
                story: `The smallest checklist: two items in a memory provider.`,
            },
        },
    },
}
