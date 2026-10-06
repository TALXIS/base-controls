import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { SaveStatusExample } from '../../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
The editing module draws each row's save status, the callout a failed save opens, and the lock of a record locked as a whole. To change how they look, pass \`components\` to \`createEditingModule\`.

\`\`\`tsx
createEditingModule({ components: { recordSaveCell: { indicator: { onRenderButton: props => <ActionButton {...props} /> } } } })
\`\`\`

- Every key and part is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the grid does not redraw on every render.

| Key | Parts | What it draws |
|---|---|---|
| \`recordSaveCell.container\` | \`onRenderContainer\` | The cell the save status is drawn in |
| \`recordSaveCell.indicator\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderButton\`, \`onRenderErrorCallout\` | The status itself: a spinner while saving, then a button |
| \`recordSaveCell.errorCallout\` | \`onRenderCallout\`, \`onRenderHeader\`, \`onRenderIcon\`, \`onRenderTitle\`, \`onRenderFields\`, \`onRenderField\` | The callout a failed save opens |
| \`recordLockCell.container\` | \`onRenderContainer\` | The cell a locked record's lock is drawn in |
| \`recordLockCell.lockIcon\` | \`onRenderTooltip\`, \`onRenderIcon\` | The lock |

{{story: Save status your way}}
`

const meta = {
    title: 'Grid/Appearance/Modules/Editing',
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

export const SaveStatusYourWay: Story = {
    name: 'Save status your way',
    render: () => renderStory(<SaveStatusExample />),
    parameters: {
        docs: {
            description: {
                story: `\`recordSaveCell\` turns the save status into a labelled button, and names the product in the failed-save callout. Set a price above 1,000.`,
            },
        },
    },
}
