import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { YourOwnDataExample, RequiredAndReadOnlyExample } from '../../grid/examples/dataExamples'

const DESCRIPTION = `
The grid draws whatever its \`provider\` holds: the records, and one column per provider column that is not hidden. What a column can do comes from the column itself.

## What a column says

| Column field | What the grid does with it |
|---|---|
| \`name\` | The key the records hold the value under, and the column's id in \`colDefs\`. |
| \`displayName\` | The header. |
| \`dataType\` | Which control draws and edits the value, and how it is sorted, filtered and totalled. |
| \`visualSizeFactor\` | The width, in pixels. A width the user drags to is written back here. |
| \`isHidden\` | Leaves the column out. |
| \`alignment\` | Which edge the value sits against. |

| Metadata key | What it switches on | Needs |
|---|---|---|
| \`IsValidForGrid\` | Sorting by the column | the sorting module |
| \`SupportedFilterConditionOperators\` | Filtering by the column, with these operators | the filtering module |
| \`CanBeGrouped\` | Grouping by the column | the grouping module |
| \`SupportedAggregations\` | Totals of the column: \`sum\`, \`avg\`, \`min\`, \`max\`, \`count\` | the aggregation module |
| \`IsValidForUpdate\` | Editing the column | \`enableEditing\` |
| \`RequiredLevel\` | \`1\` or \`2\` marks the column as required | \`enableEditing\` |
| \`OptionSet\` | The options of an option set or two-options column, with their colours | |

A column without these keys still shows its values. It just offers nothing in its menu.

\`\`\`ts
{
    name: 'value',
    displayName: 'Value',
    dataType: DataTypes.Currency,
    visualSizeFactor: 130,
    metadata: {
        IsValidForGrid: true,
        IsValidForUpdate: true,
        CanBeGrouped: true,
        SupportedAggregations: ['sum', 'avg'],
        SupportedFilterConditionOperators: Operators.GetOperatorsForDataType(DataTypes.Currency).map(operator => operator.Value),
    },
}
\`\`\`

## The examples' data

Every example on these pages gets a \`provider\` over the same sales pipeline of 30 deals: \`name\`, \`owner\` (the account manager), \`stage\` (an option set where \`4\` is *Won*), \`value\` (currency), \`probability\` (a percentage), \`closedate\`, \`timespent\` (a duration, in minutes) and \`recurring\` (two options). Every column carries all the keys above. The examples on this page build providers of their own.
`

const meta = {
    title: 'Grid/Data',
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

export const YourOwnData: Story = {
    name: 'Your own data',
    render: () => renderStory(<YourOwnDataExample />),
    parameters: {
        docs: {
            description: {
                story: `A \`MemoryDataProvider\` over your own records. The provider is created once with \`React.useMemo\` and loaded with \`refresh()\`; the grid shows it as soon as it has loaded.`,
            },
        },
    },
}

export const RequiredAndReadOnly: Story = {
    name: 'Required and read-only columns',
    render: () => renderStory(<RequiredAndReadOnlyExample />),
    parameters: {
        docs: {
            description: {
                story: `\`RequiredLevel: 2\` marks **Deal** as required: clear one and the cell says so. \`IsValidForUpdate: false\` leaves **Value** read-only while the rest of the grid is editable.`,
            },
        },
    },
}
