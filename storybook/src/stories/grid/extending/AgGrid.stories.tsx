import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { SetAgGridOptionExample, UseAgGridApiExample } from '../../../grid/examples/agGridExamples'

const DESCRIPTION = `
The grid is built on AG Grid, and you can reach it directly. Reach for it only for what no hook on [**Extending**](?path=/story/grid-extending--overview) covers.

## Options

The runtime has two hooks over the options AG Grid is given:

| Hook | Options |
|---|---|
| \`registerAgGridInitialOptions\` | The ones AG Grid reads once, when it is created, such as \`serverSideInitialRowCount\`. |
| \`registerAgGridOptions\` | The ones AG Grid can be handed at any time, such as \`headerHeight\`. |

Both are handed \`{ options }\` to change. After something your hook reads has changed, call \`runtime.refreshAgGridOptions()\`: the grid runs the hooks again and hands AG Grid the options that changed.

## The api

AG Grid's api is the \`gridApi\` service. It is there once the grid is ready: take it in \`onGridReady\`, or with \`runtime.services.find('gridApi')\`.

\`\`\`tsx
<Grid.Root
    provider={provider}
    modules={modules}
    onGridReady={runtime => runtime.services.get('gridApi').autoSizeAllColumns()} />
\`\`\`
`

const meta = {
    title: 'Grid/Extending/AG Grid',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
            description: { component: DESCRIPTION },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const SetAnAgGridOption: Story = {
    name: 'Set an AG Grid option',
    render: () => renderStory(<SetAgGridOptionExample />),
    parameters: {
        docs: {
            description: {
                story: `The hook reads a ref, and the toggle calls \`refreshAgGridOptions()\` after changing it.`,
            },
        },
    },
}

export const UseAgGridsApi: Story = {
    name: "Use AG Grid's api",
    render: () => renderStory(<UseAgGridApiExample />),
}
