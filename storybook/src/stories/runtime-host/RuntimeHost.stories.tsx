import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { ILifecycleStep, Lifecycle } from '../../grid/showcase/Lifecycle'
import { DealSummaryExample, KeepStateExample, RunActionsExample } from './runtimeHostExamples'

const DESCRIPTION = `
A control that has to load something before it can draw, such as DatasetControl or the Ribbon, runs on a *runtime*: one object per mount that does the loading and reports whether the control is ready, failed or gone. \`RuntimeHost\` creates the runtime, starts and ends it, shows a failed load with a retry and covers the control while it runs an action, so a control of your own only says what it loads, what it does and what it draws. Try it below: turn on **Service unavailable**, press **Reload**, then turn it off and press **Try again**.

{{canvas: A control of your own}}

## Lifecycle

{{block: lifecycle}}

## Status and events

Code that holds a runtime, such as the one \`onSetup\` hands over, reads its mount through \`runtime.lifecycle\`. A remount brings a new runtime and calls \`onSetup\` again, so subscribe there, as the example's log does.

| Member | Does |
|---|---|
| \`getStatus()\` | \`'initializing'\`, \`'ready'\`, \`'failed'\` or \`'destroyed'\` |
| \`getError()\` | What the load threw, while the status is \`'failed'\` |
| \`isDestroyed()\` | Whether the mount has ended |
| \`remount()\` | Ends this runtime and starts a new one, which loads again |
| \`events\` | The events below; \`addEventListener\` returns a function that removes the listener |

| Event | Fires |
|---|---|
| \`onReady\` | When the load succeeds |
| \`onInitFailed(error)\` | When the load throws |
| \`onRemountRequested\` | When \`remount()\` is called, before the host replaces the runtime |
| \`onDestroyed\` | When the mount ends |

## Keep state across mounts

A remount makes a new runtime, so anything that must survive it, such as what the user picked, goes into a state store that the component around the host holds and passes to \`createRuntime\`. How stores work: [**State persistence**](?path=/docs/concepts-state-persistence--overview).

{{story: Keep the picked owner}}

## Write a runtime

A runtime is a class that extends \`Runtime\`, calls \`super()\` first in its constructor, and creates its own \`lifecycle\`: a \`RuntimeLifecycle\` given \`onInit\`, which loads what the control needs and throws when it cannot, and optionally \`onDestroy\`, which releases what the runtime holds. Without \`onInit\`, the runtime is ready at once. \`Runtime\` adds \`loading\` and \`execute\`, described in *Run actions*. The runtime's own members, such as \`getTotal()\` in the example, sit beside \`lifecycle\`. An optional \`getStateStore()\` returns the store the controls inside the host keep their state in; without it, they use the store around the host.

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

## Changing how it looks

\`RuntimeHost\` takes \`components\` for what it draws itself, and a component in any of them can read the runtime with \`useRuntime()\`, as the spinner in *Keep the picked owner* does. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`container\` | \`onRenderContainer\` | \`RuntimeHostUiContainerComponents\` | The box the host draws everything in; a control can draw its own root here |
| \`placeholder\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderText\` | \`LoadingBoundaryComponents\` | The loading state, until the runtime is ready |
| \`mountError\` | \`onRenderMessageBar\`, \`onRenderTooltip\`, \`onRenderTitle\`, \`onRenderCommandBar\` | \`ErrorMessageBarComponents\` | A failed load, or an error the control threw while it drew |
| \`loadingOverlay\` | \`onRenderOverlay\`, \`onRenderSpinner\`, \`onRenderText\` | \`LoadingOverlayComponents\` | What covers the control while \`runtime.loading\` is shown |
| \`executeError\` | \`onRenderError\` | \`RuntimeExecuteErrorComponents\` | One failure of \`execute\`, given \`title\`, \`error\` and \`onDismiss\`, which shows the next one |

To change the wording of **Try again**, **Details** and the default title of a failed action, see [**Localization**](?path=/docs/concepts-localization--overview).

## Reference

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`createRuntime\` | \`() => TRuntime\` | Required | At mount | Makes the runtime of a mount. |
| \`onSetup\` | \`(runtime: TRuntime) => void\` | None | At mount | Called with each new runtime, before it loads. |
| \`children\` | \`ReactNode\` | None | Live | The control, drawn once the runtime is ready; reads it with \`useRuntime()\`. |
| \`className\` | \`string\` | None | Live | Put on the box the host draws everything in. |
| \`components\` | \`IRuntimeHostComponents\` | Defaults | Live | See *Changing how it looks*. |

## Where next

{{block: explore}}
`

const LIFECYCLE: ILifecycleStep[] = [
    { title: 'The runtime is created', hook: 'createRuntime', text: 'The host calls `createRuntime` for a new runtime, whose status is `initializing`.' },
    { title: 'The mount starts', hook: 'onSetup', text: '`onSetup` gets the runtime before it loads, so subscribe to its events here.' },
    { title: 'It loads', hook: 'onInit', text: 'The host starts the lifecycle before the first paint, which runs `onInit` once while the host draws the loading state.' },
    { title: 'It is ready, or it failed', hook: 'onReady', text: '`onReady` fires and the host draws the control, or `onInitFailed` fires and the host shows the error with a retry.' },
    { title: 'It remounts', hook: 'remount()', text: '`remount()`, or the retry, ends the runtime and starts again from the first step.' },
    { title: 'It is destroyed', hook: 'onDestroy', text: '`onDestroyed` fires, then `onDestroy` releases what the runtime holds.' },
]

const EXPLORE: IExploreCard[] = [
    { title: 'Talking to the control', iconName: 'Plug', href: '?path=/docs/controls-datasetcontrol-talking-to-the-control--overview', text: 'What the DatasetControl\'s runtime adds: views, parts and modules.' },
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
                story: `Adding a deal covers the summary until it is saved, and a failed send shows in a message bar instead of the error dialog. Try: press Add a 5,000 USD deal, then Send to finance.`,
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
