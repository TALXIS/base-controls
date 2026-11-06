import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { ILifecycleStep, Lifecycle } from '../../grid/showcase/Lifecycle'
import { DealSummaryExample, KeepStateExample } from './runtimeHostExamples'

const DESCRIPTION = `
A control that has to load something before it can draw, such as DatasetControl or the Ribbon, runs on a *runtime*: one object per mount that does the loading and reports whether the control is ready, failed or gone. \`RuntimeHost\` creates the runtime, starts and ends it, and shows a failed load with a retry, so a control of your own only says what it loads and what it draws. Try it below: turn on **Service unavailable**, press **Reload**, then turn it off and press **Try again**.

{{canvas: A control of your own}}

## Lifecycle

{{block: lifecycle}}

## Status and events

Code that holds a runtime, such as the one \`onMounted\` hands over, reads its mount through \`runtime.lifecycle\`. A remount brings a new runtime and calls \`onMounted\` again, so subscribe there, as the example's log does.

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

A remount makes a new runtime, so anything that must survive it, such as what the user picked, goes into a state store that the component around the host holds and passes to \`onCreate\`. How stores work: [**State persistence**](?path=/docs/concepts-state-persistence--overview).

{{story: Keep the picked owner}}

## Write a runtime

A runtime is a class with a \`lifecycle\`: a \`RuntimeLifecycle\` given \`onInit\`, which loads what the control needs and throws when it cannot, and optionally \`onDestroy\`, which releases what the runtime holds. Without \`onInit\`, the runtime is ready at once. The runtime's own members, such as \`getTotal()\` in the example, sit beside \`lifecycle\`.

## Draw the mount

The host draws a failed load; the control draws everything else, its loading state included. Put the control's component inside the host and read the runtime there with \`useRuntime()\`: the component draws again whenever the status changes. If it throws while it draws, the host shows that error too, and **Try again** draws it again.

## Changing how it looks

\`RuntimeHost\` takes \`components\` for the error it shows. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`errorMessage\` | \`onRenderMessageBar\`, \`onRenderTooltip\`, \`onRenderTitle\`, \`onRenderCommandBar\` | \`ErrorMessageBarComponents\` | A failed load |

To change the wording of **Try again** and **Details**, see [**Localization**](?path=/docs/concepts-localization--overview).

## Reference

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`onCreate\` | \`() => TRuntime\` | Required | At mount | Makes the runtime of a mount. |
| \`onMounted\` | \`(runtime: TRuntime) => void\` | None | At mount | Called with each new runtime, before it loads. |
| \`children\` | \`ReactNode\` | None | Live | The control, drawn from the start; reads the runtime with \`useRuntime()\`. |
| \`components\` | \`IRuntimeHostComponents\` | Defaults | Live | See *Changing how it looks*. |

## Where next

{{block: explore}}
`

const LIFECYCLE: ILifecycleStep[] = [
    { title: 'The runtime is created', hook: 'onCreate', text: 'The host calls `onCreate` for a new runtime, whose status is `initializing`.' },
    { title: 'The mount starts', hook: 'onMounted', text: '`onMounted` gets the runtime before it loads, so subscribe to its events here.' },
    { title: 'It loads', hook: 'onInit', text: 'The lifecycle runs `onInit` once, while the control draws its loading state.' },
    { title: 'It is ready, or it failed', hook: 'onReady', text: '`onReady` fires, or `onInitFailed` fires and the host shows the error with a retry.' },
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
