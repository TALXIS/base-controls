import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { BackWhereYouLeftOffExample, InsideTheStoreExample } from '../../dataset-control/examples/stateExamples'

const DESCRIPTION = `
A DatasetControl puts every view back the way the user left it: sorted, filtered, searched and paged as it was, with the columns they chose and the grid scrolled where it was. Switching back to a view does that on its own. To also reopen on the same view, still as the user left it, the next time the control mounts, give it a \`stateKey\`.

\`\`\`tsx
<DatasetControl stateKey='deals' onLoadViews={loadViews} onLoad={loadDeals} height='600px'>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={modules} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

| \`stateKey\` | Where the control keeps it | How long it lasts |
|---|---|---|
| Left out | A store of its own | While the control stays mounted, across view switches and reloads. |
| Given | Under the key in the nearest state store | As long as the store does. See [**StateProvider**](?path=/docs/providers-stateprovider--overview). |

The key is read once, when the control mounts.

{{story: Back where you left off}}

## What the control keeps

| What | Kept | Put back |
|---|---|---|
| The view the user is on | When a view is asked for, and when it has loaded | On the next mount, when the view is still listed. |
| Per view: the columns and the related entities they come from, sorting, filtering, page, page size, search and selection | As the view's mount goes: on a view switch, a reload, or when the control unmounts | The next time the view loads, over the columns the view sets and what \`onLoad\` set up, before its first page loads. |
| Per view: what the parts keep, such as where a grid is scrolled | As the user works | The next time the view is shown. |

A view the user hasn't been on yet starts from what the view and \`onLoad\` set up. A view they have been on starts from what was kept, so a change to the view's definition on your server, such as its sorting, shows only for users who haven't changed it. A grid keeps its own state only with a \`stateKey\` of its own, unique within the control: see [**Grid › State**](?path=/docs/grid-state--overview).

## Look inside the store

Everything the control keeps is plain data in the state store, under its \`stateKey\`. The example keeps the store in a dictionary of its own, as a PCF control's state would, and shows it next to the control. The layout of the entries may change; read the kept provider setup through \`IDatasetControlProviderState\`.

{{story: Look inside the store}}

## Keep your own part's state

\`useControlStateStore(stateKey)\` returns the store a component of your own keeps its state in. Inside a DatasetControl it belongs to the view shown, so it comes back with the view; outside one it is the nearest \`StateProvider\`'s. Without a \`stateKey\` it keeps nothing. The key is read once.

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

A gallery that keeps its scroll this way is under *Your own collection view* on [**Your own UI**](?path=/docs/datasetcontrol-your-own-ui--overview).
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
