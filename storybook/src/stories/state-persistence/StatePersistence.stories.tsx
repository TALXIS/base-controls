import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { ComeBackExample, OwnComponentExample, ScopesExample } from './statePersistenceExamples'

const DESCRIPTION = `
When a component unmounts, its React state is gone, so a user who leaves and comes back starts over. State persistence keeps what a component needs to come back, such as a draft, a sorting or a scroll position, in a store that outlives it. Try it below: switch the view and sort a column, then leave the deals and come back.

{{canvas: Come back where you left off}}

## The store

\`StateStore\` is a dictionary of plain data: \`get\`, \`set\` and \`delete\` an entry by id. It writes into the dictionary you give it, so you can save that dictionary as it is.

\`scope(id)\` returns a store over the entry under \`id\`, created on first use. What you set in a scope lands one level down, and scopes chain, so a store is a tree. Code holding a scope cannot touch what is outside it, and two scopes with different ids never collide.

{{story: Scopes}}

Do not \`set\` or \`delete\` an id you use as a scope: the scope keeps writing to the old entry, which is no longer in the tree.

## Hand a store down

\`StateProvider\` hands a store to the components below it: the one you pass, or a new in-memory one. Without a provider, the whole page shares one in-memory store. A component reads it with one of two hooks:

| Hook | Returns |
|---|---|
| \`useStateStore()\` | The nearest store; scope it yourself with \`scope(id)\`. |
| \`useControlStateStore(stateKey)\` | \`useStateStore().scope(stateKey)\`, kept per view inside a DatasetControl. Without a \`stateKey\`, a throwaway store, so nothing survives a remount. |

A \`stateKey\` is the id of a component's scope, read once at mount. Every control in the library that takes a \`stateKey\` keeps its state this way.

## Keep state in your own component

Take your scope with \`useControlStateStore\`, so it also keeps per view inside a DatasetControl, read what was kept when the component mounts, and write as the user works.

{{story: Keep a draft}}

## Nest components

A child's \`stateKey\` scopes from the nearest store, not from its parent's scope. For children to land inside a component's own entry, the component hands its scope down in a \`StateProvider\`, as the planner in the example above does.

Inside a DatasetControl, \`useControlStateStore\` scopes under the view the part is shown in, so each view keeps its own. The DatasetControl in the example at the top keeps \`{ deals: { viewId, views: { [viewId]: { provider, parts: { grid } } } } }\`. The DatasetControl's [**State**](?path=/docs/controls-datasetcontrol-state--overview) and the grid's [**State**](?path=/docs/controls-grid-state--overview) list what each keeps.

## Save state for later

A store lives as long as its \`StateProvider\`, or the page without one. To keep state longer, save the dictionary it writes into: for the session, hand it to \`context.mode.setControlState\` in a PCF (see [**PCF context**](?path=/docs/concepts-pcf-context--overview)); across sessions, save it as JSON, such as in \`localStorage\` or a table, as its entries are plain data.

In a PCF, build the store over the dictionary the host hands \`init\`, and save it once React has unmounted, as \`index.tsx\` in the example at the top does.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'State', iconName: 'History', href: '?path=/docs/controls-datasetcontrol-state--overview', text: 'What a DatasetControl keeps for each view, and how it reopens on the view the user was on.' },
    { title: 'PCF context', iconName: 'PlugConnected', href: '?path=/docs/concepts-pcf-context--overview', text: 'The host\'s context, whose mode keeps state for the session.' },
    { title: 'RuntimeHost', iconName: 'Processing', href: '?path=/docs/controls-runtimehost-get-started--overview', text: 'Keep what the user picked when a control of your own remounts.' },
]

const meta = {
    title: 'Concepts/State persistence',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { explore: () => <ExploreCards cards={EXPLORE} /> }),
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
}

export const Scopes: Story = {
    name: 'Scopes',
    render: () => renderStory(<ScopesExample />),
    parameters: {
        docs: {
            description: {
                story: `A store over a dictionary, shown as each button writes to it. Try: click the buttons in turn and watch the tree grow.`,
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
                story: `A draft note inside a planner that hands its scope down, with the dictionary below it. Try: type a draft, hide the note and show it again.`,
            },
        },
    },
}
