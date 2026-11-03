import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { FullPageExample, PickPartsExample } from '../../dataset-control/examples/layoutExamples'

const DESCRIPTION = `
The control is laid out in *regions*: a header above the records, a body that holds them and a footer below them. The header and the footer each have a start and an end.

\`\`\`tsx
<DatasetControl onLoadViews={loadViews} onLoad={loadDeals} height='600px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.Ribbon onLoad={loadCommands} />
            <DatasetControl.EditColumns />
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>...</DatasetControl.Body>
    <DatasetControl.Footer>
        <DatasetControl.Footer.Start>
            <DatasetControl.PageSizeSwitcher />
        </DatasetControl.Footer.Start>
        <DatasetControl.Footer.End>
            <DatasetControl.Pagination />
        </DatasetControl.Footer.End>
    </DatasetControl.Footer>
</DatasetControl>
\`\`\`

| Region | Description |
|---|---|
| \`Header\` | The row above the records. |
| \`Header.Start\`, \`Header.End\` | The header's left and right side. They only decide where a part sits; every part sizes itself. |
| \`Body\` | Fills the height the header and footer leave. Put what shows the records here. |
| \`Footer\` | The row below the records, with a line above it. |
| \`Footer.Start\`, \`Footer.End\` | The footer's left and right side. |

Each region takes \`className\`, and \`components\` for its box (see [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview)). A region takes your own content too, such as the page title placed directly in \`Header\` in the full-page example below. Anything else inside the control, such as \`DatasetControl.Notifications\`, sits between the regions in the order you write it.

## Size the control

\`height\` sizes the control's box. The header and the footer keep their own height, and the body takes the rest, so whatever shows the records there fills it.

| \`height\` | The control |
|---|---|
| A length, such as \`'600px'\` | Exactly that tall. |
| \`'100%'\` | Fills its parent, which needs a height of its own. |
| Left out | As tall as what it holds. |

A grid in the body takes its height from the control, so it needs none of its own.

{{story: Fill the whole page}}

## Place the parts

Any part works in any region. \`Start\` puts it on the left and \`End\` on the right, and the parts keep the order you write them in. A part that lines up its buttons, such as the ribbon or the paging, starts them on the left in \`Start\` and on the right in \`End\`. A part of your own reads which side it is on with \`useDatasetControlRegion()\`.

## Fit a narrow screen

The layout follows the control's own width, not the window's.

| As the control narrows | What gives way |
|---|---|
| The free space runs out | The view switcher and the ribbon share what is left: a long view name ends in an ellipsis, and the ribbon moves commands into its overflow menu. The quick find shrinks from 230px to 160px. |
| The header's parts no longer fit on one line | The header turns *compact*: the ribbon and Edit columns show only their icons, with their names in a tooltip, and the quick find becomes a search button, with a dot while it holds a query. Clicking it opens the field across the whole header until you leave it. |
| The footer's parts no longer fit | The footer's \`End\` moves onto a line of its own. |

The header stays compact until the control is wider than it was when the parts ran out of room, or until you take a part out.

### Your own part in a compact header

The header is a \`WrapCompactProvider\`, so a part of your own reads whether it is compact with \`useCompact()\` and shrinks the way the built-in parts do. How it works, and the same providers for layouts of your own, are on [**Concepts › Layout**](?path=/docs/concepts-layout--overview).

{{story: Pick your parts}}
`

const meta = {
    title: 'Controls/DatasetControl/Layout',
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

export const PickYourParts: Story = {
    name: 'Pick your parts',
    render: () => renderStory(<PickPartsExample />),
    parameters: {
        docs: {
            description: {
                story: `Each part keeps its side, and the rows keep their height. Try: narrow the control with the slider until the header turns compact, open the search, then turn parts off to see the header go back to full size.`,
            },
        },
    },
}

export const TheWholePage: Story = {
    name: 'Fill the whole page',
    render: () => <FullPageExample />,
    parameters: {
        layout: 'fullscreen',
        docs: {
            story: { inline: false, iframeHeight: 560 },
            description: {
                story: `The control as the whole page, filling the window with \`height='100%'\`, its title in the header. Try: open it on its own and resize the window; the grid fills what the header and footer leave.`,
            },
        },
    },
}
