import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { ILifecycleStep, Lifecycle } from '../../../../grid/showcase/Lifecycle'
import { GuideNavigation, GuideProgress } from '../../../../grid/guide/gridGuide'
import { FromYourCodeExample, WatchItLoadExample } from '../../../../grid/guide/advanced/fromYourCodeExamples'

const STEP = 'From your code'

const DESCRIPTION = `
{{block: progress}}

Your page knows which deal the user is on, and buttons of your own sort and discount deals as the user would. This step keeps the grid of each mount, follows the focused cell, and drives a module and a service from the footer.

{{canvas: From your code}}

## How it works

Like the steps of *Make it yours*, each Advanced step starts from *the deal grid*, as [**Shape the columns**](?path=/docs/controls-grid-guide-make-it-yours-shape-the-columns--overview) describes it. In **Code**, the new lines carry \`//new:\`.

**The grid** is an \`IGrid\`, and every mount makes a new one, with new services and new modules: the grid coming back after the toggle in *Watch it load* below is a new grid. Reach the grid of the current mount where your code runs:

| Your code runs | Reach the grid with |
|---|---|
| In \`onSetup\` on the grid | Its argument, before the grid loads, as \`gridRef\` keeps it for the footer's buttons |
| In \`onReady\` on the grid | Its argument, once the grid has loaded and is drawn |
| Elsewhere inside a DatasetControl | \`control.parts.find('grid')\`, as on the DatasetControl guide's [**From your code**](?path=/docs/controls-datasetcontrol-guide-advanced-from-your-code--overview) |
| In a module | The argument of its \`onLoad\`, as on [**Write a module**](?path=/docs/controls-grid-guide-advanced-write-a-module--overview) |
| In something the grid draws, such as a cell | The React hooks under *Inside what the grid draws* |

Every member of the grid is under *The grid* on [**Reference**](?path=/docs/controls-grid-reference--overview). This step covers its services, modules and events; \`hooks.openRecord\` is on [**Shape the columns**](?path=/docs/controls-grid-guide-make-it-yours-shape-the-columns--overview), AG Grid's options on [**AG Grid**](?path=/docs/controls-grid-ag-grid--overview), and \`lifecycle\`, \`loading\` and \`execute\` on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview).

**Services.** The grid is made of services, as [**Shape the columns**](?path=/docs/controls-grid-guide-make-it-yours-shape-the-columns--overview) showed, and \`grid.services\` finds them by key. \`get(key)\` returns the service and throws when there is none, so use it for the services every grid has. \`find(key)\` returns \`undefined\` instead, such as for \`gridApi\` before AG Grid is ready. \`observe(key, effect)\` calls \`effect\` with the service now if it is there and each time it is provided; it returns the function that stops observing. Every member and every key is under *Services* on [**Reference**](?path=/docs/controls-grid-reference--overview).

A function the \`observe\` effect returns is its cleanup: it runs before the effect runs again, when the service goes (\`gridApi\` as AG Grid goes), when you stop observing, and when the grid unmounts. Whatever the effect returns counts, so write its body in braces unless you mean to return a cleanup.

The footer's buttons use two services. \`cells\` raises \`onFocusedCellChanged\`, which names the deal in the footer. \`fields.get(record, columnName)\` is one value of one deal: \`setValue(value)\` sets it as an edit in its cell does, so **5% off** leaves the deals unsaved, and saves them at once with auto-save on.

**Modules.** \`grid.modules\` finds the modules the grid was given by name, as \`grid.services\` finds services: **Closing soonest** gets the sorting module and calls its \`sortColumn\`. The modules load after \`onSetup\`, so \`onSetup\` reaches one with \`observe\`, as [**Lock closed deals**](?path=/docs/controls-grid-guide-features-lock-closed-deals--overview) does. Each module's name and members are under *Modules* on Reference.

**Inside what the grid draws.** A cell, a header, an overlay or what a module draws inside the grid reads the grid with React hooks that work only inside the grid: \`useGridService(key)\` returns a service, and \`useGridModule(name)\` a module, throwing when the grid was not given it. They return the service, not its state: to draw again when it changes, subscribe to it, as the bar on [**Write a module**](?path=/docs/controls-grid-guide-advanced-write-a-module--overview) does. Every one is under *Inside what the grid draws* on Reference.

**Events.** \`addEventListener(event, listener)\` subscribes and returns the function that unsubscribes. The arguments of each event are under *Events* on Reference.

| Emitter | Events | Fires |
|---|---|---|
| \`grid.events\` | \`onDataLoaded\` | After every load of the provider, once the grid has its new columns and rows |
| \`grid.lifecycle.events\` | \`onStatusChanged\`, \`onDestroyed\` | As the mount turns ready, fails or ends: see RuntimeHost |
| The \`provider\` service | \`onRecordColumnValueChanged\`, \`onRecordsSelected\`, the save events, and more | As on [**Data providers**](?path=/docs/concepts-data-providers--overview) |
| The \`columns\` service | \`onCellDoubleClicked\`, \`onColumnsChanged\` | On a double-click on a cell; after the user resizes or moves a column |
| The \`rows\` service | \`onRowClicked\`, \`onHighlightedRowsChanged\` | On a click on a row; when the hovered, focused or selected rows change |
| The \`cells\` service | \`onFocusedCellChanged\` | Each time a cell takes the focus, and when the focus leaves the rows |
| The editing and filtering modules | \`onEditedCellChanged\`; \`onFilterOpened\`, \`onFilterClosed\` | When the edited cell changes; when a filter callout opens or closes |

No event fires when sorting, filters, grouping or totals change: they load the provider again, so follow \`onDataLoaded\` and read the provider.

**Follow saves.** The provider raises \`onBeforeRecordSaved\` as a record starts to save, before its values are checked, and \`onAfterRecordSaved\` once for every record that saves, refused ones included with \`success: false\` and the \`errors\`. \`onAfterSaved\` fires only after \`provider.save()\`, such as **Save**, once every record in it has finished; auto-save never fires it.

**A prop read at mount.** Each prop is read either *Live*, each time the grid needs it, or *At mount*, once. \`modules\` and every module's parameters, \`enableNavigation\`, \`enableOptionSetColors\`, \`enableZebra\`, \`rowHeight\` and \`stateKey\` are read at mount; Reference gives the timing of every prop. To change one, render the grid with a new \`key\`, such as \`key={String(isAutoSaveOn)}\`: the grid mounts again as a new \`IGrid\`. It loses the rows' save status, and its scroll, focus and open groups unless it has a \`stateKey\`, as on [**Back where they left off**](?path=/docs/controls-grid-guide-features-back-where-they-left-off--overview).

## Watch it load

This example writes down what each mount raises, beside *the deal grid*.

{{canvas: Watch it load}}

Each mount runs these steps:

{{block: lifecycle}}

Subscribe in \`onSetup\`, since every mount brings a new grid. Listeners on the grid and its services go with it; the provider outlives the grid, so the example removes its listeners on \`onDestroyed\`. What else to clean up is on [**Write a module**](?path=/docs/controls-grid-guide-advanced-write-a-module--overview).

## Try it

- Click a cell: the footer names the deal and its next step. Move with the arrow keys: the footer follows.
- Tick two deals and press **5% off**: every selected deal, the one you clicked included, has a discount of 5, and **Save** appears. Press **Save**.
- Press **Closing soonest**: the deals sort by *Close date*, the earliest first, and an arrow shows in its header.
- In *Watch it load*, turn *Show the deals* off and on: the log shows \`onDestroyed\` and the \`gridApi\` cleanup, then \`onSetup\`, \`onLoad\`, \`gridApi\`, \`onDataLoaded\` and \`onReady\`, in that order, with each status change among them.
- Change a value and press **Save**: the log shows \`onBeforeRecordSaved\`, \`onAfterRecordSaved\` and \`onAfterSaved\`.

## Remember

- Every mount gives a new grid: keep it from \`onSetup\` or \`onReady\`.
- Services and modules are found by key and name; \`observe\` waits for what is not there yet.
- A prop read at mount changes only with a new \`key\`.

{{block: navigation}}
`

const LIFECYCLE: ILifecycleStep[] = [
    { title: 'The grid mounts', hook: 'onSetup', text: '`onSetup` gets the new `IGrid` before anything loads, so add hooks and subscribe here.' },
    { title: 'The modules load', text: 'Each module\'s `onLoad` gets the grid, lowest `priority` first, before AG Grid exists. A module that throws shows its error in the grid with *Try again*.' },
    { title: 'The grid loads', hook: 'onLoad', text: 'The `onLoad` prop is awaited after the modules; then the status turns `rendering`, and AG Grid is created with the options the initial option hooks set.' },
    { title: 'AG Grid is ready', hook: "observe('gridApi')", text: 'The `gridApi` service is provided and its observers run; the grid draws the provider\'s columns and rows if it has loaded, and fires `onDataLoaded`.' },
    { title: 'The grid is ready', hook: 'onReady', text: 'The status turns `ready`, and `onReady` is called ahead of your own listeners.' },
    { title: 'The provider loads again', hook: 'onDataLoaded', text: 'After every later load, such as a sort or **Refresh**, the grid draws the new columns and rows and fires `onDataLoaded`.' },
    { title: 'The grid unmounts', hook: 'onDestroyed', text: 'The status turns `destroyed` and `onDestroyed` fires; then each module\'s `onDestroy` gets what its `onLoad` returned, the last loaded first, and the `gridApi` cleanups run while AG Grid still works.' },
]

const meta = {
    title: 'Controls/Grid/Guide/Advanced/From your code',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { progress: () => <GuideProgress current={STEP} />, navigation: () => <GuideNavigation current={STEP} />, lifecycle: () => <Lifecycle steps={LIFECYCLE} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const FromYourCode: Story = {
    name: 'From your code',
    tags: ['!dev'],
    render: () => renderStory(<FromYourCodeExample />),
}

export const WatchItLoad: Story = {
    name: 'Watch it load',
    tags: ['!dev'],
    render: () => renderStory(<WatchItLoadExample />),
}
