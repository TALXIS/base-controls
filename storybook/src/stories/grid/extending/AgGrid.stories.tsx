import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { JumpToNewestTicketExample, RearrangeColumnsExample } from '../../../grid/examples/agGridExamples'

const DESCRIPTION = `
The grid runs on <a href="https://www.ag-grid.com/" target="_blank" rel="noreferrer">AG Grid</a>. For what no hook covers, a module can set AG Grid's options, and your code can call AG Grid's api once the grid is ready; reach for them last, since the grid sets many options itself and what you change through AG Grid is not written back to the provider. Try it below: turn on *Rearrange columns* and drag a header.

{{canvas: Rearrange columns on request}}

## AG Grid's options

| Call | Its hooks run | For |
|---|---|---|
| \`grid.registerAgGridInitialOptions(hook, priority?)\` | Once, when AG Grid is created | The options AG Grid reads only then, such as \`ensureDomOrder\`, \`suppressColumnVirtualisation\`, \`enableRtl\` or \`tooltipShowMode\` |
| \`grid.registerAgGridOptions(hook, priority?)\` | When AG Grid is ready, after every load of the provider, and on every \`refreshAgGridOptions()\` | The options AG Grid takes at any time, such as \`headerHeight\`, \`suppressMovableColumns\` or \`tooltipShowDelay\` |
| \`grid.refreshAgGridOptions()\` | When you call it | Runs the option hooks again and passes AG Grid the options whose value changed |

Each hook receives \`{ options }\` and sets what it needs on it. Both register calls return a function that takes the hook off again, and their priorities work as every hook's do: see *How hooks run* on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview).

\`refreshAgGridOptions()\` compares each option with what AG Grid was last passed, by reference. A hook that builds a new object or function each time passes it again on every refresh, so create them once, outside the hook. It does not build the column definitions again: those follow the provider's loads, so call \`provider.refresh()\` for them.

## Options the grid sets

The grid starts from these, and its modules add their own. Change the others, and the feature behind them stops working.

| Option | Set by | A hook may change it |
|---|---|---|
| \`animateRows: false\`, \`enableGroupEdit: true\` | The grid, at creation | Yes |
| \`suppressDragLeaveHidesColumns\`, \`enterNavigatesVertically\`, \`enterNavigatesVerticallyAfterEdit\`, all \`true\` | The grid | Yes |
| \`onGridReady\`, \`onGridPreDestroyed\` | The grid, at creation | No: use \`onReady\` and \`onDestroyed\` |
| \`rowModelType\`, \`getRowId\`, \`rowData\`, \`serverSideDatasource\`, \`treeData\`, \`getDataPath\` | The grid and the row model | No |
| \`columnDefs\`, \`rowHeight\`, \`getRowHeight\`, \`domLayout\`, \`rowClassRules\` | The grid | No: use the column definitions hooks, \`colDefs\`, the row height and row class hooks, and \`height\` |
| \`loadingOverlayComponent\`, \`noRowsOverlayComponent\`, \`suppressOverlays\`, \`activeOverlay\`, \`loadingCellRenderer\` | The grid | No: use \`components\`, see [**Overlays and rows**](?path=/docs/controls-grid-appearance-overlays-and-rows--overview) |
| \`readOnlyEdit\` | Editing | No |
| \`rowSelection\`, \`cellSelection\` | Row selection, cell selection | No |
| \`groupDisplayType\`, \`isGroupOpenByDefault\`, \`isServerSideGroupOpenByDefault\`, \`isFullWidthRow\`, \`fullWidthCellRenderer\`, \`pinnedBottomRowData\` | Grouping, totals | No |
| \`theme\` | The grid | No: use \`registerTheme\`, see *The AG Grid theme* below |

## AG Grid's api

The \`gridApi\` service is AG Grid's \`GridApi<IRecord>\`, registered once AG Grid is ready and unregistered as it is destroyed:

| From | Reach it with |
|---|---|
| A module's \`onLoad\` | \`grid.services.observe('gridApi', gridApi => { ... })\`. \`find('gridApi')\` is still \`undefined\` there. |
| Code outside the grid, such as a ribbon command | Keep the grid \`onReady\` passes you, and call \`grid.services.find('gridApi')\` |
| A component the grid draws | \`useGridService('gridApi')\`, which can be \`undefined\` on the first render |

Each row node's \`data\` is its \`IRecord\`, and its id is the record's id: \`gridApi.getRowNode(record.getRecordId())\`. What you change through the api stays in AG Grid. Widths you autosize are not written to the provider and fire no \`onColumnsChanged\`, and a value written with \`node.setDataValue\` never reaches the record, so use \`record.setValue\`. An option a hook also sets is replaced by the hook's value, so set it through a hook rather than \`gridApi.setGridOption\`.

To read AG Grid as it goes, return a cleanup from the observer: it runs while AG Grid still works (see *From mount to unmount* on [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview)).

{{story: Jump to the newest ticket}}

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

The \`gridTheme\` service changes it, once, as the grid mounts:

| Hook | Receives | Does |
|---|---|---|
| \`registerTheme(hook, priority?)\` | \`result: { theme }\` and \`fluentTheme\` | Replace \`result.theme\`, usually with \`withParams\`, which takes any of <a href="https://www.ag-grid.com/react-data-grid/theming-parameters/" target="_blank" rel="noreferrer">AG Grid's theme parameters</a> |
| \`registerStyles(hook, priority?)\` | \`result: { styles }\` and \`fluentTheme\` | Push Fluent \`IStyle\` rules for the grid's root element, for what no parameter covers |

An example is under *Change the AG Grid theme* on [**Appearance**](?path=/docs/controls-grid-appearance--overview).

## AG Grid modules

Every grid registers the AG Grid modules it needs itself, and those its modules list. \`agGridModules\` lists the ones a module of yours needs, as the example under *AG Grid's api* lists \`HighlightChangesModule\`.

Import them from the same \`ag-grid-community\` and \`ag-grid-enterprise\` the grid uses, so the versions match. AG Grid registers modules for the whole page, so once one grid has registered a module every grid has it; an api call whose module no grid registered only logs an AG Grid error. Enterprise modules need a licence: see *Enterprise features and the licence* on [**Modules**](?path=/docs/controls-grid-modules--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Hooks', iconName: 'Plug', href: '?path=/docs/controls-grid-extending-hooks--overview', text: 'Change what the grid draws and decides without reaching AG Grid.' },
    { title: 'Write a module', iconName: 'Puzzle', href: '?path=/docs/controls-grid-extending-write-a-module--overview', text: 'Package AG Grid options and modules in a module of your own.' },
    { title: 'Appearance', iconName: 'Color', href: '?path=/docs/controls-grid-appearance--overview', text: 'Change the AG Grid theme, and colour cells and headers.' },
]

const meta = {
    title: 'Controls/Grid/Extending/AG Grid',
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

export const JumpToTheNewestTicket: Story = {
    name: 'Jump to the newest ticket',
    render: () => renderStory(<JumpToNewestTicketExample />),
    parameters: {
        docs: {
            description: {
                story: `Ribbon commands call \`gridApi\` to fit the columns, and to scroll to the newest ticket and flash it. Try: press *Jump to the newest ticket*.`,
            },
        },
    },
}
