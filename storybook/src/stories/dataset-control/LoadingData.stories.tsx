import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { DependenciesExample, WaitingExample } from '../../dataset-control/examples/loadingDataExamples'
import { ILifecycleStep, Lifecycle } from '../../grid/showcase/Lifecycle'

const DESCRIPTION = `
A DatasetControl doesn't hold records itself: it loads them every time it shows a view, on its first mount and again whenever the user switches the view or reloads. You decide how through \`onLoad\`, which gets the view the user is on and returns a provider with that view's records, while a placeholder stands in for the parts. Try it below: switch the view and watch the placeholder come back.

{{canvas: Wait for the deals}}

## When the control loads

Every load mounts the control anew, with a new \`IDatasetControl\`, new modules, new parts and a new provider from \`onLoad\`. These start one:

| What starts a load | Asks about unsaved changes |
|---|---|
| The first mount | – |
| Picking a view, or \`loadView()\` | Yes |
| Saving *Edit columns*, closing *Manage views*, or \`reload()\` | Yes |
| Saving a new user view | Yes |
| *Try again*, or \`retry()\` | No |

A placeholder stands in for the parts until the first page is in, so put what must show at once, such as a page title, outside the control. Creating the provider is on [**Data providers**](?path=/docs/concepts-data-providers--overview); what a view carries is on [**Views**](?path=/docs/controls-datasetcontrol-views--overview).

## Lifecycle

Each mount runs these steps; what the user changed is on [**State**](?path=/docs/controls-datasetcontrol-state--overview), and failures on [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview).

{{block: lifecycle}}

## Load what every view needs once

\`onLoadDependencies\` loads what both the modules and \`onLoad\` read, such as the entity's metadata or the signed-in user, ahead of them on every load. \`onLoad\` reads it through the control, which \`onMounted\` hands you before the load.

{{story: Filter by the signed-in user}}

A module reads it the same way, from the control its \`onLoad\` gets.

## Keep a shared provider

The control destroys every provider it lets go of; to keep one the rest of your page uses, pass \`destroyProviderOnUnmount={false}\` and see *Lifetime* on [**Data providers**](?path=/docs/concepts-data-providers--overview).
`

const LIFECYCLE: ILifecycleStep[] = [
    { title: 'The control mounts', hook: 'onMounted', text: '`onMounted` gets the new `IDatasetControl` before anything loads, so subscribe to its events here.' },
    { title: 'Dependencies and modules load', hook: 'onLoadDependencies', text: '`onLoadDependencies` runs first, then each module\'s `onLoad` in the order of `modules`.' },
    { title: 'The view is picked', hook: 'onLoadViews', text: '`onLoadViews` lists the views, the modules add theirs, and the control picks the one asked for or the one the user was on while it is listed, else the first.' },
    { title: 'The provider is created', hook: 'onLoad', text: '`onLoad` gets that view and returns the provider, and `view.resolve(provider)` gives the view\'s `data`, resolved once either way.' },
    { title: 'The view is applied', text: 'The control sets the view\'s linking and columns on the provider and puts back what the user changed in the view.' },
    { title: 'The first page loads', hook: 'onReady', text: 'Unless `onLoad` already requested it, the provider loads its first page, then the parts show and `onReady` gets the control.' },
    { title: 'The control unmounts', hook: 'onDestroyed', text: 'On the next load or when the page removes the control, `onDestroyed` gets it before its modules and provider are destroyed.' },
]

const meta = {
    title: 'Controls/DatasetControl/Loading data',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { lifecycle: () => <Lifecycle steps={LIFECYCLE} /> }),
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
    parameters: {
        docs: {
            description: {
                story: `A placeholder stands in for the view switcher and the grid while each view loads. Try: switch the view and watch the placeholder come back for the new mount.`,
            },
        },
    },
}

export const FilterByTheSignedInUser: Story = {
    name: 'Filter by the signed-in user',
    render: () => renderStory(<DependenciesExample />),
    parameters: {
        docs: {
            description: {
                story: `\`onLoadDependencies\` loads the signed-in user, and \`onLoad\` filters *My deals* by them. Try: switch to *All deals* and back, then change the name in \`loadUser\` to *Ben Carter*.`,
            },
        },
    },
}
