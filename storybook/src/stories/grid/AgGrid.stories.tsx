import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { JumpToTheNextDealToCloseExample, RearrangeColumnsExample } from '../../grid/examples/agGridExamples'

const DESCRIPTION = `
The grid runs on <a href="https://www.ag-grid.com/" target="_blank" rel="noreferrer">AG Grid</a>. For what no hook covers, a module can set AG Grid's options, and your code can call AG Grid's api once the grid is ready; reach for them last, since the grid sets many options itself and what you change through AG Grid is not written back to the provider. Try it below: turn on *Rearrange columns* and drag a header.

{{canvas: Rearrange columns on request}}

## AG Grid's options

| Call | Its hooks run | For |
|---|---|---|
| \`grid.hooks.agGridInitialOptions.add(hook, priority?)\` | Once, when AG Grid is created | The options AG Grid reads only then, such as \`ensureDomOrder\`, \`suppressColumnVirtualisation\`, \`enableRtl\` or \`tooltipShowMode\` |
| \`grid.hooks.agGridOptions.add(hook, priority?)\` | When AG Grid is ready, after every load of the provider, and on every \`refreshAgGridOptions()\` | The options AG Grid takes at any time, such as \`headerHeight\`, \`suppressMovableColumns\` or \`tooltipShowDelay\` |
| \`grid.refreshAgGridOptions()\` | When you call it | Runs the option hooks again and passes AG Grid the options whose value changed |

Each hook receives \`{ options }\` and sets what it needs on it. Both \`add\` calls return a function that takes the hook off again, and their priorities work as every hook's do: see [**Lock closed deals**](?path=/docs/controls-grid-guide-features-lock-closed-deals--overview).

\`refreshAgGridOptions()\` compares each option with what AG Grid was last passed, by reference. A hook that builds a new object or function each time passes it again on every refresh, so create them once, outside the hook. It does not build the column definitions again: those follow the provider's loads, so call \`provider.refresh()\` for them.

## Options the grid sets

The grid starts from these, and its modules add their own. Change the others, and the feature behind them stops working.

| Option | Set by | A hook may change it |
|---|---|---|
| \`animateRows: false\`, \`enableGroupEdit: true\` | The grid, at creation | Yes |
| \`suppressDragLeaveHidesColumns\`, \`enterNavigatesVertically\`, \`enterNavigatesVerticallyAfterEdit\`, all \`true\` | The grid | Yes |
| \`onGridReady\`, \`onGridPreDestroyed\` | The grid, at creation | No: observe the \`gridApi\` service, see *AG Grid's api* below |
| \`rowModelType\`, \`getRowId\`, \`rowData\`, \`serverSideDatasource\`, \`treeData\`, \`getDataPath\`, \`isGroupOpenByDefault\`, \`isServerSideGroupOpenByDefault\` | The grid and the row model | No |
| \`columnDefs\`, \`rowHeight\`, \`getRowHeight\`, \`domLayout\`, \`rowClassRules\` | The grid | No: use the column definitions hook, the row height hook and row classes, and \`height\` |
| \`loadingOverlayComponent\`, \`noRowsOverlayComponent\`, \`suppressOverlays\`, \`activeOverlay\`, \`loadingCellRenderer\` | The grid | No: use \`components\`, see [**Loading and nothing to show**](?path=/docs/controls-grid-guide-make-it-yours-loading-and-nothing-to-show--overview) |
| \`readOnlyEdit\` | Editing | No |
| \`rowSelection\`, \`cellSelection\` | Row selection, cell selection | No |
| \`groupDisplayType\` | Grouping | No |
| \`isFullWidthRow\`, \`fullWidthCellRenderer\`, \`fullWidthCellRendererParams\`, \`pinnedBottomRowData\` | Totals | No |
| \`theme\` | The grid | No: use \`hooks.theme\`, see *The AG Grid theme* below |

## AG Grid's api

The \`gridApi\` service is AG Grid's \`GridApi<IRecord>\`, provided once AG Grid is ready and removed as it is destroyed:

| From | Reach it with |
|---|---|
| A module's \`onLoad\`, or \`onSetup\` and \`onLoad\` on the grid | \`grid.services.observe('gridApi', gridApi => { ... })\`. \`find('gridApi')\` is still \`undefined\` there, as AG Grid renders after them. |
| \`onReady\` on the grid | \`grid.services.get('gridApi')\`: AG Grid is there by then |
| Code outside the grid, such as a ribbon command | Keep the grid \`onReady\` passes you, and call \`grid.services.get('gridApi')\` |
| A component the grid draws | \`useGridService('gridApi')\`, which can be \`undefined\` on the first render |

Each row node's \`data\` is its \`IRecord\`, and its id is the record's id: \`gridApi.getRowNode(record.getRecordId())\`. What you change through the api stays in AG Grid. Widths you autosize are not written to the provider and fire no \`onColumnsChanged\`, and a value written with \`node.setDataValue\` never reaches the record, so use \`record.setValue\`. An option a hook also sets is overwritten the next time the hook's value changes, so set it through a hook rather than \`gridApi.setGridOption\`.

To read AG Grid as it goes, return a cleanup from the observer: it runs while AG Grid still works, as the order on [**From your code**](?path=/docs/controls-grid-guide-advanced-from-your-code--overview) shows.

{{story: Jump to the next deal to close}}

## The AG Grid theme

The grid builds AG Grid's theme from the app theme as it mounts, with no lines between columns, no frame round the grid, and a header as tall as a row:

| AG Grid parameter | From the app theme |
|---|---|
| \`accentColor\`, \`rangeSelectionBorderColor\` | \`palette.themePrimary\` |
| \`backgroundColor\`, \`foregroundColor\` | \`semanticColors.bodyBackground\`, \`bodyText\` |
| \`rowBorder\`, \`headerRowBorder\` | \`semanticColors.bodyDivider\` |
| \`rowHoverColor\` | \`bodyText\` at 5% |
| \`selectedRowBackgroundColor\`, \`rangeSelectionBackgroundColor\` | \`themePrimary\` at 20% and 15% |
| \`fontFamily\` | \`fonts.medium\` |
| \`borderRadius\`, \`popupShadow\` | \`effects.roundedCorner2\`, \`elevation16\` |

The \`gridTheme\` service changes it as the grid mounts:

| Hook | Receives | Does |
|---|---|---|
| \`hooks.theme.add(hook, priority?)\` | \`result: { theme }\` and \`fluentTheme\` | Replace \`result.theme\`, usually with \`withParams\`, which takes any of <a href="https://www.ag-grid.com/react-data-grid/theming-parameters/" target="_blank" rel="noreferrer">AG Grid's theme parameters</a> |
| \`hooks.styles.add(hook, priority?)\` | \`result: { styles }\` and \`fluentTheme\` | Push Fluent \`IStyle\` rules for the grid's root element, for what no parameter covers |

[**Colours and density**](?path=/docs/controls-grid-guide-make-it-yours-colours-and-density--overview) draws lines between the columns this way.

## AG Grid modules

Every grid registers the AG Grid modules it needs itself, and those its modules list. \`agGridModules\` lists the ones a module of yours needs, as the example under *AG Grid's api* lists \`HighlightChangesModule\`.

Import them from the same \`ag-grid-community\` and \`ag-grid-enterprise\` the grid uses, so the versions match. AG Grid registers modules for the whole page, so once one grid has registered a module every grid has it; an api call whose module no grid registered only logs an AG Grid error. Enterprise modules need a licence: see [**Select and copy**](?path=/docs/controls-grid-guide-features-select-and-copy--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Hooks', iconName: 'Plug', href: '?path=/docs/controls-grid-guide-advanced-hooks--overview', text: 'Change what the grid draws and decides without reaching AG Grid.' },
    { title: 'Write a module', iconName: 'Puzzle', href: '?path=/docs/controls-grid-guide-advanced-write-a-module--overview', text: 'Package AG Grid options and modules in a module of your own.' },
    { title: 'Reference', iconName: 'Table', href: '?path=/docs/controls-grid-reference--overview', text: 'Every prop, event, module, hook, service and slot of the Grid.' },
]

const meta = {
    title: 'Controls/Grid/AG Grid',
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

export const RearrangeColumnsOnRequest: Story = {
    name: 'Rearrange columns on request',
    render: () => renderStory(<RearrangeColumnsExample />),
}

export const JumpToTheNextDealToClose: Story = {
    name: 'Jump to the next deal to close',
    render: () => renderStory(<JumpToTheNextDealToCloseExample />),
    parameters: {
        docs: {
            description: {
                story: `A ribbon command calls \`gridApi\` to scroll to the next open deal to close and flash it. Try: press **Jump to the next deal to close**.`,
            },
        },
    },
}
