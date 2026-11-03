import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { FilterChipsExample, SectionTabsExample, ToolbarExample } from './compactPartsExamples'

const DESCRIPTION = `
When a row of parts runs out of room, it reads better if the parts shrink than if the row wraps or overflows: a button drops its label, a search box narrows, tabs become a dropdown. A *compact provider* decides when that happens by measuring its own box, not the window, and every part inside it asks \`useCompact()\` whether to draw full size or compact. Each part decides for itself what compact means. Try it below: drag the slider until the buttons turn into icons, then widen it again and see where they come back.

{{canvas: Toolbar}}

## Shrink when parts would wrap

\`WrapCompactProvider\` keeps its parts full size while they fit on one line, and turns them compact the moment they would wrap. In the toolbar above, a button drops its label and a search box narrows.

It notices a wrap by its box growing taller, so it needs two things:

- The row is allowed to wrap: give it \`flexWrap: 'wrap'\`.
- Full and compact parts are the same height.

Adding a part needs nothing: if it does not fit, the box grows and the parts turn compact.

The parts turn back to full size only once the box is wider than it was when they wrapped. Waiting for the box to grow is what stops the toolbar flickering while you resize right at the edge.

## Remove a part

Removing a part has a catch: the others may fit again, but the box has not grown, so the provider stays compact. A part that can disappear calls \`useCompactItem()\`, which tells the provider when it goes, and the provider tries full size again. If the parts still do not fit, they turn compact before anything is drawn.

{{story: Filter chips}}

## Shrink below a width

\`BreakpointCompactProvider\` makes its parts compact while its box is at most \`maxCompactWidth\` wide: 479px by default, the width of a phone. The width is the box's outer width (\`offsetWidth\`), padding and border included.

Reach for it when compact means a different component, not just different styles: CSS can restack a card, but it cannot turn tabs into a dropdown and keep the open section.

{{story: Section tabs}}

## Good to know

- Both providers render a \`div\` and pass it any other props, so they are the box itself: give them the flex row or the padding the area needs.
- Some parts already respond on their own: \`CommandBar\` shows only its icons when compact, and the DatasetControl header is a compact provider (see [**DatasetControl › Layout**](?path=/docs/controls-datasetcontrol-layout--overview)).
- Outside a provider, \`useCompact()\` returns \`false\`, so a part that shrinks still works anywhere.
- To pin one part at full size inside a compact area, or keep it compact everywhere, wrap it in \`<CompactContext.Provider value={false}>\` or \`value={true}\`.
`

const meta = {
    title: 'Concepts/Layout/Compact parts',
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

export const Toolbar: Story = {
    name: 'Toolbar',
    render: () => renderStory(<ToolbarExample />),
    parameters: {
        docs: {
            description: {
                story: `Try: drag the slider until the buttons turn into icons, then widen it again and see where they come back.`,
            },
        },
    },
}

export const FilterChips: Story = {
    name: 'Filter chips',
    render: () => renderStory(<FilterChipsExample />),
    parameters: {
        docs: {
            description: {
                story: `Four filters do not fit, so the chips show only their values. Try: remove two chips and watch the rest get their labels back; then turn off \`useCompactItem()\` and do the same.`,
            },
        },
    },
}

export const SectionTabs: Story = {
    name: 'Section tabs',
    render: () => renderStory(<SectionTabsExample />),
    parameters: {
        docs: {
            description: {
                story: `A \`BreakpointCompactProvider\` at its default 479px. Try: open *Activities*, then drag below 480px; the tabs become a dropdown with *Activities* still open.`,
            },
        },
    },
}
