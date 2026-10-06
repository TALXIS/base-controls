import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GroupBadgesExample } from '../../../../grid/examples/moduleComponentsExamples'

const DESCRIPTION = `
The grouping module draws an icon in the header of every column the rows are grouped by, and the row standing for each group. To change how they look across the grid, pass \`components\` to \`createGroupingModule\`.

\`\`\`tsx
createGroupingModule({ components: { groupCell: { count: { onRenderCount: props => <Badge {...props} /> } } } })
\`\`\`

- Every key and part is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the grid does not redraw on every render.

| Key | Parts | What it draws |
|---|---|---|
| \`groupingIcon\` | \`onRenderIcon\` | The icon of a column the rows are grouped by |
| \`groupCell.toggle\` | \`onRenderContainer\`, \`onRenderButton\` | The chevron that opens and closes a group |
| \`groupCell.count\` | \`onRenderCount\` | How many records the group holds |
| \`groupCell.container\`, \`loading\`, \`control\`, \`columnControl\`, \`commands\` | As in any cell | The rest of the group's cell |

## One column only

The module picks a group row's cell through the column's \`cellRendererSelector\`, and leaves every other row to its \`cellRenderer\`. To draw one column's group rows your own way, set its \`cellRendererSelector\` in \`colDefs\` and reuse \`GroupCell\`: its \`components\` prop is merged over the module's.

\`\`\`tsx
const CategoryGroupCell = (props: IGridCellParams) => <GroupCell {...props} components={GROUP_CELL} />

//rows grouped by Category hold its value, and the records under them draw nothing
const isGroupRow = (params: ICellRendererParams<IRecord>) => params.data?.getDataProvider().getSummarizationType() === 'grouping'

colDefs={{ category: { cellRendererSelector: params => ({ component: isGroupRow(params) ? CategoryGroupCell : Grid.Cell.EmptyRenderer }) } }}
\`\`\`

Your selector replaces the module's for that column. Return \`undefined\` for a row to leave it to the column's \`cellRenderer\`; on a grouped column, draw its records empty, as the module does. The expansion column is the module's own, keyed \`GROUP_EXPANSION_COLUMN_KEY\`: set its \`headerComponent\` and reuse \`GroupExpansionHeader\`, whose \`expandCollapse\` takes \`onRenderContainer\`, \`onRenderExpandButton\` and \`onRenderCollapseButton\`.

To mark one column's grouping icon, replace the header adornment keyed \`'grouping'\` in \`settings.header.onGetAdornments\`.

{{story: Group sizes as badges}}
`

const meta = {
    title: 'Grid/Appearance/Modules/Grouping',
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

export const GroupSizesAsBadges: Story = {
    name: 'Group sizes as badges',
    render: () => renderStory(<GroupBadgesExample />),
    parameters: {
        docs: {
            description: {
                story: `\`groupCell.count\` draws each category's size as a badge, and \`groupingIcon\` colours the Category header's icon.`,
            },
        },
    },
}
