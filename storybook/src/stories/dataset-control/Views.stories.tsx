import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ProviderViewsExample } from '../../dataset-control/examples/viewsExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
A view is a named way of looking at the same records, such as *All deals* or *Won deals*: it decides which columns show, and can carry its own filter or sorting. You list the views in \`onLoadViews\`, show them with \`DatasetControl.ViewSwitcher\`, and set up the one the user picks in \`onLoad\`. Try it below: switch to *Biggest deals*, listed under *Reports*.

{{canvas: Views that set up the provider}}

## Describe a view

The switcher needs only a view's name; what the view shows is resolved when it opens, so it can be fetched then.

| Key | Description |
|---|---|
| \`id\` | Identifies the view. |
| \`name\` | Shown in the switcher. |
| \`group\` | \`{ id, name }\`: the header the view is listed under. Views without one go under *System views*. |
| \`resolve(provider)\` | Required. Returns what the view shows, given the provider it opens on; can be async. |

| \`resolve\` returns | Default | Description |
|---|---|---|
| \`columns\` | Required | The columns in order: \`name\`, plus any \`IColumn\` fields to override. The rest comes from the provider's available columns; a column the provider does not offer is used as given. |
| \`linking\` | The provider's own | The related entities its columns come from, as \`alias.column\`. |
| \`data\` | None | Anything else the view sets up, such as its filter. Its type is the control's \`TData\`. |

## Load the view

\`onLoad\` gets the view as listed, as \`loadDeals\` in the example's \`views.ts\` shows: create the provider, \`await view.resolve(provider)\`, set the provider up from the view's \`data\` and return \`{ provider }\`. Do not set the columns or linking: the control does. The full sequence is on [**Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview).

Inside the control, \`useDatasetControl<IDealViewData>().getView()\` returns the open view with its \`data\`, for example to draw it as cards: see [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).

## Let users save their own views

A user queries module adds *Save as new view*, *Save changes* and *Manage views* to the switcher, and lists the user's views under *My views*: see [**User views**](?path=/docs/controls-datasetcontrol-views-user-views--overview).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`components\` | \`IViewSwitcherComponents\` | Defaults | See [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview). |
| \`children\` | \`ReactNode\` | None | What adds to the switcher, such as \`DatasetControl.UserQueries\`. |

## From your code

The control opens and lists views with \`loadView\`, \`reload\`, \`getViews\` and \`getView\`: see [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview). \`control.parts.get('viewSwitcher')\` returns the switcher once it is drawn:

| Member | Does |
|---|---|
| \`getViews()\`, \`getCurrentView()\` | The views, and the open one as listed; \`undefined\` when it is not among them. |
| \`select(viewId)\` | Opens the view; nothing when it is already open. |
| \`registerItems(hook, priority?)\` | Adds to the switcher's menu: \`hook(items)\` changes the Fluent \`IContextualMenuItem\`s in place each time the menu opens. Returns its unregistration. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'User views', iconName: 'SaveAs', href: '?path=/docs/controls-datasetcontrol-views-user-views--overview', text: 'Let each user save how they sorted, filtered and arranged a view.' },
    { title: 'Loading data', iconName: 'CloudDownload', href: '?path=/docs/controls-datasetcontrol-loading-data--overview', text: 'When the control loads a view, and the steps each load runs.' },
    { title: 'Your own UI', iconName: 'GridViewSmall', href: '?path=/docs/controls-datasetcontrol-your-own-ui--overview', text: 'Draw each view in a UI of its own, such as cards.' },
]

const meta = {
    title: 'Controls/DatasetControl/Views',
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

export const ViewsThatSetUpTheProvider: Story = {
    name: 'Views that set up the provider',
    render: () => renderStory(<ProviderViewsExample />),
}
