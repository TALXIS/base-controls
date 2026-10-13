import type { Meta, StoryObj } from '@storybook/react'
import { gridDocsPage } from '../../../grid/gridDocsPage'

const DESCRIPTION = `The reference for every part: its props, and what \`control.parts\` returns for it. Every part takes \`labels\`, listed on [**Localization**](?path=/docs/datasetcontrol-customization-localization--overview), and \`components\`, listed on [**Appearance**](?path=/docs/datasetcontrol-customization-appearance--overview).

## Header, Body and Footer

\`Header\`, \`Header.Start\`, \`Header.End\`, \`Body\`, \`Footer\`, \`Footer.Start\` and \`Footer.End\` take the same props. See [**Layout**](?path=/docs/datasetcontrol-get-started-layout--overview).

| Prop | Type | Default | Description |
|---|---|---|---|
| \`children\` | \`ReactNode\` | None | The parts, or in \`Body\` what shows the records. |
| \`className\` | \`string\` | None | Added to the region's box. |
| \`components\` | \`{ onRenderContainer }\` | Defaults | Replaces the region's box. |

## ViewSwitcher

See [**Views**](?path=/docs/datasetcontrol-parts-views--overview).

| Prop | Type | Default | Description |
|---|---|---|---|
| \`onLoad\` | \`() => Promise<IDatasetControlView[]>\` | Required | Returns the views to list. Called at mount, with every view loaded, and on \`reload()\`. |
| \`onReady\` | \`(viewSwitcher: IDatasetControlViewSwitcher) => void\` | None | Hands you the switcher once it exists, before its first load. |
| \`labels\` | \`Partial<IViewSwitcherLabels>\` | \`VIEW_SWITCHER_LABELS\` | The switcher's strings. |
| \`components\` | \`IViewSwitcherComponents\` | Defaults | Replacements for the button, the shimmer and the error. |

\`control.parts.get('viewSwitcher')\` returns \`IDatasetControlViewSwitcher\`:

| Member | Description |
|---|---|
| \`getViews()\` | The views \`onLoad\` returned; \`undefined\` until the first load finishes. |
| \`getCurrentView()\` | The view shown; \`undefined\` when it is not among the views. |
| \`select(viewId)\` | Loads the view, as picking it does. |
| \`reload()\` | Calls \`onLoad\` again, such as after the user saved a new view. |
| \`getError()\` | What the last \`onLoad\` threw, until the next one starts. |
| \`events\` | \`onBeforeLoad\` and \`onLoaded\`, around every \`onLoad\`. |

## Ribbon

See [**Ribbon**](?path=/docs/datasetcontrol-parts-ribbon--overview). The ribbon is not in \`control.parts\`: \`onReady\` hands it to you.

| Prop | Type | Default | Description |
|---|---|---|---|
| \`onLoad\` | \`() => Promise<IRibbonCommand[]>\` | Required | Returns the commands. Called at mount, whenever the selection changes, and on \`reload()\`. |
| \`disabled\` | \`boolean\` | \`false\` | Disables every command. |
| \`align\` | \`'start' \\| 'end'\` | Its region's side | Which side the commands are drawn against. |
| \`className\` | \`string\` | None | Added to the ribbon's box. |
| \`onReady\` | \`(ribbon: IRibbonRuntime) => void\` | None | Hands you the ribbon once it exists, before its first load. |
| \`components\` | \`IRibbonComponents\` | Defaults | Replacements for the command bar, the shimmer and the error. |

\`IRibbonRuntime\`:

| Member | Description |
|---|---|
| \`getCommands()\` | The commands \`onLoad\` returned; \`undefined\` until the first load finishes. |
| \`isRunning(commandId)\` | Whether the command's \`onExecute\` is running. |
| \`reload()\` | Calls \`onLoad\` again, such as after a command changed which ones apply. |
| \`getError()\` | What the last \`onLoad\` threw, until the next one starts. |
| \`events\` | \`onBeforeLoad\`, \`onLoaded\`, \`onBeforeExecute(command)\` and \`onAfterExecute(command)\`. |

## QuickFind

See [**Quick find**](?path=/docs/datasetcontrol-parts-quick-find--overview).

| Prop | Type | Default | Description |
|---|---|---|---|
| \`labels\` | \`Partial<IQuickFindLabels>\` | \`QUICK_FIND_LABELS\` | The placeholder and the callout's strings. |
| \`components\` | \`Partial<IQuickFindUiComponents>\` | Defaults | Replacements for the field and the callout. |

\`control.parts.get('quickFind')\` returns \`IDatasetControlQuickFind\`:

| Member | Description |
|---|---|
| \`getQuery()\` | The query in the field, searched or not. |
| \`setQuery(query)\` | Puts the query in the field, without searching. |
| \`search()\` | Searches for the query. Asks first when there are unsaved changes. |
| \`clear()\` | Empties the field and searches again. |
| \`getColumns()\` | The columns a search matches on. |
| \`isLikeQuery()\` | Whether the query starts with \`*\`. |
| \`events\` | \`onQueryChanged\`, whenever the query is edited. |

## EditColumns

See [**Edit columns**](?path=/docs/datasetcontrol-parts-edit-columns--overview).

| Prop | Type | Default | Description |
|---|---|---|---|
| \`onLoadColumns\` | \`(scope?: IAvailableRelatedColumn) => Promise<IColumn[]>\` | Required | The columns the user can add: the records' own when \`scope\` is \`undefined\`, else the related entity's. |
| \`onLoadScopes\` | \`() => Promise<IAvailableRelatedColumn[]>\` | None | The related entities columns can come from. Shows the scope selector. |
| \`labels\` | \`Partial<IEditColumnsLabels>\` | \`EDIT_COLUMNS_LABELS\` | The editor's strings. Read once, at mount. |
| \`components\` | \`IEditColumnsComponents\` | Defaults | Replacements for the button, the panel, the pickers, the column list and the error. |

\`control.parts.get('editColumns')\` returns \`IDatasetControlEditColumns\`:

| Member | Description |
|---|---|
| \`open()\` | Opens the editor over the provider's columns. |
| \`close()\` | Closes the editor and drops what was not saved. |
| \`save()\` | Sets the columns on the provider, which loads again, and closes the editor. |
| \`isOpen()\` | Whether the editor is open. |
| \`events\` | \`onOpenChanged\`, whenever the editor opens or closes. |

## Pagination

See [**Paging**](?path=/docs/datasetcontrol-parts-paging--overview).

| Prop | Type | Default | Description |
|---|---|---|---|
| \`labels\` | \`Partial<IPaginationLabels>\` | \`PAGINATION_LABELS\` | The buttons' tooltips and the current page's text. |
| \`components\` | \`Partial<IPaginationUiComponents>\` | Defaults | Replaces the command bar. |

\`control.parts.get('pagination')\` returns \`IDatasetControlPagination\`:

| Member | Description |
|---|---|
| \`getPageNumber()\` | The current page, counted from 1. |
| \`canMovePrevious()\`, \`canMoveNext()\` | Whether there is a page to move to, and nothing is loading. |
| \`moveFirst()\`, \`movePrevious()\`, \`moveNext()\` | Loads that page. Asks first when there are unsaved changes. |
| \`events\` | \`onPagingChanged\`, whenever the page changes or starts loading. |

## PageSizeSwitcher

See [**Paging**](?path=/docs/datasetcontrol-parts-paging--overview).

| Prop | Type | Default | Description |
|---|---|---|---|
| \`pageSizes\` | \`number[]\` | \`DEFAULT_PAGE_SIZES\`: 25, 50, 75, 100, 250 | The sizes the menu offers. Read once, at mount. |
| \`labels\` | \`Partial<IPageSizeSwitcherLabels>\` | \`PAGE_SIZE_SWITCHER_LABELS\` | The record range and the tooltip. |
| \`components\` | \`Partial<IPageSizeSwitcherUiComponents>\` | Defaults | Replaces the button. |

\`control.parts.get('pageSizeSwitcher')\` returns \`IDatasetControlPageSizeSwitcher\`:

| Member | Description |
|---|---|
| \`getPageSize()\` | How many records a page holds. |
| \`getPageSizes()\` | The sizes the menu offers. |
| \`setPageSize(size)\` | Loads the records in pages of that size. Asks first when there are unsaved changes. |
| \`getRecordRange()\` | Which records of how many the page shows, as \`IDatasetControlRecordRange\`. |
| \`isLoading()\` | Whether the provider is loading. |
| \`events\` | \`onPageSizeChanged\`, whenever the page size or the records on the page change. |

## Notifications

See [**Notifications and empty records**](?path=/docs/datasetcontrol-parts-notifications-and-empty-records--overview).

| Prop | Type | Default | Description |
|---|---|---|---|
| \`messages\` | \`INotificationMessage[]\` | None | Messages of your own, shown next to the provider's error. |
| \`labels\` | \`Partial<IDatasetControlNotificationsLabels>\` | \`DATASET_CONTROL_NOTIFICATIONS_LABELS\` | The summary shown when there are several messages. |
| \`components\` | \`Partial<IDatasetControlNotificationsComponents>\` | Defaults | Replaces the notification bar. |

\`control.parts.get('notifications')\` returns \`IDatasetControlNotifications\`:

| Member | Description |
|---|---|
| \`getMessages()\` | The provider's load error, while there is one. |
| \`events\` | \`onNotificationsChanged\`, whenever the provider fails or loads. |

## EmptyRecords

See [**Notifications and empty records**](?path=/docs/datasetcontrol-parts-notifications-and-empty-records--overview).

| Prop | Type | Default | Description |
|---|---|---|---|
| \`children\` | \`ReactNode\` | None | What shows the records, drawn while there are some. |
| \`labels\` | \`Partial<IEmptyRecordsLabels>\` | \`EMPTY_RECORDS_LABELS\` | The empty state's text. |
| \`components\` | \`Partial<IEmptyRecordsUiComponents>\` | Defaults | Replacements for the box, the icon and the text. |
`

const meta = {
    title: 'DatasetControl/API/Parts',
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

//a docs page needs a story to render on
export const Overview: Story = {
    name: 'Overview',
    render: () => null,
}
