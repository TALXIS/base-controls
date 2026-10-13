import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { RibbonExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `\`DatasetControl.Ribbon\` shows the commands your \`onLoad\` returns, runs one when it is clicked, and calls \`onLoad\` again whenever the selected records change. Read the selection from the provider inside \`onLoad\`, and return only the commands that apply to it.

\`\`\`tsx
const DealsRibbon = () => {
    const provider = useDataProvider()
    const onLoad = async (): Promise<IRibbonCommand[]> => {
        const selectedIds = provider.getSelectedRecordIds()
        return selectedIds.length === 0 ? [] : [{ id: 'delete', label: 'Delete', iconName: 'Delete', onExecute: () => deleteDeals(selectedIds) }]
    }
    return <DatasetControl.Ribbon onLoad={onLoad} />
}
\`\`\`

- A command is \`{ id, label, tooltip?, iconName?, isDisabled?, onExecute }\`. Commands are shown in the order they are returned.
- While a command's \`onExecute\` runs, its button is disabled.
- To load the commands again yourself, such as after a command changed which ones apply, call \`reload()\` on the ribbon \`onReady\` hands you.
- While the commands load, a shimmer stands in for them. When \`onLoad\` throws, the ribbon shows the error, with *Details* and *Try again*.
- In \`Header.End\` the commands sit against the right; in \`Header.Start\`, against the left. Commands that do not fit move into the overflow menu.
- The same ribbon, without the reload on selection, is exported as \`Ribbon\`, for a command bar outside DatasetControl.

All its props are on [**Parts**](?path=/docs/datasetcontrol-api-parts--overview) of the API, and the command's fields on [**Hooks and types**](?path=/docs/datasetcontrol-api-hooks-and-types--overview).

{{story: Commands for the selected deals}}
`

const meta = {
    title: 'DatasetControl/Parts/Ribbon',
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

export const CommandsForTheSelectedDeals: Story = {
    name: 'Commands for the selected deals',
    render: () => renderStory(<RibbonExample />),
    parameters: {
        docs: {
            description: {
                story: `Select deals: *Mark N as won* and *Reopen* follow the stage of the selected deals, and *Copy name* shows for a single deal. Marking takes a moment, during which the button is disabled, then the ribbon loads its commands again.`,
            },
        },
    },
}
