import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ViewsExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `\`DatasetControl.ViewSwitcher\` shows the view the user is on, and lists the views your \`onLoad\` returns. Picking one loads it.

\`\`\`tsx
const loadViews = async (): Promise<IDatasetControlView[]> => {
    const views = await fetchDealViews()
    return views.map(view => ({ id: view.id, name: view.name, group: view.isPersonal ? 'My views' : undefined }))
}

<DatasetControl.Header.Start>
    <DatasetControl.ViewSwitcher onLoad={loadViews} />
</DatasetControl.Header.Start>
\`\`\`

- A view is \`{ id, name, group? }\`. Views are listed under their \`group\`, in the order the groups first appear, and views without one under *System views*.
- Picking a view calls the control's \`onLoad\` with its \`id\`, behind the placeholder. See [**Loading data**](?path=/docs/datasetcontrol-loading-data--overview).
- When the records have unsaved changes, the control asks first, and stays on the view if the user cancels.
- Switching back to a view puts it back as the user left it: sorted, searched, paged and scrolled. See [**State**](?path=/docs/datasetcontrol-state--overview).
- While the views load, a shimmer stands in for the switcher. When \`onLoad\` throws, the switcher shows the error, with *Details* and *Try again*.

{{story: Switch the view}}

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`onLoad\` | \`() => Promise<IDatasetControlView[]>\` | Required | Returns the views to list. Called at mount, after every view loads, and on \`reload()\`. |
| \`labels\` | \`Partial<IViewSwitcherLabels>\` | English | See [**Localization**](?path=/docs/datasetcontrol-localization--overview). |
| \`components\` | \`IViewSwitcherComponents\` | Defaults | See [**Appearance**](?path=/docs/datasetcontrol-appearance--overview). |

## From your code

To load a view, call \`control.loadView(viewId)\`: see [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview). The switcher itself is \`control.parts.get('viewSwitcher')\`. Call its \`reload()\` to list the views again, such as after the user saved a new one:

\`\`\`tsx
const saveView = async () => {
    await saveDealView(...)
    control.parts.get('viewSwitcher').reload()
}
\`\`\`

| Member | Description |
|---|---|
| \`getViews()\` | The views \`onLoad\` returned; \`undefined\` until it first finishes. |
| \`getCurrentView()\` | The view shown; \`undefined\` when it is not among the views. |
| \`select(viewId)\` | Loads the view, as picking it does. |
| \`reload()\` | Calls \`onLoad\` again. |
| \`getError()\` | What the last \`onLoad\` threw, until the next one starts. |
| \`events\` | \`onBeforeLoad\` and \`onLoaded\`, around every \`onLoad\`. |
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
