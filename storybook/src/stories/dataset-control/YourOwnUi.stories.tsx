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

{{story: Replace pieces of the parts}}

## Change how it looks

The control and each part take a \`components\` map. Its keys name the pieces, and each ends in *slots*: functions named \`onRender…\` that get the props their default draws with and return an element, or \`null\`.

| To | Write |
|---|---|
| Change one prop of the default | \`props => QuickFindUiComponents.onRenderTextField({ ...props, disabled: true })\` |
| Wrap the default | \`props => <TooltipHost content='Views'>{ViewSwitcherUiComponents.onRenderButton(props)}</TooltipHost>\` |
| Replace it | \`props => <SearchBox {...props} />\` |
| Remove it | \`() => null\` |

- A slot you leave out keeps its default, and a nested key merges over the default slot by slot.
- Spread the props you get: they carry the class names, handlers and refs that make the piece work.
- A slot is called during render. To use hooks there, return a component of your own: \`props => <MyViewButton {...props} />\`.
- To add menu items or commands, use the part's \`registerItems\`, \`registerCommands\` or \`registerColumnCommands\`, not a slot: see [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview).
- Every key and slot is listed under *Every slot* below.

The control's own box takes two more props:

| Prop | Does |
|---|---|
| \`className\` | Adds a class to the control's box. |
| \`scope\` | Wraps everything inside each mount, such as in a context provider of yours. It renders inside the control, so it can call \`useDatasetControl()\`. Pass the same component on every render. |

### A whole design system

Every slot gets the props its default would, so a design system can stand in for the defaults. The example draws the control with Fluent UI v9:

- In v9: the records in its \`DataGrid\`, the menus, toolbars, search field and popover, the column editor's drawer, the *Manage views* drawer, the notifications, the empty state and the load error.
- Left as they are: the loading placeholder, and the column editor's pickers and column list.
- v9 components need a \`FluentProvider\` around them, so the control's container is one, light or dark to match the Fluent v8 theme.

{{story: Everything in Fluent UI v9}}

## Add a part of your own

A part of your own is any component you put inside the control: a total in the footer, a filter in the header, or a gallery in place of the grid. Inside the control, it has what the built-in parts have:

| Hook | Description |
|---|---|
| \`useDataProviderEvents(events)\` | The provider, drawing the component again on each of the provider's \`events\`. |
| \`useDataProvider()\` | The provider, without drawing again. See [**Data providers**](?path=/docs/concepts-data-providers--overview). |
| \`useDatasetControl()\` | The control, to switch views or reach the built-in parts. See [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview). |
| \`useDatasetControlModule(name)\` | A module the control loaded, such as \`'userQueries'\`; throws when it is not loaded. |
| \`useControlStateStore(stateKey)\` | Where the component keeps what it should remember, per view. See *Keep your own part's state* on [**State**](?path=/docs/controls-datasetcontrol-state--overview). |
| \`useDatasetControlRegion()\` | \`'start'\` or \`'end'\`, the side of the header or footer the component is in; \`undefined\` outside both. |
| \`useDatasetControlHeader()\` | Inside the header, \`showOnly()\` hides everything in it except the calling part, and \`showAll()\` brings the rest back; \`undefined\` outside the header. |
| \`useCompact()\` | Whether the header is compact. See *Your own part in a compact header* on [**Layout**](?path=/docs/controls-datasetcontrol-layout--overview). |
| \`useDatasetControlPart(key, onCreate)\` | Creates an object once and registers it under \`key\` for \`control.parts\`, while the component is mounted. |

A part of your own needs its key declared before \`useDatasetControlPart\` takes it:

\`\`\`ts
declare module '@talxis/base-controls' {
    interface IDatasetControlPartMap {
        dealChart: DealChart
    }
}
\`\`\`

\`DatasetControl.Ui\` holds the regions and most parts as plain UI, with no control behind them, for a part that looks like a built-in one. The ribbon and the notifications are not in it: use the exported \`Ribbon\` and \`NotificationMessageBar\`.

### A part in a region

{{story: Total the selected deals}}

## Your own collection view

The parts work on the provider, not on the grid, so anything that shows records can go in \`Body\`: a list, cards, a calendar or a chart. To draw views differently, let each view say which UI it uses in its \`data\` (see [**Views**](?path=/docs/controls-datasetcontrol-views--overview)), and pick it in your body component, as *ProductsBody.tsx* in the example does.

Read the records, columns and selection from the provider, and draw again on \`onNewDataLoaded\`, \`onRecordsSelected\` and \`onRecordColumnValueChanged\`: see [**Data providers**](?path=/docs/concepts-data-providers--overview).

- Pass the events your view shows to \`useDataProviderEvents\`.
- Keep what the view should remember, such as its scroll, with \`useControlStateStore\`.
- Wrap it in \`DatasetControl.EmptyRecords\` for an empty state: see [**Notifications and empty records**](?path=/docs/controls-datasetcontrol-parts-notifications-and-empty-records--overview).
- *Edit columns* changes the provider's columns, so offer it only when your view shows them.
- Every view switch mounts the body anew, so it reads the view once.

{{story: A different UI per view}}

## Every slot

Each key's defaults are exported under the name in *Defaults*; a blank one is not exported.

| Key | Slots | Defaults |
|---|---|---|
| \`DatasetControl\` | \`onRenderContainer\` | \`ContainerUiComponents\` |
| \`DatasetControl\` › \`skeleton\` | \`onRenderSkeleton\`, \`loadingBoundary\` | \`SkeletonUiComponents\`, \`LoadingBoundaryComponents\` |
| \`DatasetControl\` › \`errorMessage\` | \`onRenderMessageBar\`, \`onRenderTooltip\`, \`onRenderTitle\`, \`onRenderCommandBar\` | \`ErrorMessageBarComponents\` |
| \`DatasetControl\` › \`loadingOverlay\` | \`onRenderOverlay\`, \`onRenderSpinner\`, \`onRenderText\` | \`LoadingOverlayComponents\` |
| \`Header\` | \`onRenderContainer\` | \`HeaderUiComponents\` |
| \`Header.Start\`, \`Header.End\`, \`Body\`, \`Footer\`, \`Footer.Start\`, \`Footer.End\` | \`onRenderContainer\` | \`HeaderStartUiComponents\` and the like |
| \`ViewSwitcher\` | \`onRenderButton\` | \`ViewSwitcherUiComponents\` |
| \`Ribbon\` | \`onRenderCommandBar\` | \`RibbonUiComponents\` |
| \`Ribbon\` › \`loadingBoundary\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderText\` | \`LoadingBoundaryComponents\` |
| \`Ribbon\` › \`errorMessage\` | As \`DatasetControl\` › \`errorMessage\` | \`ErrorMessageBarComponents\` |
| \`QuickFind\` | \`onRenderContainer\`, \`onRenderTextField\` | \`QuickFindUiComponents\` |
| \`QuickFind\` › \`compact\` | \`onRenderButton\` | \`QuickFindCompactButtonComponents\` |
| \`QuickFind\` › \`callout\` | \`onRenderCallout\`, \`onRenderLikeWarning\`, \`onRenderDescription\`, \`onRenderColumns\`, \`onRenderColumn\` | \`QuickFindCalloutComponents\` |
| \`EditColumns\` › \`button\` | \`onRenderButton\`, \`onRenderTooltip\` | \`EditColumnsButtonUiComponents\` |
| \`EditColumns\` › \`panel\` | \`onRenderPanel\`, \`onRenderFooter\`, \`onRenderCommandBar\` | \`EditColumnsPanelUiComponents\` |
| \`EditColumns\` › \`scopeSelector\`, \`columnSelector\` | \`onRenderSelector\`, \`onRenderOption\` | \`EditColumnsSelectorUiComponents\` |
| \`EditColumns\` › \`columnList\` | \`onRenderColumn\` | \`EditColumnsColumnListUiComponents\` |
| \`EditColumns\` › \`errorMessage\` | As \`DatasetControl\` › \`errorMessage\` | \`ErrorMessageBarComponents\` |
| \`Notifications\` | \`onRenderNotifications\` | |
| \`EmptyRecords\` | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderText\` | \`EmptyRecordsUiComponents\` |
| \`Pagination\` | \`onRenderCommandBar\` | \`PaginationUiComponents\` |
| \`PageSizeSwitcher\` | \`onRenderButton\` | \`PageSizeSwitcherUiComponents\` |
| \`UserQueries\` › \`manageViewsPanel\` | \`onRenderPanel\`, \`onRenderCloseButton\` | \`ManageViewsPanelUiComponents\` |
| \`UserQueries\` › \`manageViews\` | \`datasetControl\`, \`grid\` | |

- The view switcher and the page size switcher get their menu as \`menuProps.items\`; the ribbon and the paging get their commands as \`items\`.
- \`skeleton.loadingBoundary.onRenderContainer\` is the placeholder itself, so \`<div {...props} />\` there shows a spinner instead.
- The column editor's command bar is drawn only with commands, and a column's \`commands\` start with Remove.
- \`Notifications\` draws a \`NotificationMessageBar\`; call that from your slot to keep the default.
- \`manageViews.datasetControl\` takes the control's keys plus \`header\`, \`body\`, \`footer\`, \`ribbon\`, \`quickFind\` and \`pagination\`; \`grid\` takes the \`Grid\`'s.
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
                story: `Menu items and commands added through the parts, and slots only for the look: the view switcher gets *Copy a link to this view* and a tooltip, each column in *Edit columns* gets *Move to the top*, and the quick find's callout shows each column's logical name. Try: open each of them.`,
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
