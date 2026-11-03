import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ComeBackExample, OwnComponentExample } from './statePersistenceExamples'

const DESCRIPTION = `
When a component unmounts, its React state is gone, so a user who leaves and comes back starts over. State persistence keeps what a component needs to come back, such as a draft, a sorting or a scroll position, in a store that outlives it.

## The store

\`StateStore\` is a dictionary of plain data: \`get\`, \`set\` and \`delete\` an entry by id. It writes into the dictionary you give it, so you can save that dictionary as it is.

\`\`\`ts
const state = {}
const store = new StateStore({ state })
store.set('zoom', 2)    //state is { zoom: 2 }
\`\`\`

## Scopes

\`scope(id)\` returns a store over the entry under \`id\`. What you set in a scope lands one level down, and scopes chain, so a store is a tree:

\`\`\`ts
const planner = store.scope('planner')
planner.set('view', 'week')
planner.scope('filters').set('owner', 'Jana')
//state is { zoom: 2, planner: { view: 'week', filters: { owner: 'Jana' } } }
\`\`\`

A scope keeps a part of the tree to itself: code holding \`planner\` cannot touch \`zoom\`, and two scopes with different ids never collide.

## Hand a store down

\`StateProvider\` hands a store to the components below it: the one you pass, or a new in-memory one. Without a provider, the whole page shares one in-memory store. A component reads it with one of two hooks:

| Hook | Returns |
|---|---|
| \`useStateStore()\` | The nearest store |
| \`useControlStateStore(stateKey)\` | Its scope for the component: \`useStateStore().scope(stateKey)\`, one level down. Without a \`stateKey\`, a store that keeps nothing |

That is all a \`stateKey\` is: the id of a component's scope in the nearest store. Every control in the library that takes a \`stateKey\` keeps its state this way.

## Nest components

A child's \`stateKey\` scopes from the nearest store, not from its parent's scope. For children to land inside a component's own entry, the component hands its scope down:

\`\`\`tsx
const Planner = () => {
    const store = useControlStateStore('planner')
    return <StateProvider store={store}>
        <DraftNote />
    </StateProvider>
}
//state is { planner: { draftNote: { text: '…' } } }
\`\`\`

The controls do the same: a DatasetControl hands each view its own scope, so a grid inside it keeps a scroll position per view (see [**DatasetControl › State**](?path=/docs/controls-datasetcontrol-state--overview)). The dictionary next to the example shows the tree.

{{story: Come back where you left off}}

## Keep state in your own component

Take your scope with \`useControlStateStore\`, read what was kept once, when the component mounts, and write as the user works:

\`\`\`tsx
const DraftNote = () => {
    const store = useControlStateStore('draftNote')
    const [text, setText] = React.useState(store.get<string>('text') ?? '')
    const onChange = (value: string) => {
        setText(value)
        store.set('text', value)
    }
    return <TextField multiline value={text} onChange={(_, value) => onChange(value ?? '')} />
}
\`\`\`

{{story: Keep a draft}}

## Keep state across sessions

A store lives as long as its \`StateProvider\`, or the page without one. To keep state across sessions, save the dictionary, such as the one a PCF host hands its control (see [**PCF context**](?path=/docs/concepts-pcf-context--overview)):

\`\`\`tsx
//init(context, notifyOutputChanged, state)
this._store = new StateStore({ state })

//updateView(context)
<StateProvider store={this._store}>
    <App />
</StateProvider>

//destroy()
this._context.mode.setControlState(state)
\`\`\`

Entries are plain data, so the dictionary can also be saved as JSON, such as in \`localStorage\`.

`

const meta = {
    title: 'Concepts/State persistence',
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

export const ComeBackWhereYouLeftOff: Story = {
    name: 'Come back where you left off',
    render: () => renderStory(<ComeBackExample />),
    parameters: {
        docs: {
            description: {
                story: `Switch the view, search, sort a column and scroll, then leave the deals and come back: everything is where you left it. The dictionary beside it shows the tree the control and its grid kept.`,
            },
        },
    },
}

export const KeepADraft: Story = {
    name: 'Keep a draft',
    render: () => renderStory(<OwnComponentExample />),
    parameters: {
        docs: {
            description: {
                story: `Type a draft, hide the note and show it again: the draft comes back from the store, shown below as it fills.`,
            },
        },
    },
}
