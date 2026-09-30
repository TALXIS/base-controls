import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { FeaturePropsExample, EditableGridExample, LabelsExample } from '../../../grid/examples/customizationsExamples'

const DESCRIPTION = `
Most of what a grid looks like and does is a prop on \`<Grid.Root />\`. The full list, with defaults, is on [**Get started**](?path=/story/grid-get-started--overview).

## Feature props

| Prop | What it changes |
|---|---|
| \`enableEditing\` | Users can edit cells. Columns the provider marks read-only stay read-only. |
| \`enableAutoSave\` | A record saves as soon as a value in it changes. |
| \`enableNavigation\` | A double click on a row opens its record. |
| \`enableZebra\` | Every other row is shaded. |
| \`enableOptionSetColors\` | Option set values are drawn as tags in their colours, in cells and in the editor. |
| \`rowHeight\` | How tall a row is. |
| \`height\` and \`maxVisibleRows\` | How tall the grid is. |

## Labels

\`labels\` replaces the grid's own strings:

| Label | Default |
|---|---|
| \`noRecordsFound\` | No records found. |
| \`valueNotEditable\` | This value cannot be edited. |
| \`recordNotEditable\` | This record cannot be edited. |
| \`recordSaveErrorTitle\` | Your changes were not saved |
| \`recordSaveErrorDismiss\` | Dismiss |

Each module takes its own \`labels\` option for the strings it draws. See [**Modules**](?path=/story/grid-modules--overview).

## Going further

- [**Columns**](?path=/story/grid-customizations-columns--overview): pinning, alignment, columns of your own and commands.
- [**Custom Components**](?path=/story/grid-customizations-custom-components--overview): your own cells, headers, overlays and loading rows.
`

const meta = {
    title: 'Grid/Customizations',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
            description: { component: DESCRIPTION },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const FeatureProps: Story = {
    name: 'Feature props',
    render: () => renderStory(<FeaturePropsExample />),
    parameters: {
        docs: {
            description: {
                story: `These props are read at mount, so the grid is given a new \`key\` whenever one of them changes.`,
            },
        },
    },
}

export const EditableGrid: Story = {
    name: 'Editable grid',
    render: () => renderStory(<EditableGridExample />),
    parameters: {
        docs: {
            description: {
                story: `Editing with autosave. A validation expression refuses a probability outside 0 to 100 %, and the save events report each save.`,
            },
        },
    },
}

export const LabelsInAnotherLanguage: Story = {
    name: 'Labels in another language',
    render: () => renderStory(<LabelsExample />),
    parameters: {
        docs: {
            description: {
                story: `The grid's own labels, and the sorting module's, in Czech. Open a column's menu to see them.`,
            },
        },
    },
}
