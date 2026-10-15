import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { FullPageExample, PickPartsExample } from '../../dataset-control/examples/layoutExamples'

const DESCRIPTION = `
The control is laid out in *regions*: a header above the records, a body that holds them and a footer below them. The header and the footer each have a start and an end.

\`\`\`tsx
<DatasetControl onLoad={loadDeals} height='600px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher onLoad={loadViews} />
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

- Each region takes \`className\`, and \`components\` to replace its box: see [**Appearance**](?path=/docs/datasetcontrol-appearance--overview).
- A region takes your own content too, such as a page title placed directly in \`Header\`, as the full-page example below does.
- Anything else you put inside the control, such as \`DatasetControl.Notifications\`, sits between the regions in the order you write it.

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

Any part works in any region. \`Start\` puts it on the left and \`End\` on the right, and the parts keep the order you write them in. A part that lines up its buttons, such as the ribbon or the paging, starts them on the left in \`Start\` and on the right in \`End\`.

The examples here put the view switcher in \`Header.Start\`, the ribbon, Edit columns and the quick find in \`Header.End\`, the page size switcher in \`Footer.Start\` and the paging in \`Footer.End\`.

## Fit a narrow screen

The layout follows the control's own width, not the window's. As it narrows:

1. The view switcher and the ribbon share the free space. A long view name is cut with an ellipsis, and the ribbon moves its commands into its overflow menu.
2. The quick find shrinks from 230px to 160px.
3. Once the header's parts no longer fit on one line, the header turns *compact*:
    - the ribbon and Edit columns show only their icons, with their names in a tooltip;
    - the quick find becomes a search button, with a dot while the field holds text. Clicking it opens the field across the whole header, and the other parts come back once you leave it.
4. The footer's \`End\` moves onto a line of its own.

The header stays compact until the control is wider than it was when the parts ran out of room, or until you take a part out.

### Your own part in a compact header

\`useCompact()\` tells your part whether the header is compact, so it can shrink the way the built-in parts do:

\`\`\`tsx
const ExportButton = () => {
    const isCompact = useCompact()
    if (isCompact) {
        return <TooltipHost content='Export to Excel'>
            <IconButton iconProps={{ iconName: 'ExcelDocument' }} ariaLabel='Export to Excel' />
        </TooltipHost>
    }
    return <DefaultButton text='Export to Excel' iconProps={{ iconName: 'ExcelDocument' }} />
}
\`\`\`

To keep one part at full size, or always compact, wrap it in \`<CompactContext.Provider value={false}>\` or \`value={true}\`.

{{story: Pick your parts}}
`

const meta = {
    title: 'DatasetControl/Layout',
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
