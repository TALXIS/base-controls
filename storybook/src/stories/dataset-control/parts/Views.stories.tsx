import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ViewsExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `
\`DatasetControl.ViewSwitcher\` shows the view the user is on, and lists the views its own \`onLoad\` returns. Picking one loads it through the control's \`onLoad\`.

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
- Picking a view calls the control's \`onLoad\` with the view's \`id\`, behind the placeholder. See [**Loading data**](?path=/docs/datasetcontrol-loading-data--overview).
- When the records have unsaved changes, the control asks first, and stays on the view if the user cancels.
- Switching back to a view puts it back as the user left it: sorted, searched, paged and scrolled. See [**State**](?path=/docs/datasetcontrol-state--overview).
- While the views load, a shimmer shows in place of the switcher. When the switcher's \`onLoad\` throws, it shows the error, with *Details* and *Try again*.

{{story: Switch between views}}

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`onLoad\` | \`() => Promise<IDatasetControlView[]>\` | Required | Returns the views to list. Called when the switcher mounts, which is after every load of the control, and on \`reload()\`. |
| \`labels\` | \`Partial<IViewSwitcherLabels>\` | English | See [**Localization**](?path=/docs/datasetcontrol-localization--overview). |
| \`components\` | \`IViewSwitcherComponents\` | Defaults | See [**Appearance**](?path=/docs/datasetcontrol-appearance--overview). |

## From your code

\`control.parts.get('viewSwitcher')\` returns the switcher while it is rendered. See *Parts live as long as a load* on [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview). To load a view, call \`control.loadView(viewId)\`. To list the views again, such as after the user saved a new one, call the switcher's \`reload()\`:

\`\`\`tsx
const saveView = async () => {
    await saveDealView(...)
    control.parts.get('viewSwitcher').reload()
}
\`\`\`

| Member | Description |
|---|---|
| \`getViews()\` | The views the switcher's \`onLoad\` returned; \`undefined\` until it first finishes. |
| \`getCurrentView()\` | The view shown; \`undefined\` when it is not among the views. |
| \`select(viewId)\` | Loads the view, as picking it does; nothing when it is already shown. |
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
    name: 'Switch between views',
    render: () => renderStory(<ViewsExample />),
    parameters: {
        docs: {
            description: {
                story: `Three views of the deals, *Biggest deals* under *My views*. Try: switch between them, then double-click a deal, change it and switch again; the control asks before it throws your change away.`,
            },
        },
    },
}
