import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { YourOwnPiecesExample } from '../../dataset-control/examples/appearanceExamples'
import { FluentV9Example } from '../../dataset-control/examples/fluentV9Examples'
import { SelectedValueExample } from '../../dataset-control/examples/yourOwnPartsExamples'
import { CustomUiViewsExample } from '../../dataset-control/examples/viewsExamples'

const DESCRIPTION = `
There are two ways to change what the control draws: replace a piece a built-in part draws, or add a part of your own, up to a whole UI in place of the grid. The strings are on [**Localization**](?path=/docs/datasetcontrol-localization--overview).

## Replace pieces of the parts

Every part takes \`components\`, which replaces pieces of what it draws. A piece receives the props its default would get, so you can change them and render the default, or render something of your own.

\`\`\`tsx
<DatasetControl.ViewSwitcher components={{ onRenderButton: props => <MyViewButton {...props} /> }} />
\`\`\`

- Every piece is optional: what you leave out keeps its default.
- A piece inside a part, such as the quick find's callout, has its pieces under its own name: \`components={{ callout: { onRenderColumn } }}\`.
- The defaults are exported, such as \`ViewSwitcherUiComponents\`, to render the default with your changes.
- \`DatasetControl.Ui\` holds the regions and most parts as plain UI, with no control behind them, for a part of your own that looks like a built-in one. The ribbon and the notifications are not in it: use the exported \`Ribbon\` and \`NotificationMessageBar\`.

{{story: Replace pieces of the parts}}

### Every piece

| Part | Key | Description |
|---|---|---|
| \`DatasetControl\` | Top level | \`onRenderContainer\`: the control's box |
| \`DatasetControl\` | \`skeleton\` | \`onRenderSkeleton\`, and \`loadingBoundary\`, whose container is the placeholder. Render \`<div {...props} />\` there for a spinner instead. |
| \`DatasetControl\` | \`errorMessage\` | \`onRenderMessageBar\`, \`onRenderTooltip\`, \`onRenderTitle\`, \`onRenderCommandBar\`: the error shown when loading fails |
| \`Header\`, \`Header.Start\`, \`Header.End\`, \`Body\`, \`Footer\`, \`Footer.Start\`, \`Footer.End\` | Top level | \`onRenderContainer\` |
| \`ViewSwitcher\` | Top level | \`onRenderButton\`, whose \`menuProps.items\` are the views |
| \`Ribbon\` | Top level | \`onRenderCommandBar\`, whose \`items\` are the commands |
| \`Ribbon\` | \`loadingBoundary\` | What shows while the commands load |
| \`Ribbon\` | \`errorMessage\` | The error when the ribbon's \`onLoad\` throws |
| \`QuickFind\` | Top level | \`onRenderContainer\`, \`onRenderTextField\` |
| \`QuickFind\` | \`compact\` | \`onRenderButton\`: the search button while the header is compact |
| \`QuickFind\` | \`callout\` | \`onRenderCallout\`, \`onRenderLikeWarning\`, \`onRenderDescription\`, \`onRenderColumns\`, \`onRenderColumn\` |
| \`EditColumns\` | \`button\` | \`onRenderButton\`, and \`onRenderTooltip\`, which shows its text while the header is compact |
| \`EditColumns\` | \`panel\` | \`onRenderPanel\`, \`onRenderFooter\`, \`onRenderCommandBar\` (empty by default) |
| \`EditColumns\` | \`scopeSelector\`, \`columnSelector\` | \`onRenderSelector\`, \`onRenderOption\` |
| \`EditColumns\` | \`columnList\` | \`onRenderColumn\`, whose \`commands\` hold the remove button |
| \`EditColumns\` | \`errorMessage\` | The error when loading the provider's available columns or related entities throws |
| \`Notifications\` | Top level | \`onRenderNotifications\` |
| \`EmptyRecords\` | Top level | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderText\` |
| \`Pagination\` | Top level | \`onRenderCommandBar\` |
| \`PageSizeSwitcher\` | Top level | \`onRenderButton\` |
| \`UserQueries\` | \`manageViewsPanel\` | \`onRenderPanel\`, \`onRenderCloseButton\`: the *Manage views* panel |
| \`UserQueries\` | \`manageViews\` | \`datasetControl\`: the control inside the panel, as \`DatasetControl\` takes, with its parts under \`header\`, \`body\`, \`footer\`, \`ribbon\`, \`quickFind\` and \`pagination\`; \`grid\`: everything its grid's \`components\` takes |

### A whole design system

Since every piece receives the props its default would get, a whole design system can stand in for the defaults. The example draws the whole control with Fluent UI v9: the records in its \`DataGrid\`, the view switcher and page size menus, the ribbon and paging toolbars, the search field and its popover, the column editor's drawer, the *Manage views* drawer of the user's own views, the notifications, the empty state and the load error. The loading placeholder, and the column editor's pickers and column list, keep their own look. Fluent v9 components need a \`FluentProvider\` around them, so the control's container is one.

{{story: Everything in Fluent UI v9}}

## Add a part of your own

A part of your own is any component you put inside the control: a total in the footer, a filter in the header, or a gallery in place of the grid. Inside the control, it has what the built-in parts have:

| Hook | Description |
|---|---|
| \`useDataProviderEvents(events)\` | The provider, and draws the component again on each of the provider's \`events\`. |
| \`useDataProvider()\` | The provider, without drawing again. More on reading it under *Read records* and *Events* on [**Data providers**](?path=/docs/data-providers--overview). |
| \`useDatasetControl()\` | The control, to switch views or reach the built-in parts. See [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview). |
| \`useControlStateStore(stateKey)\` | Where the component keeps what it should remember, per view. See *Keep your own part's state* on [**State**](?path=/docs/datasetcontrol-state--overview). |
| \`useDatasetControlRegion()\` | \`'start'\` or \`'end'\`, the side of the header or footer the component is in; \`undefined\` outside both. |
| \`useDatasetControlHeader()\` | Inside the header, \`showOnly()\` hides everything in the header except the part calling it, such as while it needs the whole line, and \`showAll()\` brings the rest back; \`undefined\` outside the header. |
| \`useCompact()\` | Whether the header is compact, so the component can draw smaller. See *Your own part in a compact header* on [**Layout**](?path=/docs/datasetcontrol-layout--overview). |

### A part in a region

\`\`\`tsx
const SelectedValue = () => {
    const provider = useDataProviderEvents(['onRecordsSelected'])
    const total = provider.getSelectedRecordIds().reduce((sum, id) => sum + (provider.getRecordsMap()[id].getValue('value') ?? 0), 0)
    return <Text>Selected: {total}</Text>
}

<DatasetControl.Footer.Start>
    <SelectedValue />
</DatasetControl.Footer.Start>
\`\`\`

{{story: Total the selected deals}}

To make it look like a built-in part, draw it with \`DatasetControl.Ui\`, described under *Replace pieces of the parts* above.

## Your own collection view

The parts work on the provider, not on the grid, so anything that shows records can go in \`Body\`: a list, cards, a calendar or a chart. Different views can be drawn differently: let each view say which UI it uses in its \`data\`, and pick it in your body component. See [**Views**](?path=/docs/datasetcontrol-views--overview).

\`\`\`tsx
const ProductsBody = () => {
    const control = useDatasetControl<IProductViewData>()
    return <DatasetControl.EmptyRecords>
        {control.getView()?.data?.ui === 'gallery' ? <ProductGallery /> : <Grid stateKey='grid' modules={modules} />}
    </DatasetControl.EmptyRecords>
}
\`\`\`

| Provider | What it gives you |
|---|---|
| \`getRecords()\` | The records of the page, already searched, filtered and sorted. |
| \`getColumns()\` | The columns, as the user set them in Edit columns. |
| \`getSelectedRecordIds()\`, \`setSelectedRecordIds(ids)\` | The selection, which the ribbon follows. |
| \`onNewDataLoaded\` | Raised when the records change: after a search, a page change or a reload. |
| \`onRecordsSelected\` | Raised when the selection changes. |
| \`onRecordColumnValueChanged\` | Raised when a record's value changes. |

- Pass the events your view shows to \`useDataProviderEvents\`.
- Keep what your view should remember, such as its scroll, with \`useControlStateStore\`.
- Wrap the view in \`DatasetControl.EmptyRecords\` for an empty state. See [**Notifications and empty records**](?path=/docs/datasetcontrol-parts-notifications-and-empty-records--overview).
- Edit columns changes the provider's columns, so it is useful only when your view shows them.
- The control mounts its parts anew for every view, so the body reads the view once. See *Parts live as long as a load* on [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview).

{{story: A different UI per view}}
`

const meta = {
    title: 'DatasetControl/Your own UI',
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

export const YourOwnPieces: Story = {
    name: 'Replace pieces of the parts',
    render: () => renderStory(<YourOwnPiecesExample />),
    parameters: {
        docs: {
            description: {
                story: `The view switcher adds *Copy a link to this view* under the views, the column editor adds an info command to each column, and the quick find shows each column's name in its callout. Try: open each of them.`,
            },
        },
    },
}

export const EverythingInFluentV9: Story = {
    name: 'Everything in Fluent UI v9',
    render: () => renderStory(<FluentV9Example />),
    parameters: {
        docs: {
            description: {
                story: `The deals, drawn entirely in Fluent UI v9. Try: switch the view and the page size, save a view of your own and open *Manage views*, sort by a column header, select deals to change the ribbon, focus the search, open *Edit columns*, press *Break the connection* to see the notifications collapse under a summary, search for something that is not there for the empty state, and *Fail the next load* for the error, then *Try again*. Open the *v9.tsx* file to see every piece.`,
            },
        },
    },
}

export const TotalOfTheSelectedDeals: Story = {
    name: 'Total the selected deals',
    render: () => renderStory(<SelectedValueExample />),
    parameters: {
        docs: {
            description: {
                story: `A part of your own in the footer, redrawn on every selection by \`useDataProviderEvents\`. Try: select a few deals.`,
            },
        },
    },
}

export const ADifferentUiPerView: Story = {
    name: 'A different UI per view',
    render: () => renderStory(<CustomUiViewsExample />),
    parameters: {
        docs: {
            description: {
                story: `Four views of the products. *All products* is the grid, *Price list* is Fluent UI v9's \`DataGrid\`, and *Seating* and *Lighting* are a gallery that keeps its scroll per view. Try: select products in one UI, search for something none of them have to see the empty state, and open the *views.ts* file to change which UI a view uses.`,
            },
        },
    },
}
