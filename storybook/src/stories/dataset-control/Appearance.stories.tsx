import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { YourOwnPiecesExample } from '../../dataset-control/examples/appearanceExamples'

const DESCRIPTION = `
Every part takes \`components\`, which replaces pieces of what it draws. A piece receives the props its default would get, so you can change them and render the default, or render something of your own.

\`\`\`tsx
<DatasetControl.ViewSwitcher onLoad={loadViews} components={{ onRenderButton: props => <MyViewButton {...props} /> }} />
\`\`\`

- Every piece is optional: what you leave out keeps its default.
- A piece inside a part, such as the quick find's callout, has its pieces under its own name: \`components={{ callout: { onRenderColumn } }}\`.
- The defaults are exported, such as \`ViewSwitcherUiComponents\`, to render the default with your changes.
- \`DatasetControl.Ui\` holds the regions and most parts as plain UI, with no control behind them, for building something that looks like a built-in part. The ribbon and the notifications are not in it: use the exported \`Ribbon\` and \`NotificationMessageBar\`.

{{story: Replace pieces of the parts}}

## Every piece

| Part | Key | Description |
|---|---|---|
| \`DatasetControl\` | Top level | \`onRenderContainer\`: the control's box |
| \`DatasetControl\` | \`skeleton\` | \`onRenderSkeleton\`, and \`loadingBoundary\`, whose container is the placeholder. Render \`<div {...props} />\` there for a spinner instead. |
| \`DatasetControl\` | \`errorMessage\` | \`onRenderMessageBar\`, \`onRenderTooltip\`, \`onRenderTitle\`, \`onRenderCommandBar\`: the error shown when loading fails |
| \`Header\`, \`Header.Start\`, \`Header.End\`, \`Body\`, \`Footer\`, \`Footer.Start\`, \`Footer.End\` | Top level | \`onRenderContainer\` |
| \`ViewSwitcher\` | Top level | \`onRenderButton\`, whose \`menuProps.items\` are the views |
| \`ViewSwitcher\` | \`loadingBoundary\` | What shows while the views load |
| \`ViewSwitcher\` | \`errorMessage\` | The error when the switcher's \`onLoad\` throws |
| \`Ribbon\` | Top level | \`onRenderCommandBar\`, whose \`items\` are the commands |
| \`Ribbon\` | \`loadingBoundary\` | What shows while the commands load |
| \`Ribbon\` | \`errorMessage\` | The error when the ribbon's \`onLoad\` throws |
| \`QuickFind\` | Top level | \`onRenderContainer\`, \`onRenderTextField\`, \`onRenderCallout\` |
| \`QuickFind\` | \`callout\` | \`onRenderCallout\`, \`onRenderLikeWarning\`, \`onRenderDescription\`, \`onRenderColumns\`, \`onRenderColumn\` |
| \`EditColumns\` | \`button\` | \`onRenderButton\` |
| \`EditColumns\` | \`panel\` | \`onRenderPanel\`, \`onRenderFooter\`, \`onRenderCommandBar\` (empty by default) |
| \`EditColumns\` | \`scopeSelector\`, \`columnSelector\` | \`onRenderSelector\`, \`onRenderOption\` |
| \`EditColumns\` | \`columnList\` | \`onRenderColumn\`, whose \`commands\` hold the remove button |
| \`EditColumns\` | \`errorMessage\` | The error when \`onLoadColumns\` or \`onLoadScopes\` throws |
| \`Notifications\` | Top level | \`onRenderNotifications\` |
| \`EmptyRecords\` | Top level | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderText\` |
| \`Pagination\` | Top level | \`onRenderCommandBar\` |
| \`PageSizeSwitcher\` | Top level | \`onRenderButton\` |
`

const meta = {
    title: 'DatasetControl/Appearance',
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
    name: 'Replace pieces of the parts',
    render: () => renderStory(<YourOwnPiecesExample />),
    parameters: {
        docs: {
            description: {
                story: `The view switcher adds *Manage views* under the views, the column editor adds an info command to each column, and the quick find shows each column's name in its callout. Try: open each of them.`,
            },
        },
    },
}
