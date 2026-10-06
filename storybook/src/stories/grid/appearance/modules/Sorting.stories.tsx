import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { SortArrowsExample } from '../../../../grid/examples/moduleComponentsExamples'

const DESCRIPTION = `
The sorting module draws an arrow in the header of every sorted column. To change how it looks across the grid, pass \`components\` to \`createSortingModule\`.

\`\`\`tsx
createSortingModule({ components: { sortIcon: { onRenderIcon: ({ descending, ...props }) => <Icon {...props} /> } } })
\`\`\`

- Every key and part is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the grid does not redraw on every render.

| Key | Parts | What it draws |
|---|---|---|
| \`sortIcon\` | \`onRenderIcon\` | The arrow of a sorted column, handed \`descending\` |

## One column only

The arrow is a header adornment keyed \`'sort'\`. To change it on one column, replace or remove that adornment in the column's \`settings.header.onGetAdornments\`, which runs after the modules have added theirs.

{{story: Arrows of your own}}
`

const meta = {
    title: 'Grid/Appearance/Modules/Sorting',
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

export const ArrowsOfYourOwn: Story = {
    name: 'Arrows of your own',
    render: () => renderStory(<SortArrowsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`sortIcon\` draws the arrow as a blue sort glyph that turns with the direction. Price is sorted; sort another column from its menu.`,
            },
        },
    },
}
