import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { ILifecycleStep, Lifecycle } from '../../grid/showcase/Lifecycle'
import { DealSummaryExample, KeepStateExample, MessageAndModuleExample, OwnUiExample, RunActionsExample } from './runtimeHostExamples'

const DESCRIPTION = `
A control that has to load something before it can draw, such as DatasetControl or the Ribbon, runs on a *runtime*: one object per mount that does the loading and reports whether the control is ready, failed or gone. \`RuntimeHost\` creates the runtime, starts and ends it, shows a failed load with a retry and covers the control while it runs an action, so a control of your own only says what it loads, what it does and what it draws. Try it below: turn on **Service unavailable**, press **Reload**, then turn it off and press **Try again**.

{{canvas: A control of your own}}

## Lifecycle

{{block: lifecycle}}

## Status and events

Code that holds a runtime, such as the one \`onSetup\` hands over, reads its mount through \`runtime.lifecycle\`. A remount brings a new runtime and calls \`onSetup\` again, so subscribe there, as the example's log does.

| Member | Does |
|---|---|
| \`getStatus()\` | \`'initializing'\`, \`'rendering'\`, \`'ready'\`, \`'failed'\` or \`'destroyed'\` |
| \`getError()\` | What the load threw, while the status is \`'failed'\` |
| \`isDestroyed()\` | Whether the mount has ended |
| \`remount()\` | Ends this runtime and starts a new one, which loads again |
| \`events\` | The events below; \`addEventListener\` returns a function that removes the listener |

| Event | Fires |
|---|---|
| \`onStatusChanged(status)\` | When the status changes; \`'failed'\` when the load throws, with the error in \`getError()\` |
| \`onRemountRequested\` | When \`remount()\` is called, before the host replaces the runtime |
| \`onDestroyed\` | When the mount ends |

## Keep state across mounts

A remount makes a new runtime, so anything that must survive it, such as what the user picked, goes into a state store that the component around the host holds and passes to \`createRuntime\`. How stores work: [**State persistence**](?path=/docs/concepts-state-persistence--overview).

{{story: Keep the picked owner}}

## Write a runtime

A runtime is a class that extends \`Runtime\`, calls \`super()\` first in its constructor, and implements \`onInit\`, which loads what the control needs and throws when it cannot, and \`onDestroy\`, which releases what the runtime holds. The runtime's own members, such as \`getTotal()\` in the example, sit beside the ones \`Runtime\` adds:

| Member | See |
|---|---|
| \`lifecycle\` | *Status and events* |
| \`loading\`, \`executor\`, \`execute\` | *Run actions* |
| \`parts\` | *Parts* |
| \`notifications\` | *Messages* |
| \`modules\`, and \`getModules()\` for your runtime to override | *Modules* |

\`Runtime<TPartMap, TModuleMap, THost>\` takes three optional type parameters: the runtime's part map, which extends \`IRuntimePartMap\`, its module map, and what its modules' \`onLoad\` gets, \`IRuntime\` by default. An optional \`getStateStore()\` returns the store the controls inside the host keep their state in; without it, they use the store around the host.

A control built on the host can take \`components\` from its own users and pass them on to the host, as \`Ribbon\` and \`DatasetControl\` do, so they get the same choice of how it looks.

## Draw the mount

The host draws the loading state and a failed load; the control draws the rest. Put the control's component inside the host and read the runtime there with \`useRuntime()\`: the host draws it only once the runtime is ready, so it never has to check the status. An \`onInit\` that returns without waiting is ready before the first paint, so its loading state never shows. If the component throws while it draws, the host shows that error in its place, as it does a failed load, and **Try again** draws it again.

## Run actions

An action the control runs once it is ready, such as a save or code a consumer handed in, goes through \`runtime.execute(operation, parameters?)\`. While it runs, the host covers the control with a spinner; when it throws, the host shows the error and \`execute\` throws it on.

{{story: Run actions}}

| Parameter | Type | Default | Description |
|---|---|---|---|
| \`loading.show\` | \`boolean\` | \`true\` | \`false\` runs the operation without covering the control. |
| \`loading.message\` | \`string\` | None | Drawn under the spinner. |
| \`error.title\` | \`string\` | "The action could not be completed." | Titles the shown error; the details are the message of what the operation threw. |
| \`error.rethrow\` | \`boolean\` | \`true\` | \`false\` resolves \`undefined\` instead of throwing. |

An error that passes through nested \`execute\` calls is shown once, under the innermost title. By default the host opens the error dialog for each failure, one at a time, oldest first, and \`runtime.executor.events\` fires \`onExecuteFailed(error, title)\` for each.

To cover the control for work that does not run through \`execute\`, call \`runtime.loading.show(message?)\`, which returns the function that hides it. The control stays covered until every caller has hidden it; \`isLoading()\`, \`getMessage()\` and the \`onLoadingChanged(isLoading, message?)\` event read it.

## Parts

A *part* is a piece the control draws that code outside it can reach, such as a DatasetControl's quick find. While it is drawn, a part is provided on \`runtime.parts\` under its key, and the runtime ends the parts as it goes:

| Member | Does |
|---|---|
| \`get(key)\` | Returns the part; throws while it is not drawn. |
| \`find(key)\` | Returns the part, or \`undefined\` while it is not drawn. |
| \`has(key)\` | Whether the part is drawn. |
| \`observe(key, callback)\` | Calls back with the part now if it is drawn, and each time one is drawn again; returns the function that stops. What the callback returns runs when that part goes. |
| \`provide(key, part)\` | Provides the part under \`key\`, ending the one there; returns the function that removes it. |

The parts are drawn once \`onInit\` has finished, so code that runs before, such as \`onSetup\` or a module's \`onLoad\`, waits for one with \`observe\`.

A component provides a part with \`useProvidePart\`, which makes it once with \`create\` and provides it while the component is mounted:

| Call | Provides the part on |
|---|---|
| \`useProvidePart(key, create, parameters?)\` | The runtime of the nearest host, under a key of \`IRuntimePartMap\`, such as \`'notifications'\` |
| \`useProvidePart(runtime, key, create, parameters?)\` | \`runtime\`, under a key of its part map, such as a DatasetControl from \`useDatasetControl()\` |

The hook returns the part \`create\` made. With \`parameters.afterCommit\` set to \`true\`, the part is provided once React has committed instead of while the component draws, so a component that observes it may set state. A runtime's part map is its first type parameter and extends \`IRuntimePartMap\`. To add a part to a library control's map, such as \`IDatasetControlPartMap\`, declare it in \`declare module '@talxis/base-controls'\`, as *types.ts* on [**Your own UI**](?path=/docs/controls-datasetcontrol-guide-advanced-your-own-ui--overview) does.

## Messages

\`RuntimeNotificationBar\` draws the runtime's messages: put it inside the host where they should show. It provides the \`notifications\` part, which \`runtime.notifications\` returns; that throws while no bar is drawn, so read it from \`onReady\` on, or wait for the bar with \`runtime.parts.observe('notifications', callback)\`. Each bar holds its own messages, so a bar drawn anew starts empty.

| Member | Does |
|---|---|
| \`add(message)\` | Adds the message, or puts it in place of the one with the same \`id\`; returns the function that removes it. |
| \`remove(id)\` | Removes the message with this \`id\`. |
| \`getMessages()\` | The messages, in the order they were added. |
| \`events\` | \`onNotificationsChanged\`, when a message is added, replaced or removed. |

| Message key | Type | Description |
|---|---|---|
| \`text\` | \`string\` | Drawn as HTML, so escape anything you did not write. |
| \`level\` | \`'ERROR'\`, \`'WARNING'\`, \`'INFO'\` or \`'SUCCESS'\` | The most severe level among the messages sets the bar's colour; the bar is green only while every message is \`'SUCCESS'\`. |
| \`id\` | \`string\` | Optional. The key \`remove(id)\` finds the message by, and a later message with the same \`id\` takes its place. |
| \`onDismiss\` | \`() => void\` | Optional. Puts a close button on the message, which calls it; remove the message there. |

Two or more messages fold under a summary, which lists them on a click.

## Modules

A runtime loads the modules its \`getModules()\` returns on every mount, before \`onInit\`, lower \`priority\` first, and destroys them after \`onDestroyed\`, before \`onDestroy\`. Override it to return the modules your control's users pass, as DatasetControl, Grid and Map do with their \`modules\` prop. Each is an \`IRuntimeModule\`, whose members are under *A module of your own* on [**From your code**](?path=/docs/controls-datasetcontrol-guide-advanced-from-your-code--overview); \`onLoad\` gets the runtime. \`runtime.modules\` finds what each module's \`onLoad\` returned by its name, with \`get\`, \`find\`, \`has\` and \`observe\`, and the runtime's module map, its second type parameter, types it.

{{story: A message and a module}}

## Changing how it looks

\`RuntimeHost\` takes \`components\` for what it draws itself, and a component in any of them can read the runtime with \`useRuntime()\`, as the spinner in *Keep the picked owner* does. \`RuntimeNotificationBar\` takes \`components\` too, its only prop. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`RuntimeHost\` | \`container\` | \`onRender\` | \`RuntimeHostUiContainerComponents\` | The box the host draws everything in; a control can draw its own root here |
| | \`placeholder\` | \`onRender\`, \`onRenderSpinner\`, \`onRenderText\` | \`LoadingBoundaryComponents\` | The loading state, until the runtime is ready |
| | \`mountError\` | \`onRender\`, \`onRenderTooltip\`, \`onRenderTitle\`, \`onRenderCommandBar\` | \`ErrorMessageBarComponents\` | A failed load, or an error the control threw while it drew |
| | \`loadingOverlay\` | \`onRender\`, \`onRenderSpinner\`, \`onRenderText\` | \`LoadingOverlayComponents\` | What covers the control while \`runtime.loading\` is shown, such as while \`execute\` runs |
| | \`executeError\` | \`onRender\` | \`RuntimeExecuteErrorComponents\` | The failures of \`execute\` not yet dismissed, given \`failures\` and \`onDismiss(failure)\` |
| \`RuntimeNotificationBar\` | Top level | \`onRenderMessageBar\`, given a \`variant\` of \`'single'\`, \`'group'\` or \`'child'\` | \`NotificationMessageBarComponents\` | Each bar: a lone message, the summary of several, and each message listed under it |
| | | \`onRenderMessage\` | | A message's text, given as \`dangerouslySetInnerHTML\` |
| | | \`onRenderToggleButton\` | | The chevron on the summary |
| | | \`onRenderMenu\` | | The list of messages the summary unfolds |

{{story: Your own loading and errors}}

To change the wording of the loading text, **Try again**, **Details** and the default title of a failed action, see [**Localization**](?path=/docs/concepts-localization--overview).

## Reference

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`createRuntime\` | \`() => TRuntime\` | Required | At mount | Makes the runtime of a mount. |
| \`onSetup\` | \`(runtime: TRuntime) => void\` | None | At mount | Called with each new runtime, before it loads. |
| \`onReady\` | \`(runtime: TRuntime) => void\` | None | Once loaded | Called once per mount when the control has loaded and is drawn. |
| \`children\` | \`ReactNode\` | None | Live | The control, drawn once the runtime is ready; reads it with \`useRuntime()\`. |
| \`className\` | \`string\` | None | Live | Put on the box the host draws everything in. |
| \`components\` | \`IRuntimeHostComponents\` | Defaults | Live | See *Changing how it looks*. |

## Where next

{{block: explore}}
`

const LIFECYCLE: ILifecycleStep[] = [
    { title: 'The runtime is created', hook: 'createRuntime', text: 'The host calls `createRuntime` for a new runtime, whose status is `initializing`.' },
    { title: 'The mount starts', hook: 'onSetup', text: '`onSetup` gets the runtime before it loads, so subscribe to its events here.' },
    { title: 'It loads', hook: 'onInit', text: 'The host starts the lifecycle before the first paint, while it draws the loading state: the runtime loads the modules `getModules()` returns, then runs `onInit` once.' },
    { title: 'It is ready, or it failed', hook: 'onReady', text: 'The host draws the control, waits for what it draws, then the status turns `ready` and the `onReady` prop is called; or the status turns `failed` and the host shows the error with a retry.' },
    { title: 'It remounts', hook: 'remount()', text: '`remount()`, or the retry, ends the runtime and starts again from the first step.' },
    { title: 'It is destroyed', hook: 'onDestroy', text: '`onDestroyed` fires and the modules are destroyed, then `onDestroy` releases what the runtime holds, and the parts go.' },
]

const EXPLORE: IExploreCard[] = [
    { title: 'From your code', iconName: 'Plug', href: '?path=/docs/controls-datasetcontrol-guide-advanced-from-your-code--overview', text: 'What the DatasetControl\'s runtime adds: views, parts and modules.' },
    { title: 'Ribbon', iconName: 'Ribbon', href: '?path=/docs/controls-ribbon-get-started--overview', text: 'A control on a runtime that loads its commands.' },
    { title: 'State persistence', iconName: 'History', href: '?path=/docs/concepts-state-persistence--overview', text: 'Keep what the user picked across mounts and sessions.' },
]

const meta = {
    title: 'Controls/RuntimeHost/Get started',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { lifecycle: () => <Lifecycle steps={LIFECYCLE} />, explore: () => <ExploreCards cards={EXPLORE} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const AControlOfYourOwn: Story = {
    name: 'A control of your own',
    render: () => renderStory(<DealSummaryExample />),
}

export const RunActions: Story = {
    name: 'Run actions',
    render: () => renderStory(<RunActionsExample />),
    parameters: {
        docs: {
            description: {
                story: `Adding a deal covers the summary until it is saved, and a failed send opens the error dialog under the title it was given. Try: press **Add a 5,000 USD deal**, then **Send to finance**.`,
            },
        },
    },
}

export const AMessageAndAModule: Story = {
    name: 'A message and a module',
    render: () => renderStory(<MessageAndModuleExample />),
    parameters: {
        docs: {
            description: {
                story: `The runtime formats the total through a module it loads before \`onInit\`, and a send adds a message to the bar under the \`id\` \`'sent'\`. Try: press **Send to finance** twice, then close the message.`,
            },
        },
    },
}

export const KeepThePickedOwner: Story = {
    name: 'Keep the picked owner',
    render: () => renderStory(<KeepStateExample />),
    parameters: {
        docs: {
            description: {
                story: `Picking an account manager stores it and remounts, and the new runtime loads that owner's deals. Try: pick Ben Carter.`,
            },
        },
    },
}

export const YourOwnLoadingAndErrors: Story = {
    name: 'Your own loading and errors',
    render: () => renderStory(<OwnUiExample />),
    parameters: {
        docs: {
            description: {
                story: `Every piece the host draws is replaced: a skeleton for the first load, an error card for a failed one, a progress bar while a send runs and a notification bar for failed sends. Try: turn on **Service unavailable**, press **Send to finance**, then **Reload**, and turn it off before **Try again**.`,
            },
        },
    },
}
