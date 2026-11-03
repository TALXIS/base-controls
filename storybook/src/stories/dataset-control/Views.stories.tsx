import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ProviderViewsExample } from '../../dataset-control/examples/viewsExamples'

const DESCRIPTION = `
A view is a named way of looking at the same records, such as *All deals* or *Won deals*: it decides which columns show, and can carry its own filter or sorting. The user picks one from the view switcher, and the control loads the records anew for it. You list the views in \`onLoadViews\`, show them with \`DatasetControl.ViewSwitcher\`, and set up the one the user picks in \`onLoad\`.

{{story: Views that set up the provider}}

## Describe a view

The switcher needs only a view's name. What the view shows is resolved when it opens, so it can be fetched then.

| View field | Description |
|---|---|
| \`id\` | Identifies the view. |
| \`name\` | Shown in the switcher. |
| \`group\` | \`{ id, name }\`, the header it is listed under. Views without one go under *System views*. |
| \`resolve(provider)\` | Required. Returns what the view shows, given the provider it opens on. Can be async. |

| \`resolve\` returns | Default | Description |
|---|---|---|
| \`columns\` | Required | The columns in order: \`name\`, plus any \`IColumn\` fields to override. The rest is filled in from the provider's available columns; a column the provider doesn't offer is used as given. |
| \`linking\` | The provider's own | The related entities its columns come from, as \`alias.column\`. |
| \`data\` | None | Anything else the view sets up, such as its filter. Its type is the control's \`TData\`. |

## Load the view

\`onLoad\` gets the view as listed, as \`loadDeals\` in the example's *views.ts* shows: create the provider, \`await view.resolve(provider)\`, set the provider up from the view's \`data\` and return it. Don't set the columns or linking: the control does.

The full sequence is under *Lifecycle* on [**Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview).

## Let users save their own views

A user queries module adds *Save as new view*, *Save changes* and *Manage views* to the switcher, and lists the user's views under *My views*: see [**User views**](?path=/docs/controls-datasetcontrol-views-user-views--overview).

## ViewSwitcher props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`components\` | \`IViewSwitcherComponents\` | Defaults | See [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview). |
| \`children\` | \`ReactNode\` | None | What adds to the switcher, such as \`DatasetControl.UserQueries\`. |

## From your code

| On the control | Description |
|---|---|
| \`loadView(viewId)\` | Opens the view, as picking it does. |
| \`reload()\` | Lists the views and opens the current one again. |
| \`getViews()\` | The views as listed for this mount, user views included. |
| \`getView()\` | The open view, with what \`resolve\` returned. |

| On \`control.parts.get('viewSwitcher')\` | Description |
|---|---|
| \`getViews()\`, \`getCurrentView()\` | The views, and the open one as listed; \`undefined\` when it is not among them. |
| \`select(viewId)\` | Opens the view; nothing when it is already open. |
| \`registerItems(hook, priority?)\` | Adds to the switcher's menu: \`hook(items)\` changes the Fluent \`IContextualMenuItem\`s in place each time the menu opens. Returns its unregistration. |

See [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview).

## Good to know

- Switching the view asks first when the records have unsaved changes.
- Inside the control, \`useDatasetControl<IDealViewData>().getView()\` returns the open view with its \`data\`, for example to draw it as cards: see *Your own collection view* on [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).
`

const meta = {
    title: 'Controls/DatasetControl/Views',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
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
    parameters: {
        docs: {
            description: {
                story: `Three views of the deals, each with its columns and, in its \`data\`, its filter or sorting; *Biggest deals* is listed under *Reports*. Try: switch between them, then double-click a deal, change it and switch again; the control asks before it throws your change away.`,
            },
        },
    },
}
