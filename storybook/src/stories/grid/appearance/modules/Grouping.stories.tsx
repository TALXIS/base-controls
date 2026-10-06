import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GroupBadgesExample } from '../../../../grid/examples/moduleComponentsExamples'

const DESCRIPTION = `
The grouping module draws an icon in the header of every column the rows are grouped by, the row standing for each group, and the header that opens and closes the groups a level at a time. To change how they look, pass \`components\` to \`createGroupingModule\`.

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
| \`expansionHeader.expandCollapse\` | \`onRenderContainer\`, \`onRenderExpandButton\`, \`onRenderCollapseButton\` | The header buttons that open and close a level |

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
