import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ComeBackExample, OwnComponentExample } from './statePersistenceExamples'

const DESCRIPTION = `
When a component unmounts, its React state is gone, so a user who leaves and comes back starts over. State persistence keeps what a component needs to come back, such as a draft, a sorting or a scroll position, in a store that outlives it.

{{story: Come back where you left off}}

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

Do not \`set\` or \`delete\` an id you use as a scope: the scope keeps writing to the old entry, which is no longer in the tree.

## Hand a store down

\`StateProvider\` hands a store to the components below it: the one you pass, or a new in-memory one. Without a provider, the whole page shares one in-memory store. A component reads it with one of two hooks:

| Hook | Returns |
|---|---|
| \`useStateStore()\` | The nearest store. |
| \`useControlStateStore(stateKey)\` | The component's scope: \`useStateStore().scope(stateKey)\`. Inside a DatasetControl, a scope in the entry of the view shown instead. Without a \`stateKey\`, a throwaway store: nothing survives a remount. |

That is all a \`stateKey\` is: the id of a component's scope. It is read once, at mount. Every control in the library that takes a \`stateKey\` keeps its state this way.

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

Inside a DatasetControl, \`useControlStateStore\` scopes under the view the part is shown in instead, so each view keeps its own. The DatasetControl in the first example keeps this tree:

\`\`\`ts
//state is { deals: { viewId, views: { [viewId]: { provider, parts: { grid } } } } }
\`\`\`

What each control keeps is on [**DatasetControl › State**](?path=/docs/controls-datasetcontrol-state--overview) and [**Grid › State**](?path=/docs/controls-grid-state--overview).

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

## Keep state beyond the provider

A store lives as long as its \`StateProvider\`, or the page without one. To keep state longer, save the dictionary:

- **For the session**, hand it to \`context.mode.setControlState\` in a PCF (see [**PCF context**](?path=/docs/concepts-pcf-context--overview)).
- **Across sessions**, save it as JSON, such as in \`localStorage\` or a table: entries are plain data.

In a PCF, build the store over the dictionary the host hands \`init\`, and save it once React has unmounted:

\`\`\`tsx
public init(context, notifyOutputChanged, state, container) {
    this._container = container
    this._state = state ?? {}
    this._store = new StateStore({ state: this._state })
}

public updateView(context) {
    this._context = context
    ReactDOM.render(<StateProvider store={this._store}><App /></StateProvider>, this._container)
}

public destroy() {
    //the controls write their state as they unmount
    ReactDOM.unmountComponentAtNode(this._container)
    this._context.mode.setControlState(this._state)
}
\`\`\`
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
                story: `Try: switch the view, search, sort a column and scroll, then leave the deals and come back: everything is where you left it. The dictionary beside it updates when you leave: the control writes its state as it unmounts.`,
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
                story: `Try: type a draft, hide the note and show it again: the draft comes back from the store, shown below as it fills.`,
            },
        },
    },
}
