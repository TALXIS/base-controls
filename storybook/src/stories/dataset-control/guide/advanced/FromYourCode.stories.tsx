import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { ILifecycleStep, Lifecycle } from '../../../../grid/showcase/Lifecycle'
import { GuideNavigation, GuideProgress } from '../../../../dataset-control/guide/datasetControlGuide'
import { FromYourCodeExample, WatchItLoadExample } from '../../../../dataset-control/guide/advanced/fromYourCodeExamples'

const STEP = 'From your code'

const DESCRIPTION = `
{{block: progress}}

Your own buttons and modules can do what the user does with the parts: open a view, search, edit the columns or add a view to the list. This step adds a row of buttons to the deal list's footer and a module that adds *Closing soon*, then follows every load as it happens.

{{canvas: From your code}}

## How it works

**The control** is an \`IDatasetControl\`, and every load makes a new one, with new modules and new parts, as on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). Reach the control of the current load where your code runs:

| Your code runs | Reach the control with |
|---|---|
| In a component inside \`DatasetControl\`, such as \`Shortcuts\` | \`useDatasetControl()\` |
| In \`onSetup\` on \`DatasetControl\` | Its argument, before the load's modules load, as \`showSyncMessage\` and \`saveDealViewData\` do |
| In \`onReady\` on \`DatasetControl\` | Its argument, once per load, when the control and its parts are ready |
| In a module | The argument of its \`onLoad\` |

\`loadView(viewId)\` loads a view as picking it does, \`reload()\` loads the open view again, and \`lifecycle.remount()\` loads the view that failed, as **Try again** does. Each makes a new control; all but \`lifecycle.remount()\` first ask about unsaved changes, as on [**Act on deals**](?path=/docs/controls-datasetcontrol-guide-features-act-on-deals--overview). \`getViews()\`, \`getView()\` and \`getProvider()\` read the load's views, the open view and its provider.

### The parts

Every part on the page provides itself on the control under its key, such as \`'quickFind'\` or \`'editColumns'\`, for as long as it is drawn. The parts are drawn once the load has succeeded, and there are two ways to reach one:

| Reach a part with | Such as | When the part is not drawn |
|---|---|---|
| The control's shortcut: \`viewSwitcher\`, \`ribbon\`, \`quickFind\`, \`pagination\`, \`pageSizeSwitcher\` or \`editColumns\` | \`control.quickFind\` in \`Shortcuts\` | Throws |
| \`control.parts.get(key)\` | \`control.parts.get('grid')\`, which has no shortcut | Throws |
| \`control.parts.find(key)\` | \`control.parts.find('ribbon')?.reload()\` | Returns \`undefined\` |
| \`control.parts.observe(key, callback)\` | \`showSyncMessage\`, from \`onSetup\` | Calls back once it is drawn, and again for each new one |

Use a shortcut, or \`get\`, from \`onReady\` on or in code a part runs, such as a button's \`onClick\`; code that runs before the parts are drawn, such as \`onSetup\` or a module, waits with \`observe\`. \`control.notifications\` is the shortcut of the \`notifications\` part, and every member of \`control.parts\` is under *Parts* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). Each part's key and members are on [**Reference**](?path=/docs/controls-datasetcontrol-reference--overview).

### A module of your own

A module is an object in the control's \`modules\`, beside the library's own, such as \`dealViews\`:

| Member | Description |
|---|---|
| \`name\` | Unique within the control; two modules of one name fail the load. What \`onLoad\` returns is provided under it, for \`control.modules\`. |
| \`priority\` | Optional, \`0\` by default. Lower loads first, and modules of the same priority load at the same time. |
| \`onLoad(control, { signal })\` | Can be async. \`signal\` is aborted when the load goes or another module fails. A throw fails the load. |
| \`onDestroy(instance)\` | Optional. Called with what \`onLoad\` returned, as the load goes, the last loaded first. |

The control a module gets adds \`hooks.views\`, which runs on the views \`onLoad\` returns, so a module can add a view as \`closingSoonModule\` does. \`control.modules\` finds a module with \`get\`, \`find\` and \`observe\`, as \`saveDealViewData\` does, and \`useDatasetControlModule(name)\` finds it inside the control. *types.ts* declares what each module's \`onLoad\` returns on \`IDatasetControlModuleMap\`, so \`control.modules.get\` is typed. A module draws a dialog or a panel of its own with \`control.surfaces.hooks.surfaces.add\`.

## Watch it load

This example writes down what each load raises, beside the deal list.

{{canvas: Watch it load}}

Each load runs these steps:

{{block: lifecycle}}

\`control.lifecycle.events\` raises \`onStatusChanged\`, \`onRemountRequested\` and \`onDestroyed\`, as on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). Subscribe in \`onSetup\`, since every load brings a new control.

\`control.execute(operation, parameters?)\` runs work of your own, such as **Sync to CRM**: a spinner covers the control while it runs, and its error opens the error dialog, as *Run actions* on RuntimeHost describes. The control shows every failure itself; to log one too, or show it elsewhere, listen for it:

| Event | On | Fires for |
|---|---|---|
| \`onStatusChanged\`, with \`'failed'\` | \`control.lifecycle.events\` | A failed load; \`lifecycle.getError()\` holds the error |
| \`onExecuteFailed(error, title)\` | \`control.executor.events\` | A failed \`control.execute\`, or a user view that could not be saved or deleted |
| \`onExecuteFailed(error, title)\` | The ribbon's \`executor.events\` | A failed command, or a failed later \`onLoad\` of the ribbon |

## Try it

- Press **Search Contoso**: *My deals* shows Anna's two Contoso deals. Press **Won deals**, then **Columns**: Edit columns opens on *Won deals*.
- Open *Closing soon* under *Reports*: the 5 deals that close in the next 30 days, the nearest first.
- In *Watch it load*, press **Reload**: the log shows \`onRemountRequested\` and \`onDestroyed\` for the old control, then \`onSetup\` for the new one.
- Press **Sync to CRM**: the error dialog opens, and the log shows \`onExecuteFailed: The CRM did not respond.\`

## Remember

- Every load gives a new control: \`onSetup\` gets it first, \`onReady\` once it is ready.
- Parts exist once they are drawn: a shortcut such as \`control.quickFind\` throws before, and \`parts.observe\` waits.
- A module loads before \`onLoad\`, and its \`hooks.views\` add views.

{{block: navigation}}
`

const LIFECYCLE: ILifecycleStep[] = [
    { title: 'The control mounts', hook: 'onSetup', text: '`onSetup` gets the new `IDatasetControl` before anything loads, so subscribe to its events here.' },
    { title: 'The modules load', text: 'Each module\'s `onLoad` runs, lower `priority` first; modules of the same priority load at the same time.' },
    { title: 'The provider is created', hook: 'onLoad', text: '`onLoad(control)` returns `{ provider, views }`, and the modules\' `hooks.views` add to the views.' },
    { title: 'The view is picked', text: 'The view asked for, or the one the user was on, while it is listed; else the first.' },
    { title: 'The view is applied', hook: 'resolve', text: 'The view\'s `resolve(provider)` sets the provider up, then the control sets its linking and columns and puts back what it kept for the view.' },
    { title: 'The first page loads', text: 'Unless `onLoad` already asked for it, the provider loads its first page; the status turns `rendering`, and the parts are drawn.' },
    { title: 'The control is ready', hook: 'onReady', text: 'Once the parts that load on their own, such as the grid and the ribbon, have loaded, the status turns `ready` and `onReady` is called, ahead of your own listeners.' },
    { title: 'The control unmounts', hook: 'onDestroyed', text: 'On the next load, or when the page removes the control, the status turns `destroyed` and `onDestroyed` fires; then the modules are destroyed, the view\'s state is kept, and the provider is released unless `onLoad` returned `destroyProviderOnUnmount: false`.' },
]

const meta = {
    title: 'Controls/DatasetControl/Guide/Advanced/From your code',
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
