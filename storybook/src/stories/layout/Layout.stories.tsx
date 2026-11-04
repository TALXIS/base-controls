import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { FilterChipsExample, SectionTabsExample, ToolbarExample } from './compactPartsExamples'

const DESCRIPTION = `
Layout tools fit a component to the box it is given, not to the window: the same control may fill a page, sit in a narrow side panel or open on a phone. A *compact provider* measures its box, and every part inside it asks \`useCompact()\` whether to draw full size or compact, so a button drops its label or tabs become a dropdown. Try it below: narrow the toolbar until the buttons turn into icons.

{{canvas: Toolbar}}

## Shrink when parts would wrap

\`WrapCompactProvider\` keeps its parts full size while they fit on one line, and turns them compact the moment they would wrap. In the toolbar above, a button drops its label and a search box narrows.

After every render and every resize, it checks whether a part has moved onto a second line, so the row must be allowed to wrap: give it \`flexWrap: 'wrap'\`.

Adding a part needs nothing: if it does not fit, the parts turn compact. They turn back to full size only once the box is wider than it was when they wrapped, so the toolbar does not flicker at the edge.

## Remove a part

When a part goes, the others may fit again, but the box has not grown, so the provider stays compact. A part that can disappear calls \`useCompactItem()\`, which tells the provider when it goes, and the provider tries full size again. If the parts still do not fit, they turn compact before anything is drawn.

{{story: Filter chips}}

## Shrink below a width

\`BreakpointCompactProvider\` makes its parts compact while its box is at most \`maxCompactWidth\` wide: 479px by default, the width of a phone. The width is the box's outer width (\`offsetWidth\`), padding and border included. Use it when compact means a different component, such as tabs that turn into a dropdown and keep the open section.

{{story: Section tabs}}

## Providers and parts

- Both providers render a \`div\` and pass it any other props, so they are the box itself: give them the flex row or the padding the area needs.
- Some parts already respond on their own: \`CommandBar\` shows only its icons when compact, and the DatasetControl header is a compact provider.
- Outside a provider, \`useCompact()\` returns \`false\`, so a part that shrinks still works anywhere.
- To pin one part at full size inside a compact area, or keep it compact everywhere, wrap it in \`<CompactContext.Provider value={false}>\` or \`value={true}\`.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Layout', iconName: 'ViewDashboard', href: '?path=/docs/controls-datasetcontrol-layout--overview', text: 'How the DatasetControl header shrinks its parts, and how to place your own in it.' },
    { title: 'Fluent UI', iconName: 'Puzzle', href: '?path=/docs/concepts-fluent-ui--overview', text: 'Base Controls\' CommandBar, which folds its commands when its own box resizes.' },
]

const meta = {
    title: 'Concepts/Layout',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { explore: () => <ExploreCards cards={EXPLORE} /> }),
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
}

export const FilterChips: Story = {
    name: 'Filter chips',
    render: () => renderStory(<FilterChipsExample />),
    parameters: {
        docs: {
            description: {
                story: `Four filters do not fit, so the chips show only their values. Try: remove two chips and watch the rest get their labels back.`,
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
                story: `A \`BreakpointCompactProvider\` at its default 479px, as wide as the slider sets. Try: open **Activities**, then narrow it until the tabs become a dropdown.`,
            },
        },
    },
}
