import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { LaunchPlanExample } from '../../check-list/checkListExamples'

const DESCRIPTION = `
CheckList presents the records of a data provider as a to-do list. Users tick items off, rename them, drag them into a new order, add items in the row at the bottom and delete the ones they no longer need. It is built on [**Grid**](?path=/docs/grid-get-started--overview): it accepts every \`Grid\` prop, so its columns, cells and events are configured as in any grid.

{{story: A launch plan}}

## Usage

\`\`\`tsx
import { CheckList, DatasetControl, ICheckListFieldMapping, PcfContextProvider, sortCheckListProvider } from '@talxis/base-controls'
import { DataTypes, MemoryDataProvider } from '@talxis/client-libraries'

const launchPlan = new MemoryDataProvider({
    dataSource: [
        { itemid: '1', name: 'Sketch the layout', completed: true, stackrank: '0|100000:' },
        { itemid: '2', name: 'Ship the first version', completed: false, stackrank: '0|200000:' },
    ],
    metadata: { PrimaryIdAttribute: 'itemid', PrimaryNameAttribute: 'name', LogicalName: 'launchitem' },
    columns: [
        { name: 'name', displayName: 'Item', dataType: DataTypes.SingleLineText },
        { name: 'completed', displayName: 'Done', dataType: DataTypes.TwoOptions },
        { name: 'stackrank', displayName: 'Rank', dataType: DataTypes.SingleLineText },
    ],
})

const FIELD_MAPPING: ICheckListFieldMapping = { name: 'name', stackRank: 'stackrank', completed: 'completed' }

export const LaunchPlan = () => <PcfContextProvider>
    <DatasetControl onLoad={async () => ({ provider: sortCheckListProvider(launchPlan, FIELD_MAPPING) })}>
        <DatasetControl.Body>
            <CheckList fieldMapping={FIELD_MAPPING} />
        </DatasetControl.Body>
    </DatasetControl>
</PcfContextProvider>
\`\`\`

- The checklist needs a provider around it, like any grid, and draws its items in the order the provider loaded them. Sort the provider by \`stackRank\` before it loads with \`sortCheckListProvider(provider, fieldMapping)\`, which returns the provider. On its own, sort it, then call \`refresh()\`: see *Your first grid* on [**Grid → Get started**](?path=/docs/grid-get-started--overview).
- \`fieldMapping\` names the columns that hold an item's name, position and state. See *Field mapping* below.
- \`PcfContextProvider\` must wrap the checklist. See [**PcfContextProvider**](?path=/docs/providers-pcfcontextprovider--overview).

## Field mapping

| Field | Column | Role |
|---|---|---|
| \`name\` | Text | The item's name. A new item is added once a name is typed in the bottom row, and a finished item's name is struck through. |
| \`stackRank\` | Text holding a lexorank string, such as \`'0\\|100000:'\` | The item's position. The list is sorted by it, and a drag writes a new rank between the item's neighbours. Hidden. |
| \`completed\` | \`TwoOptions\` | Whether the item is finished, shown as the checkbox column. |

The provider's other columns are shown and edited as in any grid, such as *Priority*, *Owner*, *Due* and *Estimate* above. See [**Columns**](?path=/docs/grid-columns--overview).

## Props

\`CheckList\` accepts every prop of \`Grid\`, listed on [**Props and events**](?path=/docs/grid-get-started-props-and-events--overview). These differ:

| Prop | Default | Description |
|---|---|---|
| \`fieldMapping\` | Required | The columns the checklist works with. See *Field mapping* above. |
| \`modules\` | Editing with auto-save | The grid's modules, merged over the default. Pass \`editing\` to replace it, or \`editing: undefined\` for a read-only list. Some grid modules are incompatible: see *Configure the grid* on [**Customization**](?path=/docs/checklist-customization--overview). |
| \`labels\` | English | The grid's strings and the checklist's own. See *Labels* on [**Customization**](?path=/docs/checklist-customization--overview). |
| \`enableZebra\` | \`false\` | Shades every other row. |
| \`enableOptionSetColors\` | \`true\` | Draws options that have a colour as tags. |

\`fieldMapping\`, \`modules\` and \`labels\` are read once, at mount.
`

const meta = {
    title: 'Checklist/Get started',
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

export const ALaunchPlan: Story = {
    name: 'A launch plan',
    render: () => renderStory(<LaunchPlanExample />),
}
