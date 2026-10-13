import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ViewsExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `\`DatasetControl.ViewSwitcher\` shows the current view's name, and opens the list of views your \`onLoad\` returns. Picking a view loads it.

\`\`\`tsx
const loadViews = async (): Promise<IDatasetControlView[]> => {
    const views = await fetchDealViews()
    return views.map(view => ({ id: view.id, name: view.name, group: view.isPersonal ? 'My views' : undefined }))
}

<DatasetControl.Header.Start>
    <DatasetControl.ViewSwitcher onLoad={loadViews} />
</DatasetControl.Header.Start>
\`\`\`

- A view is \`{ id, name, group? }\`. Views are listed under their \`group\`, in the order the groups first appear. Views without one are listed under *System views*.
- The current view is the one the control's own \`onLoad\` loaded, and it is highlighted.
- While the views load, a shimmer stands in for the switcher. When \`onLoad\` throws, the switcher shows the error, with *Details* and *Try again*.
- Picking a view calls the control's \`onLoad\` with its \`viewId\`, shows the placeholder while it runs, then shows the new provider and destroys the old one. See [**Loading data**](?path=/docs/datasetcontrol-get-started-loading-data--overview).
- When the records have unsaved changes, the control asks first, and stays on the view if the user cancels.
- Switching back to a view puts it back as the user left it: sorted, searched, paged and scrolled. See [**State**](?path=/docs/datasetcontrol-get-started-state--overview).
- To switch views from your own code, call \`control.loadView(viewId)\`. See [**Your own parts**](?path=/docs/datasetcontrol-customization-your-own-parts--overview).
- To list the views again, such as after the user saved a new one, call \`reload()\` on the switcher \`onReady\` hands you.

All its props, and what \`control.parts.get('viewSwitcher')\` offers, are on [**Parts**](?path=/docs/datasetcontrol-api-parts--overview) of the API.

{{story: Switch the view}}
`

const meta = {
    title: 'DatasetControl/Parts/Views',
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

export const SwitchTheView: Story = {
    name: 'Switch the view',
    render: () => renderStory(<ViewsExample />),
    parameters: {
        docs: {
            description: {
                story: `Three views of the deals, *Biggest deals* under *My views*. Switch between them, then double-click a deal, change it and switch again: the control asks before it throws your change away.`,
            },
        },
    },
}
