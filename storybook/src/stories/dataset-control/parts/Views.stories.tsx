import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ViewsExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `\`DatasetControl.ViewSwitcher\` shows the current view's name, and opens the list of views \`onLoad\` returned. Picking a view loads it.

\`\`\`tsx
<DatasetControl.Header.Start>
    <DatasetControl.ViewSwitcher />
</DatasetControl.Header.Start>
\`\`\`

- Views are listed under their \`group\`, in the order the groups first appear. Views without one are listed under *System views*.
- The current view is highlighted.
- Picking a view calls \`onLoad\` again with its \`viewId\`, shows the placeholder while it runs, then shows the new provider and destroys the old one. See [**Loading data**](?path=/docs/datasetcontrol-get-started-loading-data--overview).
- When the records have unsaved changes, the control asks first, and stays on the view if the user cancels.
- Switching back to a view puts it back as the user left it: sorted, searched, paged and scrolled. See [**State**](?path=/docs/datasetcontrol-state-overview--overview).
- To switch views from your own code, call \`runtime.reload({ viewId })\`. See [**Extending**](?path=/docs/datasetcontrol-customization-extending--overview).

| Prop | What it does |
|---|---|
| \`labels\` | \`ungroupedViewsHeader\`, the header of the views without a group. See [**Localization**](?path=/docs/datasetcontrol-localization-overview--overview). |
| \`components\` | \`onRenderButton\`, whose \`menuProps.items\` are the views. See [**Appearance**](?path=/docs/datasetcontrol-customization-appearance--overview). |

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
