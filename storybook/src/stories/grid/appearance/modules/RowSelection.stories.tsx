import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { StarredProductsExample } from '../../../../grid/examples/moduleComponentsExamples'

const DESCRIPTION = `
The row selection module adds a checkbox column of its own, keyed \`SELECTION_COLUMN_KEY\`: a checkbox in every row, and one in the header that selects every record. To draw them your own way, set the column's \`cellRenderer\` or \`headerComponent\` in \`colDefs\`, reuse the module's cell or header and replace its parts through \`components\`.

\`\`\`tsx
const StarCell = (props: IGridCellParams) => <SelectionCell {...props} components={STAR} />

<Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), rowSelection: createRowSelectionModule({ mode: 'multiple' }) }}
    colDefs={{ [SELECTION_COLUMN_KEY]: { cellRenderer: StarCell } }} />
\`\`\`

- Every key and part is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the cell does not redraw on every render.

| Cell | Key | Parts | What it draws |
|---|---|---|---|
| \`SelectionCell\` | \`container\` | \`onRenderContainer\` | The cell the checkbox is drawn in |
| | \`checkbox\` | \`onRenderContainer\`, \`onRenderCheckbox\` | A row's checkbox, handed \`checked\` and \`onChange\` |
| \`SelectionHeader\` | \`headerCheckbox\` | \`onRenderContainer\`, \`onRenderCheckbox\` | The checkbox that selects every record |

{{story: Star products to order}}
`

const meta = {
    title: 'Grid/Appearance/Modules/Row selection',
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

export const StarProductsToOrder: Story = {
    name: 'Star products to order',
    render: () => renderStory(<StarredProductsExample />),
    parameters: {
        docs: {
            description: {
                story: `The checkbox column's \`cellRenderer\` is \`SelectionCell\` with \`checkbox\` replaced by a star: selecting a product stars it. Star a few products.`,
            },
        },
    },
}
