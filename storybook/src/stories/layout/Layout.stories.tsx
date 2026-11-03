import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { FilterChipsExample, SectionTabsExample, ToolbarExample } from './layoutExamples'

const DESCRIPTION = `
A control should fit wherever it is put: a full page, a side panel or a phone. So it does not ask how wide the window is; it asks the box it sits in. Wrap an area in a *compact provider*, and every part inside it can ask \`useCompact()\` whether to draw full size or compact.

## Shrink when it no longer fits

\`WrapCompactProvider\` keeps its parts full size for as long as they fit on one line. The moment they would wrap, it turns them compact. Each part decides what compact means for itself: here a button drops its label and a search box narrows.

{{story: Toolbar}}

It turns back to full size only once the box is wider than it was when the parts ran out of room. That margin is what stops the toolbar from flickering between the two while you resize right at the edge.

## Parts that come and go

That margin has a catch. Remove a part, and the others may fit again, but the box has not grown, so the provider would stay compact. A part that can disappear calls \`useCompactItem()\`, which tells the provider when it goes, and the provider tries full size again. If the parts still do not fit, it turns them compact before anything is drawn.

{{story: Filter chips}}

## Shrink below a width

When a part should change at a fixed size rather than when it overflows, use \`BreakpointCompactProvider\`. Its parts are compact while the box is at most \`maxCompactWidth\` wide, 479px by default, the width of a phone. Reach for it when compact means a different component, not just different styles: CSS can restack a card, but it cannot turn tabs into a dropdown and keep the open section.

{{story: Section tabs}}

## Good to know

Both providers render a \`div\` and pass it any other props, so they are the box itself: give them the flex row or the padding the area needs. Outside a provider, \`useCompact()\` returns \`false\`, so a part that shrinks still works anywhere. And to pin one part at full size inside a compact area, or keep it compact everywhere, wrap it in \`<CompactContext.Provider value={false}>\` or \`value={true}\`.
`

const meta = {
    title: 'Concepts/Layout',
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
