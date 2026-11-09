import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { YourOwnPiecesExample } from '../../dataset-control/examples/appearanceExamples'
import { FluentV9Example } from '../../dataset-control/examples/fluentV9Examples'
import { SelectedValueExample } from '../../dataset-control/examples/yourOwnPartsExamples'
import { CustomUiViewsExample } from '../../dataset-control/examples/viewsExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
The parts are drawn in Fluent UI, and you can change what they draw at two levels: replace a piece of a part, such as its button or its search field, or add a part of your own, up to a whole UI in place of the grid. The control underneath stays the same, so loading, views and state keep working. Try it below: click the quick find field to see each column's logical name.

{{canvas: Replace pieces of the parts}}

## Pieces and slots

The control and every part take a \`components\` map of pieces and slots: see [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview). Every one of them is listed under *Reference*. Menu items and commands are added through the part, with \`hooks.items\`, \`hooks.commands\` or \`hooks.columnCommands\`: see [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview).

## Wrap the control

\`className\` adds a class to the control's box. To wrap the parts in a context provider of yours, put it inside the control around them; it renders once the control has loaded, so it can call \`useDatasetControl()\`.

## Use a design system

Every slot gets the props its default would, so a design system can stand in for the defaults.

{{story: Everything in Fluent UI v9}}

The example draws in v9 the records, in its \`DataGrid\`, the menus, toolbars, search field and popover, the column editor's drawer, the *Manage views* drawer, the notifications, the empty state and the load error. It leaves the loading placeholder and the column editor's pickers and column list as they are. v9 components need a \`FluentProvider\` around them, so the control's container is one, light or dark to match the Fluent v8 theme.

## Add a part of your own

A part of your own is any component you put inside the control: a total in the footer, a filter in the header, or a gallery in place of the grid. Inside the control, it reads the provider with \`useDataProviderEvents\`, the control with \`useDatasetControl\`, and keeps its state per view with \`useControlStateStore\`.

{{story: Total the selected deals}}

- \`useProvideDatasetControlPart(key, create)\` provides the part for \`control.parts\`; declare its key first, as the example's \`types.ts\` does.
- \`DatasetControl.Ui\`, also exported as \`DatasetControlUi\`, holds the regions and most parts as plain UI with no control behind them, for a part that looks like a built-in one.
- The ribbon and the notifications are not in \`DatasetControl.Ui\`: use the exported \`Ribbon\` and \`NotificationMessageBar\`.

## Your own collection view

The parts work on the provider, not on the grid, so anything that shows records can go in \`Body\`: a list, cards, a calendar or a chart. To draw views differently, let each view say which UI it uses in its \`data\` (see [**Views**](?path=/docs/controls-datasetcontrol-views--overview)), and pick it in your body component, as \`ProductsBody\` in the example does.

{{story: A different UI per view}}

Your view reads the records, columns and selection from the provider (see [**Data providers**](?path=/docs/concepts-data-providers--overview)) and draws again on the events it passes to \`useDataProviderEvents\`, such as \`onNewDataLoaded\`, \`onRecordsSelected\` and \`onRecordColumnValueChanged\`. It keeps what it should remember, such as the gallery's scroll, with \`useControlStateStore\`, and gets an empty state from \`DatasetControl.EmptyState\`: see [**Notifications and empty state**](?path=/docs/controls-datasetcontrol-parts-notifications-and-empty-state--overview). Every view switch mounts the body anew, so it reads the view once.

*Edit columns* changes the provider's columns, so offer it only when your view shows them.

## Reference

### Every slot

*Top level* is the part's own slots; a blank default is not exported.

| Part | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`DatasetControl\` | Top level | \`onRenderContainer\` | \`DatasetControlUiContainerComponents\` | The control's box |
| \`DatasetControl\` | \`skeleton\` | \`onRenderSkeleton\` | \`DatasetControlUiSkeletonComponents\` | The placeholder while the first page loads |
| \`DatasetControl\` | \`errorMessage\` | \`onRenderMessageBar\`, \`onRenderTooltip\`, \`onRenderTitle\`, \`onRenderCommandBar\` | \`ErrorMessageBarComponents\` | A failed load |
| \`DatasetControl\` | \`loadingOverlay\` | \`onRenderOverlay\`, \`onRenderSpinner\`, \`onRenderText\` | \`LoadingOverlayComponents\` | The overlay \`loadingOverlay.show()\` puts over the control |
| \`Header\` | Top level | \`onRenderContainer\` | \`DatasetControlUiHeaderComponents\` | The header's box, a \`WrapCompactProvider\` |
| \`Header.Start\`, \`Header.End\`, \`Body\`, \`Footer\`, \`Footer.Start\`, \`Footer.End\` | Top level | \`onRenderContainer\` | \`DatasetControlUiHeaderStartComponents\` and the like | The region's box |
| \`ViewSwitcher\` | Top level | \`onRenderButton\`, with the views as \`menuProps.items\` | \`DatasetControlUiViewSwitcherComponents\` | The button and its menu |
| \`Ribbon\` | Top level | \`onRenderCommandBar\`, with the commands as \`items\` | \`RibbonUiCommandBarComponents\` | The command bar |
| \`Ribbon\` | \`shimmer\` | \`onRenderShimmer\` | \`RibbonUiShimmerComponents\` | The shimmer before the first load |
| \`Ribbon\` | \`errorMessage\` | As the control's \`errorMessage\` | \`ErrorMessageBarComponents\` | A failed first load |
| \`QuickFind\` | Top level | \`onRenderContainer\`, \`onRenderTextField\` | \`DatasetControlUiQuickFindComponents\` | The box and the search field |
| \`QuickFind\` | \`compact\` | \`onRenderButton\` | \`DatasetControlUiQuickFindCompactButtonComponents\` | The search button in a compact header |
| \`QuickFind\` | \`callout\` | \`onRenderCallout\`, \`onRenderLikeWarning\`, \`onRenderDescription\`, \`onRenderColumns\`, \`onRenderColumn\` | \`DatasetControlUiQuickFindCalloutComponents\` | The callout listing the columns searched |
| \`EditColumns\` | \`button\` | \`onRenderButton\`, \`onRenderTooltip\` | \`DatasetControlUiEditColumnsButtonComponents\` | The button that opens the editor |
| \`EditColumns\` | \`panel\` | \`onRenderPanel\`, \`onRenderFooter\`, \`onRenderCommandBar\` | \`DatasetControlUiEditColumnsPanelComponents\` | The editor's panel, its **Save** and **Cancel**, and the commands above the pickers |
| \`EditColumns\` | \`scopeSelector\`, \`columnSelector\` | \`onRenderSelector\`, \`onRenderOption\` | \`DatasetControlUiEditColumnsSelectorComponents\` | The *Column source* and column pickers |
| \`EditColumns\` | \`columnList\` | \`onRenderColumn\` | \`DatasetControlUiEditColumnsColumnListComponents\` | Each chosen column, with its commands |
| \`EditColumns\` | \`errorMessage\` | As the control's \`errorMessage\` | \`ErrorMessageBarComponents\` | A failed load of the columns |
| \`Notifications\` | Top level | \`onRenderNotifications\` | | The message bar |
| \`EmptyState\` | Top level | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderText\` | \`DatasetControlUiEmptyStateComponents\` | The empty state |
| \`Pagination\` | Top level | \`onRenderCommandBar\`, with the buttons as \`items\` | \`DatasetControlUiPaginationComponents\` | The page buttons |
| \`PageSizeSwitcher\` | Top level | \`onRenderButton\`, with the sizes as \`menuProps.items\` | \`DatasetControlUiPageSizeSwitcherComponents\` | The range and its menu |
| \`UserQueries\` | \`manageViewsPanel\` | \`onRenderPanel\`, \`onRenderCloseButton\` | \`UserQueriesUiManageViewsPanelComponents\` | The *Manage views* panel |
| \`UserQueries\` | \`manageViews.datasetControl\` | The control's, plus the keys \`header\`, \`body\`, \`footer\`, \`ribbon\`, \`quickFind\` and \`pagination\` | | The control inside *Manage views* |
| \`UserQueries\` | \`manageViews.grid\` | The \`Grid\`'s | | The grid inside *Manage views* |

- The column editor's command bar is drawn only with commands, and a column's \`commands\` start with Remove.
- \`Notifications\` draws a \`NotificationMessageBar\`; call that from your slot to keep the default.

### Hooks for your own parts

| Hook | Returns |
|---|---|
| \`useDataProviderEvents(events)\` | The provider, drawing the component again on each of the provider's \`events\`. |
| \`useDataProvider()\` | The provider, without drawing again. |
| \`useDatasetControl()\` | The control, to switch views or reach the built-in parts. |
| \`useDatasetControlModule(name)\` | A module the control loaded, such as \`'userQueries'\`; throws when it is not loaded. |
| \`useControlStateStore(stateKey)\` | Where the component keeps what it should remember, per view: see [**State**](?path=/docs/controls-datasetcontrol-state--overview). |
| \`useDatasetControlRegion()\` | \`'start'\` or \`'end'\`, the side of the header or footer the component is in; \`undefined\` outside both. |
| \`useDatasetControlHeader()\` | Inside the header, \`showOnly()\` hides everything in it but the calling part, and \`showAll()\` brings the rest back; \`undefined\` outside the header. |
| \`useCompact()\` | Whether the header is compact: see [**Layout**](?path=/docs/controls-datasetcontrol-layout--overview). |
| \`useProvideDatasetControlPart(key, create)\` | The part \`create\` makes, once; it is provided under \`key\` for \`control.parts\` while the component is mounted. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Talking to the control', iconName: 'Plug', href: '?path=/docs/controls-datasetcontrol-talking-to-the-control--overview', text: 'Add menu items and commands through the parts, and reach them from your code.' },
    { title: 'Layout', iconName: 'ViewDashboard', href: '?path=/docs/controls-datasetcontrol-layout--overview', text: 'Place your own parts in the regions, and shrink them with a compact header.' },
    { title: 'Fluent UI', iconName: 'Color', href: '?path=/docs/concepts-fluent-ui--overview', text: 'Which Fluent UI and Base Controls components to build your own parts from.' },
]

const meta = {
    title: 'Controls/DatasetControl/Your own UI',
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

export const YourOwnPieces: Story = {
    name: 'Replace pieces of the parts',
    render: () => renderStory(<YourOwnPiecesExample />),
}

export const EverythingInFluentV9: Story = {
    name: 'Everything in Fluent UI v9',
    render: () => renderStory(<FluentV9Example />),
    parameters: {
        docs: {
            description: {
                story: `Every part drawn in Fluent UI v9, through the slots in the example's \`v9.tsx\`. Try: search for *zzz* to see the empty state.`,
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
                story: `Two views of the products, one drawn as the grid and one as a gallery of photo cards. Try: switch to *Seating* and select a card.`,
            },
        },
    },
}
