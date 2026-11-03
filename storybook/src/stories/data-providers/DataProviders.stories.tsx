import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { SharedProviderExample, SteerFromCodeExample } from '../../data-providers/dataProvidersExamples'

const DESCRIPTION = `
A data provider holds a set of records and everything about them: their columns, sorting, filters, paging, selection and unsaved changes. It has no UI. Whatever shows the records reads them from the provider and writes changes back to it, so every part sharing a provider stays in step.

{{story: One provider, every part}}

## Pick a provider

Every provider comes from \`@talxis/client-libraries\` and implements \`IDataProvider\`, so code written against one works with all of them. They differ in where the records come from:

| Provider | Records from | Sorts, filters and pages | Saves to |
|---|---|---|---|
| \`MemoryDataProvider\` | An array you pass in | In the browser | The array |
| \`FetchXmlDataProvider\` | A Dataverse table, through FetchXML | Dataverse | Dataverse |
| Your own | Your API | Your API, or the browser | Your API |

\`\`\`ts
const products = new MemoryDataProvider({
    dataSource: [{ productid: 'desk', name: 'Standing desk', price: 640 }],
    metadata: { PrimaryIdAttribute: 'productid', PrimaryNameAttribute: 'name', LogicalName: 'product', QuickFindColumns: ['name'] },
    columns: [
        { name: 'name', displayName: 'Product', dataType: DataTypes.SingleLineText },
        { name: 'price', displayName: 'Price', dataType: DataTypes.Currency },
    ],
})

const accounts = new FetchXmlDataProvider({ fetchXml: '<fetch><entity name="account"><attribute name="name" /></entity></fetch>' })
\`\`\`

- \`MemoryDataProvider\` also takes a starting \`pageSize\`, \`sorting\`, \`filtering\` and \`searchQuery\`. Without \`pageSize\`, every record is on one page.
- Its search covers the columns in \`metadata.QuickFindColumns\`, or the columns marked \`isPrimary\` when that is not set. A value matches when it starts with the query, or contains it when the query starts with \`*\`.
- \`FetchXmlDataProvider\` needs a page that can reach Dataverse, such as a model-driven app. Call \`setViewId(id)\` before the first load to take the columns of a saved view.

## Hand it to controls

Controls take their provider from around them, not from a prop. A [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview) loads the provider its \`onLoad\` returns and hands it to everything inside it.

To hand down a provider without a DatasetControl, wrap the controls in \`DataProviderScope\` and load the provider yourself. Nothing inside calls \`refresh()\` for you:

\`\`\`tsx
const ProductsGrid = () => {
    const [products] = React.useState(createProducts)
    React.useEffect(() => {
        const load = async () => await products.refresh()
        load()
        return () => products.destroy()
    }, [products])
    return <DataProviderScope provider={products}>
        <Grid modules={[createClientSideRowModelModule()]} />
    </DataProviderScope>
}
\`\`\`

## Load and read

\`refresh()\` loads the first page and resolves with its records. Loading replaces the records, so their unsaved changes are lost.

- When loading fails, \`refresh()\` rejects with a \`DataProviderError\`, and \`isError()\` and \`getErrorMessage()\` say why.
- Loading clears the selection; see *Selection*.
- Inside a DatasetControl, loading a provider with unsaved changes asks the user first. If they cancel, nothing loads and \`refresh()\` resolves with \`undefined\`.

\`\`\`ts
await provider.refresh()
for (const record of provider.getRecords()) {
    record.getRecordId()
    record.getValue('price')
}
const desk = provider.getRecordsMap()['desk']
\`\`\`

\`getColumns()\`, \`getMetadata()\` and \`getPaging()\` describe the rest, and \`isLoading()\` says whether a load is running. Some types come back from \`getValue()\` in another shape than the raw data holds them:

| Data type | Raw data holds | \`getValue()\` returns |
|---|---|---|
| Option set | \`2\` | \`'2'\` |
| Multi-select option set | \`[1, 4]\` | \`'1,4'\` |
| Two options | \`true\` | \`'1'\` |
| Date, date and time | An ISO string | A \`Date\` |
| Lookup | \`[{ entityType, id, name }]\` | \`[{ etn, id: { guid }, name }]\` |

## Sort, filter, search and page

- Setters only store the new state; call \`refresh()\` to load with it.
- \`loadNextPage()\`, \`loadPreviousPage()\` and \`loadExactPage(number)\` load straight away.
- \`sortDirection\` is \`0\` for ascending and \`1\` for descending.
- Anything showing the provider reads the same state: what you set from code shows there, and what users set there you read back.

\`\`\`ts
provider.setSorting([{ name: 'createdon', sortDirection: 1 }])
provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'priority', conditionOperator: Operators.Equal.Value, value: '1' }] })
provider.setSearchQuery('printer')
await provider.refresh()

await provider.getPaging().loadNextPage()
\`\`\`

{{story: Steer it from your code}}

## Edit and save

| Call | Does |
|---|---|
| \`record.setValue(column, value)\` | Changes a value and marks the record dirty |
| \`provider.save()\` | Saves every dirty record, and resolves with one \`{ recordId, success, fields, errors? }\` per record |
| \`provider.clearChanges()\` | Throws away unsaved changes |
| \`provider.newRecord()\` | Adds a record |
| \`provider.deleteRecords(ids)\` | Removes records |

A record is saved only when it is valid. Set validation, and whether a column is required, on each record as it loads:

\`\`\`ts
provider.addEventListener('onRecordLoaded', record => {
    record.expressions.setValidationExpression('price', () => ({ error: record.getValue('price') < 0, errorMessage: 'A price cannot be negative.' }))
    record.expressions.setRequiredLevelExpression('name', () => 'required')
})
\`\`\`

## Selection

The provider keeps which records are selected, so anything showing them can select and every other part sees it. Each change raises \`onRecordsSelected\`. Every load after the first clears the selection, except on a group's provider.

\`\`\`ts
provider.setSelectedRecordIds(['desk', 'chair'])
provider.toggleSelectedRecordId('lamp')
provider.getSelectedRecordIds()   //['desk', 'chair', 'lamp']
provider.clearSelectedRecordIds()
\`\`\`

## Groups and totals

Grouping and totals are part of the column definitions. Mark the column to group by with \`grouping\` and the columns to total with \`aggregation\`, then \`refresh()\`:

\`\`\`ts
provider.setColumns(provider.getColumns().map(column => {
    if (column.name === 'customer') {
        return { ...column, grouping: { isGrouped: true } }
    }
    if (column.name === 'value') {
        return { ...column, aggregation: { aggregationFunction: 'sum' } }
    }
    return column
}))
await provider.refresh()
\`\`\`

\`getRecords()\` now returns one record per group, and a group's records are in a provider of their own:

\`\`\`ts
for (const group of provider.getRecords()) {
    group.getValue('value_sum')
    const deals = provider.createGroupedRecordDataProvider(group)
    await deals.refresh()
}
\`\`\`

- A group record holds each total under its alias: \`<column>_<function>\` unless the column sets \`alias\`, here \`value_sum\`.
- A grouped column with no aggregation of its own counts its records, here under \`customer_count\`.

| Function | Gives |
|---|---|
| \`count\` | The number of records |
| \`countcolumn\` | The number of records with a value in the column |
| \`sum\`, \`avg\`, \`min\`, \`max\` | The sum, average, lowest and highest value |

For totals over every record, define the \`aggregation\` without grouping and read it from a \`TotalRow\`. It works the totals out again whenever the provider loads; await \`refresh()\` before the first read, and \`destroy()\` it when you are done:

\`\`\`ts
const totals = new TotalRow(provider)
await totals.refresh()
totals.getTotalRowRecord()?.getValue('value_sum')
totals.destroy()
\`\`\`

## Events

Every change raises an event, so whatever shows the records can draw again. \`addEventListener\` returns a function that removes the listener; \`removeEventListener\` does the same.

\`\`\`ts
const stop = provider.addEventListener('onRecordsSelected', ids => console.log(ids))
stop()
\`\`\`

| Event | Fires |
|---|---|
| \`onBeforeFirstDataLoaded\`, \`onFirstDataLoaded\` | Once, before and after the first page loads |
| \`onBeforeNewDataLoaded\`, \`onNewDataLoaded\` | Before and after every page loads |
| \`onLoading(isLoading)\` | When loading starts and ends |
| \`onError(message, details?)\` | When loading fails |
| \`onRecordLoaded(record)\` | For each record loaded, added or saved |
| \`onRecordColumnValueChanged(record, column, value)\` | After a value changes |
| \`onRecordsSelected(ids)\` | After the selection changes |
| \`onPageSizeChanged(size)\` | After the page size changes |
| \`onBeforeRecordSaved(record)\`, \`onAfterRecordSaved(result)\` | Before and after each record is saved |
| \`onAfterSaved(results)\` | After \`save()\` has saved every record |
| \`onAfterRecordsDeleted(results)\` | After \`deleteRecords()\` |
| \`onRecordCommandsRetrieved(commands)\` | When the commands available on records are read |
| \`onNestedProviderPagingLimitReached\` | When a group's records reach the 5,000 record limit |
| \`onDestroyed\` | When the provider is destroyed |

## Common patterns

### Draw a component from the provider

\`useDataProviderEvents(events)\` returns the provider around the component and draws the component again whenever one of \`events\` fires. It reads \`events\` once, when the component mounts:

\`\`\`tsx
const SelectedCount = () => {
    const provider = useDataProviderEvents(['onRecordsSelected'])
    return <span>{provider.getSelectedRecordIds().length} selected</span>
}
\`\`\`

### Show loading and errors

\`\`\`tsx
const LoadStatus = () => {
    const provider = useDataProviderEvents(['onLoading', 'onError'])
    if (provider.isError()) {
        return <MessageBar messageBarType={MessageBarType.error}>{provider.getErrorMessage()}</MessageBar>
    }
    return provider.isLoading() ? <Spinner /> : null
}
\`\`\`

### Save each change as it is made

\`\`\`ts
provider.addEventListener('onRecordColumnValueChanged', async record => {
    await record.save()
})
\`\`\`

### Load again when something outside changes

Set what changed and call \`refresh()\`:

\`\`\`tsx
React.useEffect(() => {
    const load = async () => {
        provider.setSearchQuery(search)
        await provider.refresh()
    }
    load()
}, [search])
\`\`\`

### Stop listening

An effect can return what \`addEventListener\` returns:

\`\`\`tsx
React.useEffect(() => provider.addEventListener('onAfterSaved', results => notify(results)), [provider])
\`\`\`

## Lifetime

Create a provider once and keep it while it is used, such as in \`React.useState\`. \`destroy()\` frees it for good.

- A DatasetControl destroys the provider \`onLoad\` returned when the control unmounts or reloads, or when the load fails.
- To keep a provider the rest of your page uses too, pass \`destroyProviderOnUnmount={false}\` and destroy it yourself, as in *Steer it from your code*:

\`\`\`tsx
const [tickets] = React.useState(createTickets)
React.useEffect(() => () => tickets.destroy(), [tickets])
return <DatasetControl onLoad={async () => ({ provider: tickets })} destroyProviderOnUnmount={false}>...</DatasetControl>
\`\`\`

## Your own provider

To work with your API, extend a shipped provider and override only what differs. A provider makes copies of itself from its constructor options, such as one per group, so take one options object and pass it to \`super\`.

Extend \`MemoryDataProvider\` to keep sorting and paging in the browser:

\`\`\`ts
class ProductsProvider extends MemoryDataProvider {
    public async onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult> {
        const response = await fetch('/api/products/' + record.getRecordId(), { method: 'PUT', body: JSON.stringify(record.toRawData()) })
        if (!response.ok) {
            return { recordId: record.getRecordId(), success: false, fields: [], errors: [{ message: await response.text() }] }
        }
        return super.onRecordSave(record)
    }
}
\`\`\`

When your API sorts, filters and pages itself, extend \`DataProvider\`. Set the metadata and columns in the constructor, and implement every member in the table below:

\`\`\`ts
class ProductsProvider extends DataProvider {
    constructor(options: IDataProviderOptions) {
        super(options)
        this.setMetadata({ PrimaryIdAttribute: 'productid', PrimaryNameAttribute: 'name', LogicalName: 'product' })
        this.setColumns([
            { name: 'name', displayName: 'Product', dataType: DataTypes.SingleLineText },
            { name: 'price', displayName: 'Price', dataType: DataTypes.Currency },
        ])
    }

    public async getDataAsync(pageNumber: number, pageSize: number): Promise<IRetrievedData> {
        const query = new URLSearchParams({ page: String(pageNumber), size: String(pageSize), search: this.getSearchQuery() ?? '', sort: JSON.stringify(this.getSorting()), filter: JSON.stringify(this.getFiltering()) })
        const response = await fetch('/api/products?' + query)
        const { items, total } = await response.json()
        return { data: items, totalRecordCount: total, hasNextPage: pageNumber * pageSize < total }
    }

    //and every other member in the table
}
\`\`\`

| Member | Does |
|---|---|
| \`getDataAsync(pageNumber, pageSize, previousPageNumber, event)\` | Loads one page with the provider's sorting, filters and search, and resolves with \`{ data, totalRecordCount, hasNextPage }\` |
| \`getDataSync(...)\` | The same, synchronously, for \`refreshSync()\` |
| \`onPreload()\` | Prepares what loading needs; a DatasetControl awaits it before it loads the provider |
| \`onRecordSave(record)\` | Saves one record and resolves with \`{ recordId, success, fields, errors? }\` |
| \`onRecordsDelete(recordIds)\` | Deletes records and resolves with \`{ success, results }\` |
| \`onRecordCreate(record, options?)\` | Adds a new record at the \`start\` or \`end\` |
| \`onRecordRawDataUpdate(recordId, rawData)\` | Stores a record's new raw data |
| \`onIsRecordActive(recordId)\` | Whether a record is active; an inactive record is read-only |
| \`onOpenDatasetItem(entityReference, context?)\` | Opens a record |
| \`onRetrieveRecordCommand(defaultAction, options?)\` | Returns the commands for records; \`defaultAction\` gives the default ones |
| \`onGetQuickFindColumns()\` | Returns the columns search covers |
| \`onBulkEdit(records)\` | Edits several records at once, and resolves \`true\` to load again |
| \`onGetAvailableColumns(options?)\` | Returns the columns a user can add |
| \`onGetAvailableRelatedColumns()\` | Returns the columns of related tables a user can add |
`

const meta = {
    title: 'Concepts/Data providers',
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
                story: `IT tickets, five to a page. The buttons call the provider's setters and \`refresh()\`; the sort arrow and the pager follow, because they read the same provider. The provider lives outside the DatasetControl, so the control is told not to destroy it.`,
            },
        },
    },
}
