import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { SharedProviderExample, SteerFromCodeExample } from '../../data-providers/dataProvidersExamples'

const DESCRIPTION = `
A **data provider** is a standalone data layer. It is one object that holds a set of records and everything about them: their columns, the table they come from, how they are sorted, filtered, searched and paged, how they are grouped and totalled, which of them are selected and which have unsaved changes.

A provider has no UI and does not depend on one. You create it, load it, read it and change it from plain code. Anything that shows its records reads them from the provider and writes changes back to it, so when one part changes something, every other part sees it straight away: no copies to keep in sync, no props passed around.

Below, a grid, a search box and a summary of your own share one provider. Select lines, edit a quantity, or search, and watch the summary follow. Open **Code** to see that the summary only talks to the provider, and **Data** to see what the provider holds.

{{story: One provider, every part}}

## How it works

1. **You create a provider** with your records, or with a query it loads them by. See *Pick a provider*.
2. **You set what to show**: sorting, filters, search, the page size.
3. **You refresh it**, and it loads one page of records.
4. **You read and change it.** Read records and their values, set values, select records, save.
5. **It tells everyone.** Each change raises an event, such as \`onNewDataLoaded\` or \`onRecordsSelected\`, so whatever listens can draw again.

## Pick a provider

All providers come from \`@talxis/client-libraries\` and share one interface, \`IDataProvider\`, so code written against one works with all of them. They differ in where the records come from.

| Provider | Records come from | Sorting, filtering, paging | Saving |
|---|---|---|---|
| \`MemoryDataProvider\` | An array you pass in | Done in the browser | Kept in the array, until you send it anywhere else |
| \`FetchXmlDataProvider\` | A Dataverse table, through a FetchXML query | Done by Dataverse | Written to Dataverse |
| Your own, see *Your own provider* | Your API | Your API, or in the browser when you extend \`MemoryDataProvider\` | Your API |

### MemoryDataProvider

For records you already have: from your API, a file, or written by hand.

\`\`\`ts
import { DataTypes, MemoryDataProvider } from '@talxis/client-libraries'

const products = new MemoryDataProvider({
    dataSource: [
        { productid: 'desk', name: 'Standing desk', price: 640 },
        { productid: 'chair', name: 'Ergonomic chair', price: 410 },
    ],
    metadata: { PrimaryIdAttribute: 'productid', PrimaryNameAttribute: 'name', LogicalName: 'product' },
    columns: [
        { name: 'name', displayName: 'Product', dataType: DataTypes.SingleLineText },
        { name: 'price', displayName: 'Price', dataType: DataTypes.Currency },
    ],
})
\`\`\`

| Option | What it does | Default |
|---|---|---|
| \`dataSource\` | The records, one property per column. An array, or the same as a JSON string. | Required |
| \`metadata\` | Describes the table. See below. | Required |
| \`columns\` | The columns. Each needs a \`name\`, the record property it reads, and a \`dataType\` from \`DataTypes\`. | None |
| \`pageSize\` | Records per page. | Every record on one page |
| \`sorting\` | The sorting to start with. | Unsorted |
| \`filtering\` | The filter to start with. | No filter |
| \`searchQuery\` | The search to start with. | No search |
| \`formatting\` | The number, date and currency formats records are read and written with. | The user's |

| \`metadata\` key | What it does |
|---|---|
| \`PrimaryIdAttribute\` | The property that holds each record's id. Required, and every id must be unique. |
| \`PrimaryNameAttribute\` | The property that holds each record's name. |
| \`LogicalName\` | The table's name, used when a record is opened. |
| \`QuickFindColumns\` | The columns search looks in. Without it, search looks in the columns with \`isPrimary\`. |

- Search finds records whose value **starts with** the query. Start the query with \`*\` to find values that **contain** it.
- \`save()\` succeeds and keeps the new values in \`dataSource\`. To send them to your API, see *Your own provider*.
- \`newRecord()\` and \`deleteRecords()\` add to and remove from \`dataSource\`.
- \`getDataSource()\` returns the array, with every change made so far.

### FetchXmlDataProvider

For a Dataverse table. It talks to Dataverse through the page it runs on, so it needs a model-driven app or a TALXIS portal.

\`\`\`ts
import { FetchXmlDataProvider } from '@talxis/client-libraries'

const accounts = new FetchXmlDataProvider({
    fetchXml: \`<fetch>
        <entity name="account">
            <attribute name="name" />
            <attribute name="revenue" />
            <order attribute="name" />
        </entity>
    </fetch>\`,
})
\`\`\`

| Option | What it does | Default |
|---|---|---|
| \`fetchXml\` | The query: the table, its columns, its sorting, its filters and its linked tables. | Required |
| \`loadAllRecords\` | Loads every record at once, page after page, instead of one page. | \`false\` |
| \`formatting\` | The number, date and currency formats records are read and written with. | The user's |

- Before its first page, it loads the table's metadata, the currencies its money columns need and the table's quick find columns.
- Call \`setViewId(id)\` before the first load to take the columns and title of a saved view.
- Columns you pass to \`setColumns\` are merged with the ones the query and the view define.
- A page holds at most 5,000 records.
- \`getCurrentFetchXml()\` returns the query the last page was loaded with, sorting, filters and search included.

## Load records

\`\`\`ts
await provider.refresh()
\`\`\`

- \`refresh()\` loads the first page and resolves with its records. It rejects when loading fails.
- Loading replaces the records: any unsaved change on them is lost.
- \`refreshSync()\` loads the first page at once, without a promise. It works only on a provider that has its records at hand, such as \`MemoryDataProvider\`.

| Status | Method |
|---|---|
| Loading | \`isLoading()\` |
| Failed | \`isError()\`, \`getErrorMessage()\` |
| Loaded for the first time | The \`onFirstDataLoaded\` event |

## Read records

\`\`\`ts
for (const record of provider.getRecords()) {
    record.getRecordId()
    record.getValue('price')
    record.getFormattedValue('price')
}
const desk = provider.getRecordsMap()['desk']
\`\`\`

| Method | Returns |
|---|---|
| \`getRecords()\` | The records of the current page, in order |
| \`getRecordsMap()\` | The same, by id |
| \`getColumns()\` | The columns, as set with \`setColumns\` |
| \`getMetadata()\` | The table's metadata |
| \`getPaging()\` | The page number, page size, total record count and whether there is a next page |

Each record is an \`IRecord\`:

| Method | Does |
|---|---|
| \`getValue(column)\` | The value. Some types come in another shape than the record holds: see below. |
| \`getFormattedValue(column)\` | The value as text, in the user's format |
| \`setValue(column, value)\` | Changes the value. The record is now dirty. |
| \`isDirty(column?)\` | Whether the record, or one of its columns, has unsaved changes |
| \`isValid()\` | Whether every value passes validation |
| \`save()\` | Saves the record |
| \`clearChanges()\` | Puts back the saved values |
| \`getRawData()\` | The record as it was loaded |
| \`toRawData()\` | The record with its unsaved changes |
| \`getField(column)\` | The column's field: its value, validation, required level and whether it is disabled |
| \`isNew()\` | Whether it was made by \`newRecord()\` and not saved yet |

Values come back from \`getValue()\` in these shapes:

| Data type | Record holds | \`getValue()\` returns |
|---|---|---|
| Option set | \`2\` | \`'2'\` |
| Multi-select option set | \`[1, 4]\` | \`'1,4'\` |
| Two options | \`true\` | \`'1'\` |
| Date only, date and time | An ISO string | A \`Date\` in local time |
| Lookup | \`[{ entityType, id, name }]\` | \`[{ etn, id: { guid }, name }]\` |
| File | \`<column>\` plus \`<column>.filename\`, \`.fileurl\`, \`.filesizeinbytes\`, \`.mimetype\` | \`{ fileName, fileUrl, fileSize, mimeType }\` |
| Image | Base64 content in \`<column>\` plus \`<column>.filename\`, \`.mimetype\`, \`.thumbnailurl\` | \`{ fileName, fileContent, thumbnailUrl, fileUrl, mimeType }\` |

## Sort, filter, search and page

A setter only records what you want. Call \`refresh()\` to load the records it gives.

{{story: Steer it from your code}}

\`\`\`ts
import { Operators, Type } from '@talxis/client-libraries'

provider.setSorting([{ name: 'createdon', sortDirection: 1 }])
provider.setFiltering({
    filterOperator: Type.And.Value,
    conditions: [{ attributeName: 'priority', conditionOperator: Operators.Equal.Value, value: '1' }],
})
provider.setSearchQuery('printer')
provider.refresh()
\`\`\`

| Setter | Getter | Takes |
|---|---|---|
| \`setSorting\` | \`getSorting\` | \`[{ name, sortDirection }]\`, \`0\` ascending and \`1\` descending, first one first |
| \`setFiltering\` | \`getFiltering\` | \`{ filterOperator, conditions, filters }\`, or \`null\` for no filter. \`filters\` nests more of the same. |
| \`setSearchQuery\` | \`getSearchQuery\` | Text, or \`''\` for no search |
| \`getPaging().setPageSize\` | \`getPaging().pageSize\` | Records per page |

Paging loads a page by itself, so it needs no \`refresh()\`:

\`\`\`ts
await provider.getPaging().loadNextPage()
await provider.getPaging().loadPreviousPage()
await provider.getPaging().loadExactPage(3)
\`\`\`

Anything showing the provider reads the same getters, so what you set from code shows there, and what users set there you read back.

## Edit and save

\`\`\`ts
const desk = provider.getRecordsMap()['desk']
desk.setValue('price', 599)

provider.getDirtyRecordIds()
provider.getInvalidRecordIds()
await provider.save()
provider.clearChanges()
\`\`\`

| Method | Does |
|---|---|
| \`isDirty()\`, \`getDirtyRecordIds()\` | Whether any record, and which ones, have unsaved changes |
| \`isValid()\`, \`getInvalidRecordIds()\` | Whether any record, and which ones, have a value that fails validation |
| \`save(records?)\` | Saves the given records, or every dirty one. Resolves with one result per record. |
| \`clearChanges()\` | Puts back the saved values on every record |
| \`newRecord({ rawData?, position? })\` | Adds a new record, at the \`'start'\` or the \`'end'\` |
| \`deleteRecords(ids)\` | Deletes records, and resolves with one result per record |

A save result is \`{ recordId, success, fields, errors? }\`. A record that fails validation is not sent: its result has \`success: false\` and one error per invalid column.

## Selection

| Method | Does |
|---|---|
| \`getSelectedRecordIds()\` | The selected ids |
| \`setSelectedRecordIds(ids)\` | Selects these, and only these |
| \`toggleSelectedRecordId(id)\` | Selects or unselects one |
| \`clearSelectedRecordIds()\` | Selects nothing |

Every change of the selection raises \`onRecordsSelected\`.

## Groups and totals

\`\`\`ts
provider.grouping.addGroupBy({ columnName: 'customer', alias: 'customer_group' })
provider.aggregation.addAggregation({ columnName: 'value', alias: 'value_sum', aggregationFunction: 'sum' })
provider.refresh()
\`\`\`

- \`grouping\` has \`addGroupBy\`, \`removeGroupBy\`, \`getGroupBys\` and \`clear\`. \`aggregation\` has \`addAggregation\`, \`removeAggregation\`, \`getAggregations\` and \`clear\`.
- The functions are \`count\`, \`countcolumn\`, \`sum\`, \`avg\`, \`min\` and \`max\`.
- Grouped, \`getRecords()\` returns one record per group. The records of a group are in a provider of their own: \`createGroupedRecordDataProvider(groupRecord)\` returns it.

## Events

Listen with \`addEventListener\` and stop with \`removeEventListener\`:

\`\`\`ts
const onSelected = (ids: string[]) => console.log(ids)
provider.addEventListener('onRecordsSelected', onSelected)
provider.removeEventListener('onRecordsSelected', onSelected)
\`\`\`

| Event | Fires |
|---|---|
| \`onBeforeNewDataLoaded\` | Before a page loads |
| \`onNewDataLoaded\` | After a page has loaded |
| \`onFirstDataLoaded\` | After the first page has loaded, once |
| \`onRecordLoaded(record)\` | For each record loaded, added or saved |
| \`onLoading(isLoading)\` | When loading starts or ends |
| \`onError(message)\` | When loading fails |
| \`onRecordColumnValueChanged(record, column, value)\` | After a value changes |
| \`onRecordsSelected(ids)\` | After the selection changes |
| \`onBeforeRecordSaved(record)\` | Before a record is saved |
| \`onAfterRecordSaved(result)\` | After a record is saved or refused |
| \`onAfterSaved(results)\` | After \`provider.save()\` has saved every record |
| \`onAfterRecordsDeleted(results)\` | After \`deleteRecords\` |
| \`onPageSizeChanged(size)\` | After the page size changes |
| \`onRenderRequested\` | When \`requestRender()\` is called |
| \`onDestroyed\` | When the provider is destroyed |

### In React

| Hook | Returns |
|---|---|
| \`useDataProvider()\` | The provider of the nearest [**DataProviderContextProvider**](?path=/docs/providers-dataprovidercontextprovider--overview). Throws when there is none. |
| \`useDataProviderEvents(events)\` | The same, and draws the component again whenever one of \`events\` fires |

\`\`\`tsx
import { useDataProviderEvents } from '@talxis/base-controls'

const SelectedCount = () => {
    const provider = useDataProviderEvents(['onRecordsSelected'])
    return <span>{provider.getSelectedRecordIds().length} selected</span>
}
\`\`\`

## Record expressions

An expression is a rule for one column of one record, run every time the value is read. Set them on the records once they load:

\`\`\`ts
provider.addEventListener('onRecordLoaded', record => {
    record.expressions.setValidationExpression('price', () => {
        const price = record.getValue('price')
        return { error: price < 0, errorMessage: 'A price cannot be negative.' }
    })
})
\`\`\`

| Expression | Sets |
|---|---|
| \`setValidationExpression(column, () => ({ error, errorMessage }))\` | Whether the value is valid. An invalid record is not saved. |
| \`setRequiredLevelExpression(column, () => level)\` | Whether the value is required |
| \`setDisabledExpression(column, () => boolean)\` | Whether the value can be changed |
| \`setValueExpression(column, () => value)\` | The value, until it is set. \`undefined\` keeps the stored one. |
| \`setFormattedValueExpression(column, text => text)\` | The value as text |
| \`setCurrencySymbolExpression(column, () => symbol)\` | The currency symbol |
| \`ui.setNotificationsExpression\`, \`ui.setCustomFormattingExpression\`, \`ui.setLoadingExpression\` | Notifications, colours and a loading state, for whatever shows the record |

A record drops its expressions when it loads again, and a save loads it again, so set them in \`onRecordLoaded\`. An expression that reads anything besides its own record needs \`provider.requestRender()\` when that changes.

## Lifetime

- Create a provider once, and keep it while it is used, such as in a \`React.useMemo\` or a \`React.useState\`.
- \`destroy()\` stops it and frees its records. A destroyed provider cannot be used again.
- \`createNewDataProvider()\` makes a fresh provider with the same settings, and no records until it is refreshed.

## Your own provider

To make a provider work with your API, extend one of the shipped providers, or build one from scratch.

### Extend a shipped one

When the shipped provider loads records the way you need, extend it and override only what differs. Call \`super\` to keep what it does by default.

\`\`\`ts
import { IRecord, IRecordSaveOperationResult, MemoryDataProvider } from '@talxis/client-libraries'

class ProductsProvider extends MemoryDataProvider {
    public async onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult> {
        const response = await fetch('/api/products/' + record.getRecordId(), { method: 'PUT', body: JSON.stringify(record.toRawData()) })
        if (!response.ok) {
            return { recordId: record.getRecordId(), success: false, fields: [], errors: [{ message: await response.text() }] }
        }
        return super.onRecordSave(record)
    }

    public async onRecordsDelete(recordIds: string[]) {
        await fetch('/api/products', { method: 'DELETE', body: JSON.stringify(recordIds) })
        return super.onRecordsDelete(recordIds)
    }

    public onOpenDatasetItem(entityReference: ComponentFramework.EntityReference) {
        window.open('/products/' + entityReference.id.guid)
    }
}

const products = new ProductsProvider({ dataSource: [], metadata: { PrimaryIdAttribute: 'productid' } })
\`\`\`

- \`super.onRecordSave\` returns the success result. Once a save succeeds, the record keeps its new values as its saved ones; a refused save leaves them unsaved.
- \`onRecordSave\` is called for every record saved, through \`provider.save()\` or \`record.save()\`. \`record.isNew()\` tells a new record from an existing one.
- \`FetchXmlDataProvider\` extends the same way, such as to open records somewhere of your own.

| Method | What it does |
|---|---|
| \`getDataAsync(pageNumber, pageSize, previousPageNumber, event)\` | Loads one page: \`{ data, totalRecordCount, hasNextPage }\` |
| \`getDataSync(...)\` | The same, without a promise, for \`refreshSync()\`. Throw if you cannot. |
| \`onPreload()\` | Runs once before the first page, for metadata and other setup |
| \`onRecordSave(record)\` | Saves one record and resolves \`{ recordId, success, fields, errors? }\` |
| \`onRecordCreate(record, { position })\` | A record was added with \`newRecord()\` |
| \`onRecordsDelete(ids)\` | Deletes records and resolves \`{ success, results }\`, one \`{ recordId, success }\` per record. A record whose delete fails is kept. |
| \`onRecordRawDataUpdate(id, rawData)\` | A record's data was replaced with \`setRecordRawData\` |
| \`onIsRecordActive(id)\` | Whether a record is active rather than deactivated |
| \`onOpenDatasetItem(entityReference)\` | Opens a record |
| \`onGetQuickFindColumns()\` | The columns search looks in |
| \`onGetAvailableColumns()\`, \`onGetAvailableRelatedColumns()\` | The columns that can be added, of the table and of related tables |
| \`onRetrieveRecordCommand(defaultAction, options)\` | The commands available on records. Return \`defaultAction(options)\` for none of your own. |
| \`onBulkEdit(records)\` | Edits many records at once. Throw if you do not support it. |

A provider makes more of itself from the options it was constructed with, such as one per group, so take a single options object and pass it to \`super\`.

### Build one from scratch

When your API does the sorting, filtering and paging itself, extend \`DataProvider\` and implement every method in the table above. \`getDataAsync\` reads what to load from the provider's getters:

\`\`\`ts
import { DataProvider, GetDataEvent, IRetrievedData } from '@talxis/client-libraries'

class ProductsProvider extends DataProvider {
    constructor(options: { baseUrl: string }) {
        super(options)
        this.setMetadata({ PrimaryIdAttribute: 'productid', PrimaryNameAttribute: 'name', LogicalName: 'product' })
    }

    public async getDataAsync(pageNumber: number, pageSize: number, previousPageNumber: number, event: GetDataEvent): Promise<IRetrievedData> {
        const response = await fetch('/api/products?' + new URLSearchParams({
            page: String(pageNumber),
            size: String(pageSize),
            search: this.getSearchQuery() ?? '',
            sort: JSON.stringify(this.getSorting()),
            filter: JSON.stringify(this.getFiltering()),
        }))
        const { items, total } = await response.json()
        return { data: items, totalRecordCount: total, hasNextPage: pageNumber * pageSize < total }
    }
}
\`\`\`
`

const meta = {
    title: 'Data providers',
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

export const OneProviderEveryPart: Story = {
    name: 'One provider, every part',
    render: () => renderStory(<SharedProviderExample />),
    parameters: {
        docs: {
            description: {
                story: `An office order in a \`MemoryDataProvider\`, shown by a grid, a search box and an order summary of your own. Edit a quantity and the summary offers to save or discard it. Search for *desk* and both show only *Desk lamp*, the one value that starts with it; search for *\\*desk* to find the standing desk too.`,
            },
        },
    },
}

export const SteerItFromYourCode: Story = {
    name: 'Steer it from your code',
    render: () => renderStory(<SteerFromCodeExample />),
    parameters: {
        docs: {
            description: {
                story: `IT tickets, five to a page. The buttons call the provider's setters and \`refresh()\`; the sort arrow and the pager follow, because they read the same provider.`,
            },
        },
    },
}
