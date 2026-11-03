import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { SharedProviderExample, SteerFromCodeExample } from '../../data-providers/dataProvidersExamples'

const DESCRIPTION = `
A data provider holds a set of records and everything about them: their columns, how they are sorted, filtered and paged, which are selected and which have unsaved changes. It has no UI. Whatever shows the records reads them from the provider and writes changes back to it, so every part that shares a provider stays in step without copies or props.

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
    metadata: { PrimaryIdAttribute: 'productid', PrimaryNameAttribute: 'name', LogicalName: 'product' },
    columns: [
        { name: 'name', displayName: 'Product', dataType: DataTypes.SingleLineText },
        { name: 'price', displayName: 'Price', dataType: DataTypes.Currency },
    ],
})

const accounts = new FetchXmlDataProvider({ fetchXml: '<fetch><entity name="account"><attribute name="name" /></entity></fetch>' })
\`\`\`

\`MemoryDataProvider\` also takes a starting \`pageSize\`, \`sorting\`, \`filtering\` and \`searchQuery\`. Its search matches values that start with the query, or contain it when the query starts with \`*\`. \`FetchXmlDataProvider\` needs a page that can reach Dataverse, such as a model-driven app; \`setViewId(id)\` before the first load takes the columns of a saved view.

## Hand it to controls

Controls take their provider from around them, not from a prop. A [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview) loads one and hands it to everything inside it. To hand down a provider you created yourself, wrap the controls in \`DataProviderScope\`:

\`\`\`tsx
<DataProviderScope provider={products}>
    <Grid modules={[createClientSideRowModelModule()]} />
</DataProviderScope>
\`\`\`

## Load and read

\`refresh()\` loads the first page and resolves with its records. Loading replaces the records, so unsaved changes on them are lost.

\`\`\`ts
await provider.refresh()
for (const record of provider.getRecords()) {
    record.getRecordId()
    record.getValue('price')
}
const desk = provider.getRecordsMap()['desk']
\`\`\`

\`getColumns()\`, \`getMetadata()\` and \`getPaging()\` describe the rest, and \`isLoading()\` and \`isError()\` the load itself. Some types come back from \`getValue()\` in another shape than the record holds them:

| Data type | Record holds | \`getValue()\` returns |
|---|---|---|
| Option set | \`2\` | \`'2'\` |
| Multi-select option set | \`[1, 4]\` | \`'1,4'\` |
| Two options | \`true\` | \`'1'\` |
| Date, date and time | An ISO string | A \`Date\` |
| Lookup | \`[{ entityType, id, name }]\` | \`[{ etn, id: { guid }, name }]\` |

## Sort, filter, search and page

A setter only records what you want; \`refresh()\` loads the records it gives. Paging loads a page by itself. Anything showing the provider reads the same state, so what you set from code shows there, and what users set there you read back.

\`\`\`ts
provider.setSorting([{ name: 'createdon', sortDirection: 1 }])
provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'priority', conditionOperator: Operators.Equal.Value, value: '1' }] })
provider.setSearchQuery('printer')
await provider.refresh()

await provider.getPaging().loadNextPage()
\`\`\`

{{story: Steer it from your code}}

## Edit and save

\`record.setValue(column, value)\` changes a value and marks the record dirty. \`provider.save()\` saves every dirty record and resolves with one \`{ recordId, success, fields, errors? }\` per record; \`clearChanges()\` puts the saved values back. \`newRecord()\` adds a record and \`deleteRecords(ids)\` removes them.

A record is saved only when it is valid. Set validation, and whether a column is required, on each record as it loads:

\`\`\`ts
provider.addEventListener('onRecordLoaded', record => {
    record.expressions.setValidationExpression('price', () => ({ error: record.getValue('price') < 0, errorMessage: 'A price cannot be negative.' }))
    record.expressions.setRequiredLevelExpression('name', () => 'required')
})
\`\`\`

## Selection

The provider keeps which records are selected, so anything showing them can select and every other part sees it. Each change raises \`onRecordsSelected\`.

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

\`getRecords()\` now returns one record per group, holding each total under its alias: \`<column>_<function>\` unless the column sets \`alias\`, here \`value_sum\`. A grouped column counts its records when it has no aggregation of its own. A group's records are in a provider of their own:

\`\`\`ts
for (const group of provider.getRecords()) {
    group.getValue('value_sum')
    const deals = provider.createGroupedRecordDataProvider(group)
    await deals.refresh()
}
\`\`\`

The functions are \`count\`, \`countcolumn\`, \`sum\`, \`avg\`, \`min\` and \`max\`. For totals over every record, define the \`aggregation\` without grouping and read it from a \`TotalRow\`, which works the totals out again whenever the provider loads:

\`\`\`ts
const totals = new TotalRow(provider)
totals.getTotalRowRecord()?.getValue('value_sum')
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

\`useDataProviderEvents(events)\` returns the provider around the component and draws the component again whenever one of \`events\` fires:

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

### Save as the user types

\`\`\`ts
provider.addEventListener('onRecordColumnValueChanged', async record => {
    await record.save()
})
\`\`\`

### Load again when something outside changes

Set what changed and call \`refresh()\`:

\`\`\`tsx
React.useEffect(() => {
    provider.setSearchQuery(search)
    provider.refresh()
}, [search])
\`\`\`

### Stop listening

\`addEventListener\` returns the function that removes the listener, so an effect can return it:

\`\`\`tsx
React.useEffect(() => provider.addEventListener('onAfterSaved', results => notify(results)), [provider])
\`\`\`

## Lifetime

Create a provider once and keep it while it is used, such as in \`React.useState\`. \`destroy()\` frees it for good.

## Your own provider

To work with your API, extend a shipped provider and override only what differs. Extend \`MemoryDataProvider\` to keep sorting and paging in the browser:

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

When your API sorts, filters and pages itself, extend \`DataProvider\`. It leaves every hook to you: \`getDataAsync\` loads one page, reading what to load from the provider's getters, and the rest save, delete and open records:

\`\`\`ts
class ProductsProvider extends DataProvider {
    public async getDataAsync(pageNumber: number, pageSize: number): Promise<IRetrievedData> {
        const query = new URLSearchParams({ page: String(pageNumber), size: String(pageSize), search: this.getSearchQuery() ?? '', sort: JSON.stringify(this.getSorting()) })
        const { items, total } = await (await fetch('/api/products?' + query)).json()
        return { data: items, totalRecordCount: total, hasNextPage: pageNumber * pageSize < total }
    }
    //onRecordSave, onRecordsDelete, onRecordCreate, onOpenDatasetItem, onGetQuickFindColumns and the other hooks
}
\`\`\`

Extending \`MemoryDataProvider\` or \`FetchXmlDataProvider\`, override only the hooks that differ, such as \`onRecordsDelete\` or \`onOpenDatasetItem\`. A provider makes copies of itself from its constructor options, such as one per group, so take one options object and pass it to \`super\`.
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
                story: `IT tickets, five to a page. The buttons call the provider's setters and \`refresh()\`; the sort arrow and the pager follow, because they read the same provider.`,
            },
        },
    },
}
