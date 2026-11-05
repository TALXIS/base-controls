import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { ILifecycleStep, Lifecycle } from '../../grid/showcase/Lifecycle'
import { DealSummaryExample, KeepStateExample } from './runtimeHostExamples'

const DESCRIPTION = `
Every control that loads something runs on a runtime: one object per mount that loads the control's data and reports how it went. \`RuntimeHost\` creates it, initializes and destroys it, and shows a failed init with a retry, so your control only says what its init does and what it draws. Try it below: turn on **Fail the next load**, press **Reload**, then **Try again**.

{{canvas: A control of your own}}

## Lifecycle

{{block: lifecycle}}

## Keep state across mounts

A remount throws the runtime away, so what must outlive it, such as what the user picked, lives in a state store the component around the host holds and hands to \`onCreate\`. Every runtime reads it in its init: see [**State persistence**](?path=/docs/concepts-state-persistence--overview).

{{story: Keep the picked owner}}

## Write a runtime

The runtime owns a \`RuntimeLifecycle\` as \`lifecycle\` and gives it \`onInit\` and \`onDestroy\`, as \`DealSummaryRuntime\` in the example does. Code using the runtime reads \`lifecycle.getStatus()\`, \`lifecycle.getError()\` and \`lifecycle.events\`, and calls \`lifecycle.remount()\`; the runtime's own members and events sit beside it.

## Draw the mount

The host draws a failed init; the control draws everything else, its loading state included. Read the runtime with \`useRuntime()\` in the control's own mount component, which then re-renders on every status.

## Reference

| Prop | Description |
|---|---|
| \`onCreate\` | Makes the runtime of a mount. |
| \`onMounted\` | Called with each new runtime, before its init. |
| \`children\` | Drawn from the start; reads the runtime with \`useRuntime()\`. |
| \`components\` | \`errorMessage\` replaces how a failed init looks. |

## Where next

{{block: explore}}
`

const LIFECYCLE: ILifecycleStep[] = [
    { title: 'The runtime is created', hook: 'onCreate', text: 'The host calls `onCreate` for a new runtime, whose status is `initializing`.' },
    { title: 'The mount starts', hook: 'onMounted', text: '`onMounted` gets the runtime before its init, so subscribe to its `lifecycle.events` here.' },
    { title: 'It initializes', hook: 'onInit', text: 'The lifecycle runs `onInit` once; the control shows its loading state meanwhile.' },
    { title: 'It is ready, or it failed', hook: 'onReady', text: '`lifecycle.events` raises `onReady`, or `onInitFailed` while the host shows the error with a retry.' },
    { title: 'It remounts', hook: 'remount()', text: '`lifecycle.remount()` or the retry destroys the runtime and starts again from the first step.' },
    { title: 'It is destroyed', hook: 'onDestroy', text: '`lifecycle.events` raises `onDestroyed`, then `onDestroy` releases what the runtime holds.' },
]

const EXPLORE: IExploreCard[] = [
    { title: 'Talking to the control', iconName: 'Plug', href: '?path=/docs/controls-datasetcontrol-talking-to-the-control--overview', text: 'What the DatasetControl\'s runtime adds: views, parts and modules.' },
    { title: 'Ribbon', iconName: 'GlobalNavButton', href: '?path=/docs/controls-ribbon-get-started--overview', text: 'The Ribbon, whose runtime loads its commands.' },
    { title: 'Building blocks', iconName: 'Puzzle', href: '?path=/docs/concepts-building-blocks--overview', text: 'How a control is made: parts, UI and adapters.' },
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
