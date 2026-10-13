import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { YourOwnPiecesExample } from '../../../dataset-control/examples/appearanceExamples'

const DESCRIPTION = `Every part takes \`components\`, which replaces pieces of what it draws. A piece is handed the props its default would get, so you can change them and render the default, or render something of your own.

\`\`\`tsx
<DatasetControl.ViewSwitcher onLoad={loadViews} components={{ onRenderButton: props => <MyViewButton {...props} /> }} />
\`\`\`

- Every piece is optional: what you leave out keeps its default.
- A piece inside a part, such as the quick find's callout, has its pieces under its own name: \`components={{ callout: { onRenderColumn } }}\`.
- The defaults are exported, such as \`ViewSwitcherUiComponents\`, to render the default with your changes.
- \`DatasetControl.Ui\` holds every part as plain UI, with no control behind it, for building something that looks like the built-in part.

{{story: Your own pieces}}

## Pieces

| Part | Pieces |
|---|---|
| \`DatasetControl\` | \`onRenderContainer\`, the control's box; \`skeleton\`: \`onRenderSkeleton\`, and \`loadingBoundary\`, whose container is the placeholder (render \`<div {...props} />\` for a spinner instead); \`errorMessage\`: \`onRenderMessageBar\`, \`onRenderTooltip\`, \`onRenderTitle\` and \`onRenderCommandBar\`, the error shown when loading fails |
| \`Header\`, \`Header.Start\`, \`Header.End\`, \`Body\`, \`Footer\`, \`Footer.Start\`, \`Footer.End\` | \`onRenderContainer\` |
| \`ViewSwitcher\` | \`onRenderButton\`, whose \`menuProps.items\` are the views |
| \`Ribbon\` | \`onRenderCommandBar\`, whose \`items\` are the commands; \`loadingBoundary\`, what stands in while the commands load; \`errorMessage\`, the error when \`onLoad\` throws |
| \`QuickFind\` | \`onRenderTextField\`, \`onRenderCallout\`; \`callout\`: \`onRenderCallout\`, \`onRenderLikeWarning\`, \`onRenderDescription\`, \`onRenderColumns\`, \`onRenderColumn\` |
| \`EditColumns\` | \`button.onRenderButton\`; \`panel\`: \`onRenderPanel\`, \`onRenderFooter\`, \`onRenderCommandBar\`, empty by default; \`scopeSelector\` and \`columnSelector\`: \`onRenderSelector\`, \`onRenderOption\`; \`columnList.onRenderColumn\`, whose \`commands\` hold the remove button |
| \`Notifications\` | \`onRenderNotifications\` |
| \`EmptyRecords\` | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderText\` |
| \`Pagination\` | \`onRenderCommandBar\` |
| \`PageSizeSwitcher\` | \`onRenderButton\` |
`

const meta = {
    title: 'DatasetControl/Customization/Appearance',
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

export const YourOwnPieces: Story = {
    name: 'Your own pieces',
    render: () => renderStory(<YourOwnPiecesExample />),
    parameters: {
        docs: {
            description: {
                story: `The view switcher adds *Manage views* under the views, the column editor adds an info command to each column, and the quick find shows each column's name in its callout. Open each of them.`,
            },
        },
    },
}
