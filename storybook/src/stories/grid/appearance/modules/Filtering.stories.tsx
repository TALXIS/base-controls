import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { FilterIconExample } from '../../../../grid/examples/moduleComponentsExamples'

const DESCRIPTION = `
The filtering module draws an icon in the header of every filtered column, and the callout a column's filter is set in. To change how they look across the grid, pass \`components\` to \`createFilteringModule\`.

\`\`\`tsx
createFilteringModule({ components: { filterIcon: { onRenderIcon: props => <Icon {...props} iconName='FilterSolid' /> } } })
\`\`\`

- Every key and part is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the grid does not redraw on every render.

| Key | Parts | What it draws |
|---|---|---|
| \`filterIcon\` | \`onRenderIcon\` | The icon of a filtered column |
| \`filterCallout\` | \`onRenderCallout\`, \`onRenderHeader\`, \`onRenderTitle\`, \`onRenderCloseButton\` | The callout a filter is set in |

## One column only

The funnel is a header adornment keyed \`'filter'\`. To change it on one column, replace or remove that adornment in the column's \`context.header.onGetAdornments\`, which runs after the modules have added theirs. The callout is one for the whole grid, so it has no per-column path.

{{story: A filter that stands out}}
`

const meta = {
    title: 'Grid/Appearance/Modules/Filtering',
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

export const AFilterThatStandsOut: Story = {
    name: 'A filter that stands out',
    render: () => renderStory(<FilterIconExample />),
    parameters: {
        docs: {
            description: {
                story: `\`filterIcon\` marks the filtered In stock column with a solid blue icon, and \`filterCallout.onRenderTitle\` heads the callout with what it filters by. Open the In stock filter from its menu.`,
            },
        },
    },
}
