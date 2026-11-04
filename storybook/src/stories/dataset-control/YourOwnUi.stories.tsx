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

The control and every part take a \`components\` map:

- A *slot* is a function named \`onRender…\`: it gets the props its default draws with and returns an element, or \`null\`.
- A part's own slots sit directly in the map, such as the view switcher's \`onRenderButton\`.
- A *piece* is a key that names something inside the part, such as the quick find's \`callout\`, and holds that piece's slots.
- A slot you leave out keeps its default, and a piece merges over its default slot by slot.
- Every part's defaults are exported, such as \`ViewSwitcherUiComponents\`, so a slot can draw the default.

| To | Write |
|---|---|
| Change one prop of the default | \`props => QuickFindUiComponents.onRenderTextField({ ...props, disabled: true })\` |
| Wrap the default | \`props => <TooltipHost content='Views'>{ViewSwitcherUiComponents.onRenderButton(props)}</TooltipHost>\` |
| Replace it | \`props => <SearchBox {...props} />\` |
| Remove it | \`() => null\` |

- Spread the props you get: they carry the class names, handlers and refs that make the piece work.
- A slot is called during render. To use hooks there, return a component of your own: \`props => <MyViewButton {...props} />\`.
- \`TooltipHost\` comes from \`@talxis/base-controls\`.
- Menu items and commands are added through the part, with \`registerItems\`, \`registerCommands\` or \`registerColumnCommands\`, not a slot: see [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview).

## Wrap the control

- \`className\` adds a class to the control's box.
- \`scope\` wraps everything inside each mount, such as in a context provider of yours. It renders inside the control, so it can call \`useDatasetControl()\`. Pass the same component on every render.

## Use a design system

Every slot gets the props its default would, so a design system can stand in for the defaults.

{{story: Everything in Fluent UI v9}}

- Drawn in v9: the records in its \`DataGrid\`, the menus, toolbars, search field and popover, the column editor's drawer, the *Manage views* drawer, the notifications, the empty state and the load error.
- Left as they are: the loading placeholder, and the column editor's pickers and column list.
- v9 components need a \`FluentProvider\` around them, so the control's container is one, light or dark to match the Fluent v8 theme.

## Add a part of your own

A part of your own is any component you put inside the control: a total in the footer, a filter in the header, or a gallery in place of the grid. Inside the control, it reads the provider with \`useDataProviderEvents\`, the control with \`useDatasetControl\`, and keeps its state per view with \`useControlStateStore\`.

{{story: Total the selected deals}}

- \`useRegisterDatasetControlPart(key, onCreate)\` registers the part for \`control.parts\`; declare its key first, as the example's \`types.ts\` does.
- \`DatasetControl.Ui\`, also exported as \`DatasetControlUi\`, holds the regions and most parts as plain UI with no control behind them, for a part that looks like a built-in one.
- The ribbon and the notifications are not in \`DatasetControl.Ui\`: use the exported \`Ribbon\` and \`NotificationMessageBar\`.

## Your own collection view

The parts work on the provider, not on the grid, so anything that shows records can go in \`Body\`: a list, cards, a calendar or a chart. To draw views differently, let each view say which UI it uses in its \`data\` (see [**Views**](?path=/docs/controls-datasetcontrol-views--overview)), and pick it in your body component, as the example's \`ProductsBody.tsx\` does.

{{story: A different UI per view}}

- Read the records, columns and selection from the provider: see [**Data providers**](?path=/docs/concepts-data-providers--overview).
- Pass the events your view shows, such as \`onNewDataLoaded\`, \`onRecordsSelected\` and \`onRecordColumnValueChanged\`, to \`useDataProviderEvents\`.
- Keep what the view should remember, such as its scroll, with \`useControlStateStore\`.
- Wrap it in \`DatasetControl.EmptyState\` for an empty state: see [**Notifications and empty state**](?path=/docs/controls-datasetcontrol-parts-notifications-and-empty-state--overview).
- *Edit columns* changes the provider's columns, so offer it only when your view shows them.
- Every view switch mounts the body anew, so it reads the view once.

## Reference

### Every slot

A piece of – is the part's own slots; a blank *Defaults* is not exported.

| Part | Piece (\`components\` key) | Slots | Defaults |
|---|---|---|---|
| \`DatasetControl\` | – | \`onRenderContainer\` | \`ContainerUiComponents\` |
| \`DatasetControl\` | \`skeleton\` | \`onRenderSkeleton\` | \`SkeletonUiComponents\` |
| \`DatasetControl\` | \`skeleton.loadingBoundary\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderText\` | \`LoadingBoundaryComponents\` |
| \`DatasetControl\` | \`errorMessage\` | \`onRenderMessageBar\`, \`onRenderTooltip\`, \`onRenderTitle\`, \`onRenderCommandBar\` | \`ErrorMessageBarComponents\` |
| \`DatasetControl\` | \`loadingOverlay\` | \`onRenderOverlay\`, \`onRenderSpinner\`, \`onRenderText\` | \`LoadingOverlayComponents\` |
| \`Header\` | – | \`onRenderContainer\` | \`HeaderUiComponents\` |
| \`Header.Start\`, \`Header.End\`, \`Body\`, \`Footer\`, \`Footer.Start\`, \`Footer.End\` | – | \`onRenderContainer\` | \`HeaderStartUiComponents\` and the like |
| \`ViewSwitcher\` | – | \`onRenderButton\` | \`ViewSwitcherUiComponents\` |
| \`Ribbon\` | – | \`onRenderCommandBar\` | \`RibbonUiComponents\` |
| \`Ribbon\` | \`loadingBoundary\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderText\` | \`LoadingBoundaryComponents\` |
| \`Ribbon\` | \`errorMessage\` | As the control's \`errorMessage\` | \`ErrorMessageBarComponents\` |
| \`QuickFind\` | – | \`onRenderContainer\`, \`onRenderTextField\` | \`QuickFindUiComponents\` |
| \`QuickFind\` | \`compact\` | \`onRenderButton\` | \`QuickFindCompactButtonComponents\` |
| \`QuickFind\` | \`callout\` | \`onRenderCallout\`, \`onRenderLikeWarning\`, \`onRenderDescription\`, \`onRenderColumns\`, \`onRenderColumn\` | \`QuickFindCalloutComponents\` |
| \`EditColumns\` | \`button\` | \`onRenderButton\`, \`onRenderTooltip\` | \`EditColumnsButtonUiComponents\` |
| \`EditColumns\` | \`panel\` | \`onRenderPanel\`, \`onRenderFooter\`, \`onRenderCommandBar\` | \`EditColumnsPanelUiComponents\` |
| \`EditColumns\` | \`scopeSelector\`, \`columnSelector\` | \`onRenderSelector\`, \`onRenderOption\` | \`EditColumnsSelectorUiComponents\` |
| \`EditColumns\` | \`columnList\` | \`onRenderColumn\` | \`EditColumnsColumnListUiComponents\` |
| \`EditColumns\` | \`errorMessage\` | As the control's \`errorMessage\` | \`ErrorMessageBarComponents\` |
| \`Notifications\` | – | \`onRenderNotifications\` | |
| \`EmptyState\` | – | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderText\` | \`EmptyStateUiComponents\` |
| \`Pagination\` | – | \`onRenderCommandBar\` | \`PaginationUiComponents\` |
| \`PageSizeSwitcher\` | – | \`onRenderButton\` | \`PageSizeSwitcherUiComponents\` |
| \`UserQueries\` | \`manageViewsPanel\` | \`onRenderPanel\`, \`onRenderCloseButton\` | \`ManageViewsPanelUiComponents\` |
| \`UserQueries\` | \`manageViews.datasetControl\` | The control's, plus the pieces \`header\`, \`body\`, \`footer\`, \`ribbon\`, \`quickFind\` and \`pagination\` | |
| \`UserQueries\` | \`manageViews.grid\` | The \`Grid\`'s | |

- The view switcher and the page size switcher get their menu as \`menuProps.items\`; the ribbon and the paging get their commands as \`items\`.
- \`skeleton.loadingBoundary.onRenderContainer\` is the placeholder itself, so \`<div {...props} />\` there shows a spinner instead.
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
| \`useRegisterDatasetControlPart(key, onCreate)\` | Nothing; creates an object once and registers it under \`key\` for \`control.parts\`, while the component is mounted. |

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
                story: `Four views of the products, drawn as the grid, Fluent UI v9's \`DataGrid\` or a gallery. Try: switch to *Seating*.`,
            },
        },
    },
}
