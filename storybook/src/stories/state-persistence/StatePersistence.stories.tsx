import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { KeepItApartExample } from './stateProviderExamples'

const DESCRIPTION = `\`StateProvider\` is the state entry point for components that should come back where the user left them.

It hands a state store to everything below it. A component keeps its state in that store under a \`stateKey\`, and finds it there again when it mounts, whether the store lives in memory or in a dictionary that an existing hosted PCF runtime persists.

Child components take their own corner of the store with \`useControlStateStore(stateKey)\`, or the whole store with \`useStateStore()\`.

> **Note**
>
> Without a \`StateProvider\`, everything shares one store for the whole page, kept in memory until the page reloads.

{{story: Keep it apart}}

## Keep state in memory

\`\`\`tsx
import { StateProvider } from '@talxis/base-controls'

const Page = () => <StateProvider>
    <App />
</StateProvider>
\`\`\`

A \`StateProvider\` without a \`store\` creates its own, in memory, for as long as it is mounted. Nothing below it can reach the state of anything outside it, so two parts of a page can use the same \`stateKey\`.

## Persist state

\`\`\`tsx
import { StateProvider, StateStore } from '@talxis/base-controls'

//init(context, notifyOutputChanged, state)
this._store = new StateStore({ state })

<StateProvider store={this._store}>
    <App />
</StateProvider>

//destroy()
context.mode.setControlState(state)
\`\`\`

\`StateStore\` keeps its entries in the dictionary you give it and writes into it in place, so a PCF control hands the same \`state\` back to the host. Any other \`IStateStore\` works too, such as one backed by \`localStorage\`.

## Keep a component's state

\`\`\`tsx
import { useControlStateStore } from '@talxis/base-controls'

const DraftNote = () => {
    const store = useControlStateStore('draft-note')
    const [text, setText] = React.useState(store.get<string>('text') ?? '')
    const onChange = (value: string) => {
        setText(value)
        store.set('text', value)
    }
    return <TextField multiline value={text} onChange={(_, value) => onChange(value ?? '')} />
}
\`\`\`

- \`useControlStateStore(stateKey)\` returns a store of the component's own, under its \`stateKey\`. Without a \`stateKey\`, it keeps nothing.
- Read what was kept once, when the component mounts, and write as the user works.
- \`useStateStore()\` returns the whole store, for a component that manages several keys itself.

## The store

| Member | What it does |
|---|---|
| \`get(id)\` | The entry under \`id\`, or \`undefined\`. |
| \`set(id, value)\` | Replaces the entry under \`id\`. |
| \`delete(id)\` | Removes the entry under \`id\`. |
| \`scope(id)\` | A store over the entry under \`id\`, created on first use. Its own entries stay inside that entry. |

Entries are plain data, so the whole dictionary can be stored as JSON.
`

const meta = {
    title: 'Providers/StateProvider',
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

export const KeepItApart: Story = {
    name: 'Keep it apart',
    render: () => renderStory(<KeepItApartExample />),
    parameters: {
        docs: {
            description: {
                story: `Each side has its own \`StateProvider\`, and both notes use the same \`stateKey\`. Type a draft, hide the note and show it again: the draft is still there. The other side's draft stays its own, and each side's dictionary below shows what its store holds.`,
            },
        },
    },
}
