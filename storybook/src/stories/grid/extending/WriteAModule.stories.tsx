import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { UnsavedChangesBarExample } from '../../../grid/examples/writeModuleExamples'

const DESCRIPTION = `
A module packages a feature of your own: it registers hooks, follows events, shares an instance other code can use, and draws its own UI inside the grid. The built-in modules are written the same way, against the same \`IGrid\`. Try it below: change a few prices.

{{canvas: Show an unsaved changes bar}}

## What a module is

| Member | Description |
|---|---|
| \`name\` | Unique within the grid. What \`onLoad\` returns is registered under it. |
| \`onLoad(grid)\` | Called once as the grid loads, before AG Grid exists. Register your hooks and listeners here. It may return a promise, which the grid awaits; if it throws, the grid shows the error with *Try again*. |
| \`onDestroy(instance)\` | Called as the grid unmounts, with what \`onLoad\` returned. |
| \`agGridModules\` | AG Grid modules the feature needs. See *AG Grid modules* on [**AG Grid**](?path=/docs/controls-grid-extending-ag-grid--overview). |

Build a module once, as a constant or in \`useMemo\`, since \`modules\` is read at mount. A module that needs options is a function that builds one, such as \`createCopyColumnModule(onCopied)\` on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview), and reads state that changes through a getter or a ref. Take what the module works on from \`grid.services\`, such as \`grid.services.get('provider')\`, and it works in any grid.

Modules load in the order of the array: in your \`onLoad\`, the ones before yours are there for \`grid.modules.find\`, and later ones are reached with \`grid.modules.observe\`. AG Grid's api arrives later too, through \`grid.services.observe('gridApi', ...)\`; when each step runs is under *From mount to unmount* on [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview).

## Clean up

What you register on the grid goes with it. Anything that outlives the grid keeps your module alive until you unsubscribe:

| You subscribed to | Clean up |
|---|---|
| Hooks, \`grid.events\`, the events of the grid's services and modules, AG Grid's api | Nothing. They go with the grid. |
| The provider, \`window\`, a timer or anything else outside the grid | Subscribe inside \`grid.services.observe('gridApi', ...)\` and return the unsubscribe. It runs as AG Grid is destroyed. |
| Something outside the grid that must be followed from \`onLoad\` on, before AG Grid is ready | Pass the unsubscribe to \`grid.lifecycle.events.addEventListener('onDestroyed', ...)\`, or keep it in the instance and call it in \`onDestroy\`. |

\`addEventListener\` returns its own unsubscribe, which the bar above returns from its \`observe\` callback as the cleanup. See *Services* on [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview).

## Share what your module builds

What \`onLoad\` returns is registered under the module's \`name\`. Other modules reach it with \`grid.modules.find(name)\`, and anything the grid draws with \`useGridModule(name)\`. An instance does not redraw anything by itself: when its state changes, tell whoever draws it, as the bar's \`subscribe\` does.

Add the name to \`IGridModuleMap\` once in your project, next to the module, and the instance is typed wherever you reach it, as *types.ts* in the example does. The file has to import or export something, as *types.ts* exports \`IUnsavedChanges\`, or \`declare module\` replaces the package's types instead of adding to them. A module whose \`onLoad\` returns nothing still needs an entry, typed \`void\`. A grid may not have your module, so \`find\` can return \`undefined\`, and \`get\` and \`useGridModule\` throw without it.

## Draw inside the grid

The grid's \`surfaces\` service holds what the grid draws inside its own element, after the rows. \`grid.services.get('surfaces').registerSurface(hook, priority?)\` adds to it: the hook pushes \`{ key, onRender }\`, and \`onRender\` returns what to draw, or \`null\` while there is nothing to show. What it draws is inside the grid's React tree, so it can call \`useGridService\` and \`useGridModule\`, and it follows its own state, as the bar subscribes to its module.

A block, such as the bar, makes a grid without \`height\` taller, while callouts, panels and dialogs take no room. For those, use Base Controls' \`Callout\`, \`Panel\` or \`Dialog\` so they draw in the app theme: see [**Fluent UI**](?path=/docs/concepts-fluent-ui--overview).

Entries are drawn in ascending priority, beside those of the built-in modules:

| Key | Drawn by |
|---|---|
| \`'filterCallout'\` | The filtering module, for a column's filter |
| \`'groupSelectionLimit'\` | The grouping module, when a selection would load too many groups |
| \`'notificationCallout'\` | The legacy client API module |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Hooks', iconName: 'Plug', href: '?path=/docs/controls-grid-extending-hooks--overview', text: 'Every decision a module can step into, and the order hooks run in.' },
    { title: 'Talking to the grid', iconName: 'Settings', href: '?path=/docs/controls-grid-talking-to-the-grid--overview', text: 'The services, modules and events a module reaches through the grid.' },
    { title: 'AG Grid', iconName: 'Table', href: '?path=/docs/controls-grid-extending-ag-grid--overview', text: 'AG Grid\'s options, api and modules, for what no hook covers.' },
]

const meta = {
    title: 'Controls/Grid/Extending/Write a module',
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

export const AnUnsavedChangesBar: Story = {
    name: 'Show an unsaved changes bar',
    render: () => renderStory(<UnsavedChangesBarExample />),
}
