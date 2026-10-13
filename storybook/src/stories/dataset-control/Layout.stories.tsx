import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { FullPageExample, PickPartsExample } from '../../dataset-control/examples/layoutExamples'

const DESCRIPTION = `
The control is laid out in *regions*: a header above the records, a body that holds them and a footer below them. The header and the footer each have a start and an end, so every part keeps its place whatever else you leave out.

\`\`\`tsx
<DatasetControl onLoad={loadDeals} height='600px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher onLoad={loadViews} />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.Ribbon onLoad={loadCommands} />
            <DatasetControl.EditColumns onLoadColumns={loadColumns} />
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
| \`Header.Start\`, \`Header.End\` | The header's left side, sized to what it holds, and its right side, taking the rest of the row. |
| \`Body\` | Fills the height the header and footer leave. Put what shows the records here. |
| \`Footer\` | The row below the records, with a line above it. |
| \`Footer.Start\`, \`Footer.End\` | The footer's left and right sides. |

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

- The view switcher goes in \`Header.Start\`; Edit columns and the quick find in \`Header.End\`, the quick find last.
- The ribbon goes in \`Header.End\`, next to the search. Without a view switcher, put it in \`Header.Start\`, so its commands start on the left.
- The page size switcher goes in \`Footer.Start\`, and the paging in \`Footer.End\`.

A part's look follows its region: the ribbon and the paging draw their buttons against the left in \`Start\` and against the right in \`End\`.

## Fit a narrow screen

The layout follows the control's own width, not the window's. As it narrows:

1. The ribbon's commands move into its overflow menu, down to the menu alone.
2. The quick find shrinks from 230px to 160px, and a long view name is cut with an ellipsis.
3. The parts of \`Header.End\` wrap onto the next line one by one, from the last, still on the right. Below 480px, the quick find fills its line.
4. The footer's \`End\` moves onto a line of its own.

A region takes any number of parts, and nothing runs out of the control.

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
                story: `Each part keeps its side, and the rows keep their height. Try: turn parts on and off, add a button of your own, then narrow the control with the slider to watch the ribbon fold its commands and the header parts wrap.`,
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
