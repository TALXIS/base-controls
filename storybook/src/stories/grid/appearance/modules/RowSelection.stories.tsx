import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { StarredProductsExample } from '../../../../grid/examples/moduleComponentsExamples'

const DESCRIPTION = `
The row selection module draws a checkbox in every row and one in the header that selects every record. To change how they look, pass \`components\` to \`createRowSelectionModule\`.

\`\`\`tsx
createRowSelectionModule({ mode: 'multiple', components: { cell: { checkbox: { onRenderCheckbox: props => <Toggle checked={props.checked} /> } } } })
\`\`\`

- Every key and part is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the grid does not redraw on every render.

| Key | Parts | What it draws |
|---|---|---|
| \`cell.container\` | \`onRenderContainer\` | The cell the checkbox is drawn in |
| \`cell.checkbox\` | \`onRenderContainer\`, \`onRenderCheckbox\` | A row's checkbox, handed \`checked\` and \`onChange\` |
| \`header.headerCheckbox\` | \`onRenderContainer\`, \`onRenderCheckbox\` | The checkbox that selects every record |

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
                story: `\`cell.checkbox\` draws each row's checkbox as a star: selecting a product stars it. Star a few products.`,
            },
        },
    },
}
