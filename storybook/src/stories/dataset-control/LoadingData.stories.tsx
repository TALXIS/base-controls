import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { DependenciesExample, WaitingExample } from '../../dataset-control/examples/loadingDataExamples'
import { ILifecycleStep, Lifecycle } from '../../grid/showcase/Lifecycle'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
A DatasetControl does not hold records itself: it loads them on its first mount and again whenever the user switches the view or reloads. You decide how in \`onLoad\`, which returns \`{ provider }\` with its records and the views to switch between, while a placeholder stands in for the parts. Try it below: switch the view and watch the placeholder come back.

{{canvas: Wait for the deals}}

## When the control loads

Every load mounts the control anew, with a new \`IDatasetControl\`, new modules, new parts and a new provider from \`onLoad\`. The parts show once the first page is in, so put what must show at once outside the control.

| A load starts on | From your code |
|---|---|
| The first mount | – |
| Picking a view in the view switcher | \`control.loadView(viewId)\` |
| Saving *Edit columns*, saving a new user view or closing *Manage views* | \`control.reload()\` |
| **Try again** after a failed load | \`control.lifecycle.remount()\` |

Creating the provider is on [**Data providers**](?path=/docs/concepts-data-providers--overview); what a view carries is on [**Views**](?path=/docs/controls-datasetcontrol-views--overview).

## Unsaved changes

Before anything throws away records that have unsaved changes, the control asks the user whether to discard them. Discarding clears the changes and goes ahead; keeping them cancels the action. The ribbon's **Save** and **Discard changes** let the user settle them first: see [**Ribbon**](?path=/docs/controls-datasetcontrol-parts-ribbon--overview).

It asks before every load in the table above except the first mount and **Try again**, which have no changes to lose. It also asks before a part loads the records again: searching, paging, changing the page size, the ribbon's **Refresh**, and sorting, filtering, grouping or totals in a grid. Your own calls to the provider, such as \`refresh()\`, do not ask. The question is the \`dataset.unsavedChangesConfirmation\` label: see [**Localization**](?path=/docs/concepts-localization--overview).

## Lifecycle

Each mount runs these steps. The lifecycle events every runtime raises are on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview), what the user changed is on [**State**](?path=/docs/controls-datasetcontrol-state--overview), and failures on [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview).

{{block: lifecycle}}

## Load what every view needs

Load what the views need, such as the entity's metadata or the signed-in user, at the start of \`onLoad\`, and build the views over it: each view's \`resolve(provider)\` can then read it.

{{story: Filter by the signed-in user}}

## Keep a shared provider

The control destroys every provider it lets go of. To keep one the rest of your page uses, pass \`destroyProviderOnUnmount={false}\`: see [**Data providers**](?path=/docs/concepts-data-providers--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Views', iconName: 'ViewList', href: '?path=/docs/controls-datasetcontrol-views--overview', text: 'List the views and set the provider up for the one the user picks.' },
    { title: 'Error handling', iconName: 'Error', href: '?path=/docs/controls-datasetcontrol-error-handling--overview', text: 'What the user sees when a load fails, and Try again.' },
    { title: 'Talking to the control', iconName: 'Plug', href: '?path=/docs/controls-datasetcontrol-talking-to-the-control--overview', text: 'Follow every load and start one from your own code.' },
]

const LIFECYCLE: ILifecycleStep[] = [
    { title: 'The control mounts', hook: 'onSetup', text: '`onSetup` gets the new `IDatasetControl` before anything loads, so subscribe to its events here.' },
    { title: 'The modules load', text: 'Each module\'s `onLoad` runs in the order of `modules`.' },
    { title: 'The provider is created', hook: 'onLoad', text: '`onLoad(control)` returns `{ provider, views }`, and the modules add their views.' },
    { title: 'The view is picked', text: 'The control picks the view asked for, or the one the user was on while it is listed, else the first.' },
    { title: 'The view is applied', hook: 'resolve', text: 'The view\'s `resolve(provider)` sets the provider up, then the control sets its linking and columns and puts back what the user changed in the view.' },
    { title: 'The first page loads', hook: 'onReady', text: 'Unless `onLoad` already requested it, the provider loads its first page, then the parts show and `control.lifecycle.events` raises `onReady`.' },
    { title: 'The control unmounts', hook: 'onDestroyed', text: 'On the next load or when the page removes the control, `control.lifecycle.events` raises `onDestroyed` before its modules and provider are destroyed.' },
]

const meta = {
    title: 'Controls/DatasetControl/Loading data',
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

export const WaitForTheDeals: Story = {
    name: 'Wait for the deals',
    render: () => renderStory(<WaitingExample />),
}

export const FilterByTheSignedInUser: Story = {
    name: 'Filter by the signed-in user',
    render: () => renderStory(<DependenciesExample />),
    parameters: {
        docs: {
            description: {
                story: `\`onLoad\` loads the signed-in user first, and *My deals* filters by them as it opens. Try: change the name in \`loadUser\` to *Ben Carter*.`,
            },
        },
    },
}
