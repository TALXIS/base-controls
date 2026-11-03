import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { YourOwnPiecesExample } from '../../dataset-control/examples/appearanceExamples'
import { FluentV9Example } from '../../dataset-control/examples/fluentV9Examples'
import { SelectedValueExample } from '../../dataset-control/examples/yourOwnPartsExamples'
import { CustomUiViewsExample } from '../../dataset-control/examples/viewsExamples'

const DESCRIPTION = `
There are two ways to change what the control draws: replace pieces a built-in part draws, through its \`components\`, or add a part of your own, up to a whole UI in place of the grid.

\`\`\`tsx
<DatasetControl.ViewSwitcher components={{ onRenderButton: props => <MyViewButton {...props} /> }} />
\`\`\`

{{story: Replace pieces of the parts}}

## Changing how it looks

The control and each part take a \`components\` map. Its keys name the pieces, and each ends in *slots*, functions named \`onRender…\` that get the props their default draws with and return an element, or \`null\`. A slot you leave out keeps its default, and a nested key merges over the default slot by slot.

| To | Write |
|---|---|
| Change one prop of the default | \`props => QuickFindUiComponents.onRenderTextField({ ...props, disabled: true })\` |
| Wrap the default | \`props => <TooltipHost content='Views'>{ViewSwitcherUiComponents.onRenderButton(props)}</TooltipHost>\` |
| Replace it | \`props => <SearchBox {...props} />\` |
| Remove it | \`() => null\` |

Spread the props you get: they carry the class names, handlers and refs that make the piece work. A slot is called during render, so to use hooks there, return a component of your own: \`props => <MyViewButton {...props} />\`. The table lists every *Key*, its *Slots*, the *Default* a slot can call, and what it *Draws*; a blank *Default* is not exported.

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`DatasetControl\` | Top level | \`onRenderContainer\` | \`ContainerUiComponents\` | The control's box |
| | \`skeleton\` | \`onRenderSkeleton\`; \`loadingBoundary\` | \`SkeletonUiComponents\`, \`LoadingBoundaryComponents\` | The placeholder while a view loads; \`loadingBoundary.onRenderContainer\` is the placeholder itself, so \`<div {...props} />\` there shows a spinner instead |
| | \`errorMessage\` | \`onRenderMessageBar\`, \`onRenderTooltip\`, \`onRenderTitle\`, \`onRenderCommandBar\` | \`ErrorMessageBarComponents\` | A failed load |
| | \`loadingOverlay\` | \`onRenderOverlay\`, \`onRenderSpinner\`, \`onRenderText\` | \`LoadingOverlayComponents\` | The overlay \`loadingOverlay.show()\` draws |
| \`Header\` | Top level | \`onRenderContainer\` | \`HeaderUiComponents\` | The header, which turns the parts compact once they no longer fit |
| \`Header.Start\`, \`Header.End\`, \`Body\`, \`Footer\`, \`Footer.Start\`, \`Footer.End\` | Top level | \`onRenderContainer\` | \`HeaderStartUiComponents\` and the like | The region |
| \`ViewSwitcher\` | Top level | \`onRenderButton\` | \`ViewSwitcherUiComponents\` | The view button; its \`menuProps.items\` are the views |
| \`Ribbon\` | Top level | \`onRenderCommandBar\` | \`RibbonUiComponents\` | The commands, as \`items\` |
| | \`loadingBoundary\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderText\` | \`LoadingBoundaryComponents\` | What shows while the commands load |
| | \`errorMessage\` | \`onRenderMessageBar\`, \`onRenderTooltip\`, \`onRenderTitle\`, \`onRenderCommandBar\` | \`ErrorMessageBarComponents\` | A failed \`onLoad\` |
| \`QuickFind\` | Top level | \`onRenderContainer\`, \`onRenderTextField\` | \`QuickFindUiComponents\` | The search field |
| | \`compact\` | \`onRenderButton\` | \`QuickFindCompactButtonComponents\` | The search button of a compact header |
| | \`callout\` | \`onRenderCallout\`, \`onRenderLikeWarning\`, \`onRenderDescription\`, \`onRenderColumns\`, \`onRenderColumn\` | \`QuickFindCalloutComponents\` | What the search matches, under the field |
| \`EditColumns\` | \`button\` | \`onRenderButton\`, \`onRenderTooltip\` | \`EditColumnsButtonUiComponents\` | The button, and its text in a compact header |
| | \`panel\` | \`onRenderPanel\`, \`onRenderFooter\`, \`onRenderCommandBar\` | \`EditColumnsPanelUiComponents\` | The panel; its command bar is drawn only with commands |
| | \`scopeSelector\`, \`columnSelector\` | \`onRenderSelector\`, \`onRenderOption\` | \`EditColumnsSelectorUiComponents\` | The pickers of a column source and a column |
| | \`columnList\` | \`onRenderColumn\` | \`EditColumnsColumnListUiComponents\` | A column in the list; its \`commands\` start with Remove |
| | \`errorMessage\` | \`onRenderMessageBar\`, \`onRenderTooltip\`, \`onRenderTitle\`, \`onRenderCommandBar\` | \`ErrorMessageBarComponents\` | A failed load of the columns or related entities |
| \`Notifications\` | Top level | \`onRenderNotifications\` | \`NotificationMessageBar\` | The messages |
| \`EmptyRecords\` | Top level | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderText\` | \`EmptyRecordsUiComponents\` | The empty state |
| \`Pagination\` | Top level | \`onRenderCommandBar\` | \`PaginationUiComponents\` | The page buttons |
| \`PageSizeSwitcher\` | Top level | \`onRenderButton\` | \`PageSizeSwitcherUiComponents\` | The record range button; its \`menuProps.items\` are the page sizes |
| \`UserQueries\` | \`manageViewsPanel\` | \`onRenderPanel\`, \`onRenderCloseButton\` | \`ManageViewsPanelUiComponents\` | The *Manage views* panel |
| | \`manageViews\` | \`datasetControl\` (with \`header\`, \`body\`, \`footer\`, \`ribbon\`, \`quickFind\`, \`pagination\`), \`grid\` | | The control and grid inside the panel, keyed as \`DatasetControl\`, its parts and \`Grid\` take them |

\`DatasetControl.Ui\` holds the regions and most parts as plain UI, with no control behind them, for a part of your own that looks like a built-in one. The ribbon and the notifications are not in it: use the exported \`Ribbon\` and \`NotificationMessageBar\`.

### A whole design system

Every slot receives the props its default would get, so a whole design system can stand in for the defaults. The example draws the control with Fluent UI v9: the records in its \`DataGrid\`, the menus, toolbars, search field and popover, the column editor's drawer, the *Manage views* drawer, the notifications, the empty state and the load error. The loading placeholder, and the column editor's pickers and column list, keep their own look. Fluent v9 components need a \`FluentProvider\` around them, so the control's container is one.

{{story: Everything in Fluent UI v9}}

## Add a part of your own

A part of your own is any component you put inside the control: a total in the footer, a filter in the header, or a gallery in place of the grid. Inside the control, it has what the built-in parts have:

| Hook | Description |
|---|---|
| \`useDataProviderEvents(events)\` | The provider, drawing the component again on each of the provider's \`events\`. |
| \`useDataProvider()\` | The provider, without drawing again. More under *Load and read* and *Events* on [**Data providers**](?path=/docs/concepts-data-providers--overview). |
| \`useDatasetControl()\` | The control, to switch views or reach the built-in parts. See [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview). |
| \`useDatasetControlModule(name)\` | A module the control loaded, such as \`'userQueries'\`; throws when it is not loaded. |
| \`useControlStateStore(stateKey)\` | Where the component keeps what it should remember, per view. See *Keep your own part's state* on [**State**](?path=/docs/controls-datasetcontrol-state--overview). |
| \`useDatasetControlRegion()\` | \`'start'\` or \`'end'\`, the side of the header or footer the component is in; \`undefined\` outside both. |
| \`useDatasetControlHeader()\` | Inside the header, \`showOnly()\` hides everything in it except the calling part, and \`showAll()\` brings the rest back; \`undefined\` outside the header. |
| \`useCompact()\` | Whether the header is compact. See *Your own part in a compact header* on [**Layout**](?path=/docs/controls-datasetcontrol-layout--overview). |
| \`useDatasetControlPart(key, onCreate)\` | Creates an object once and registers it under one of the part keys on [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview), while the component is mounted. |

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

## Your own collection view

The parts work on the provider, not on the grid, so anything that shows records can go in \`Body\`: a list, cards, a calendar or a chart. Different views can be drawn differently: let each view say which UI it uses in its \`data\`, and pick it in your body component. See [**Views**](?path=/docs/controls-datasetcontrol-views--overview).

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

Pass the events your view shows to \`useDataProviderEvents\`, keep what it should remember, such as its scroll, with \`useControlStateStore\`, and wrap it in \`DatasetControl.EmptyRecords\` for an empty state (see [**Notifications and empty records**](?path=/docs/controls-datasetcontrol-parts-notifications-and-empty-records--overview)). Edit columns changes the provider's columns, so offer it only when your view shows them. Every view switch mounts the body anew, so it reads the view once.

{{story: A different UI per view}}
`

const meta = {
    title: 'Controls/DatasetControl/Your own UI',
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
                story: `The deals, drawn entirely in Fluent UI v9. Try: switch the view and the page size, save a view of your own and open *Manage views*, sort by a column header, select deals to change the ribbon, click the search, open *Edit columns*, press *Break the connection* to see the notifications collapse under a summary, search for something that is not there for the empty state, and *Fail the next load* for the error, then *Try again*. Open the *v9.tsx* file to see every piece.`,
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
