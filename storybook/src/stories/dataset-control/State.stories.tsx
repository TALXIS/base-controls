import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { BackWhereYouLeftOffExample, InsideTheStoreExample } from '../../dataset-control/examples/stateExamples'

const DESCRIPTION = `
A DatasetControl puts every view back the way the user left it: the records sorted, filtered, searched and paged as they were, the columns they chose, and the grid scrolled where it was.

- **Switching back to a view** puts it back, for as long as the control is mounted.
- **Mounting the control again** opens it on the view the user was on, still as they left it. That needs a \`stateKey\`: the control keeps everything under it in the state store. How long the store lasts, and how to persist it, is on [**StateProvider**](?path=/docs/providers-stateprovider--overview).

\`\`\`tsx
<DatasetControl stateKey='deals' onLoad={loadDeals} height='600px'>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={modules} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

{{story: Back where you left off}}

## What the control keeps

| What | Kept | Put back |
|---|---|---|
| The view the user is on | When they leave it, and when the control unmounts | On the next mount: \`onLoad\` is called with its \`viewId\`. |
| Per view: the records' columns and the related tables they come from, sorting, filtering, page, page size, search and selection | When the user leaves the view, and when the control unmounts | Whenever the view loads again, onto the provider \`onLoad\` returns, before its first page loads. |
| Per view: what the parts keep, such as where a grid is scrolled | As the user works | Whenever the view is shown again. |

- A grid keeps its state only with a \`stateKey\` of its own, unique within the control. What it keeps is on [**Grid › State**](?path=/docs/grid-state--overview).
- A view the user hasn't been on yet starts from what \`onLoad\` returns. A view they have been on starts from what was kept, so a change to the view's definition on your server, such as its sorting, shows only for users who haven't changed it yet.
- \`control.reload()\` keeps the setup of the view shown too, since the view is left and loaded again.

## Look inside the store

Everything the control keeps is plain data in the state store, under its \`stateKey\`: the view the user is on, and an entry per view. The example keeps the store in a dictionary of its own, as a PCF control's state would, and shows it next to the control. The layout of the entries is for illustration and may change; read the provider's kept setup through \`IDatasetControlProviderState\` instead.

{{story: Look inside the store}}

## Keep your own part's state

\`useControlStateStore(stateKey)\` returns the store a component of your own keeps its state in. Inside a DatasetControl it belongs to the view shown, so it comes back with the view; outside one it is the nearest \`StateProvider\`'s. Without a \`stateKey\`, it keeps nothing.

\`\`\`tsx
const OnlyMineToggle = () => {
    const store = useControlStateStore('only-mine')
    const [onlyMine, setOnlyMine] = React.useState(store.get<boolean>('checked') ?? false)
    const toggle = (checked: boolean) => {
        setOnlyMine(checked)
        store.set('checked', checked)
    }
    return <Toggle label='Only mine' checked={onlyMine} onChange={(_, checked) => toggle(!!checked)} />
}
\`\`\`

A gallery that keeps its scroll this way is under *Your own collection view* on [**Your own parts**](?path=/docs/datasetcontrol-your-own-parts--overview).
`

const meta = {
    title: 'DatasetControl/State',
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

export const BackWhereYouLeftOff: Story = {
    name: 'Back where you left off',
    render: () => renderStory(<BackWhereYouLeftOffExample />),
    parameters: {
        docs: {
            description: {
                story: `Every view comes back as the user left it, and the control reopens on the last view. Try: sort *All deals* by value, search and scroll, switch to *Won deals* and back, then hide the deals and show them again.`,
            },
        },
    },
}

export const InsideTheStore: Story = {
    name: 'Look inside the store',
    render: () => renderStory(<InsideTheStoreExample />),
    parameters: {
        docs: {
            description: {
                story: `The store beside the control, as plain data. Try: scroll the grid and watch \`views.all.parts.grid\` follow, then sort and switch to *Won deals* to see \`views.won\` start its own entry.`,
            },
        },
    },
}
