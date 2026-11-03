import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { EventsExample, HandDownExample, OwnProviderExample, ReadExample, SharedProviderExample, SteerFromCodeExample } from '../../data-providers/dataProvidersExamples'

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

- \`MemoryDataProvider\` also takes a starting \`pageSize\`, \`sorting\`, \`filtering\` and \`searchQuery\`. Without \`pageSize\`, every record is on one page.
- Its search covers the columns in \`metadata.QuickFindColumns\`, or the columns marked \`isPrimary\` when that is not set. A value matches when it starts with the query, or contains it when the query starts with \`*\`.
- \`new FetchXmlDataProvider({ fetchXml })\` needs a page that can reach Dataverse, such as a model-driven app. Call \`setViewId(id)\` before the first load to take the columns of a saved view.

## Hand it to controls

Controls take their provider from around them, not from a prop. A [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview) loads the provider its \`onLoad\` returns and hands it to everything inside it. Without one, wrap the controls in \`DataProviderScope\` and load the provider yourself.

{{story: Without a DatasetControl}}

## Load and read

\`refresh()\` loads the first page and resolves with its records. Loading replaces the records, so their unsaved changes are lost.

- When loading fails, \`refresh()\` rejects with a \`DataProviderError\`, and \`isError()\` and \`getErrorMessage()\` say why.
- Loading clears the selection; see *Selection*.
- Inside a DatasetControl, loading a provider with unsaved changes asks the user first. If they cancel, nothing loads and \`refresh()\` resolves with \`undefined\`.
- \`getColumns()\`, \`getMetadata()\` and \`getPaging()\` describe the rest, and \`isLoading()\` says whether a load is running.

Some types come back from \`getValue()\` in another shape than the raw data holds them:

| Data type | Raw data holds | \`getValue()\` returns |
|---|---|---|
| Option set | \`2\` | \`'2'\` |
| Multi-select option set | \`[1, 4]\` | \`'1,4'\` |
| Two options | \`true\` | \`'1'\` |
| Date, date and time | An ISO string | A \`Date\` |
| Lookup | \`[{ entityType, id, name }]\` | \`[{ etn, id: { guid }, name }]\` |

{{story: Read from code}}

## Sort, filter, search and page

- Setters only store the new state; call \`refresh()\` to load with it.
- \`loadNextPage()\`, \`loadPreviousPage()\` and \`loadExactPage(number)\` load straight away.
- Anything showing the provider reads the same state: what you set from code shows there, and what users set there you read back.

{{story: Steer it from your code}}

## Edit and save

| Call | Does |
|---|---|
| \`record.setValue(column, value)\` | Changes a value and marks the record dirty |
| \`provider.save()\` | Saves every dirty record, and resolves with one \`{ recordId, success, fields, errors? }\` per record |
| \`provider.clearChanges()\` | Throws away unsaved changes |
| \`provider.newRecord()\` | Adds a record |
| \`provider.deleteRecords(ids)\` | Removes records |

A record is saved only when it is valid. Set validation, and whether a column is required, on each record as it loads; the first example does so in \`onRecordLoaded\`.

## Selection

The provider keeps which records are selected, so anything showing them can select and every other part sees it. Each change raises \`onRecordsSelected\`. Every load after the first clears the selection, except on a group's provider. *React to changes* below selects from code.

## Groups and totals

Grouping and totals are part of the column definitions. Mark the column to group by with \`grouping\` and the columns to total with \`aggregation\`, then \`refresh()\`. \`getRecords()\` then returns one record per group, and a group's records are in a provider of their own, from \`createGroupedRecordDataProvider(group)\`.

- A group record holds its value under \`<column>_group\` and each total under \`<column>_<function>\`, unless the column sets \`alias\`.
- A grouped column with no aggregation of its own counts its records, under \`<column>_count\`.
- For totals over every record, define the \`aggregation\` without grouping and read it from a \`TotalRow\`. Await its \`refresh()\` before the first read, and \`destroy()\` it when you are done.

*Read from code* above groups and totals the deals.

| Function | Gives |
|---|---|
| \`count\` | The number of records |
| \`countcolumn\` | The number of records with a value in the column |
| \`sum\`, \`avg\`, \`min\`, \`max\` | The sum, average, lowest and highest value |

## Events

Every change raises an event, so whatever shows the records can draw again. \`addEventListener\` returns a function that removes the listener; \`removeEventListener\` does the same.

{{story: React to changes}}

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

## Lifetime

Create a provider once and keep it while it is used, such as in \`React.useState\`. \`destroy()\` frees it for good.

- A DatasetControl destroys the provider \`onLoad\` returned when the control unmounts or reloads, or when the load fails.
- To keep a provider the rest of your page uses too, pass \`destroyProviderOnUnmount={false}\` and destroy it yourself, as *Steer it from your code* does.

## Your own provider

To work with your API, extend a shipped provider and override only what differs. A provider makes copies of itself from its constructor options, such as one per group, so take one options object and pass it to \`super\`.

Extend \`MemoryDataProvider\` to keep sorting and paging in the browser:

{{story: Save to your API}}

When your API sorts, filters and pages itself, extend \`DataProvider\`. Set the metadata and columns in the constructor, and implement every member in the table below:

\`\`\`ts
class ProductsProvider extends DataProvider {
    constructor(options: IDataProviderOptions) {
        super(options)
        this.setMetadata({ PrimaryIdAttribute: 'productid', PrimaryNameAttribute: 'name', LogicalName: 'product' })
        this.setColumns([{ name: 'name', displayName: 'Product', dataType: DataTypes.SingleLineText }])
    }

    public async getDataAsync(pageNumber: number, pageSize: number): Promise<IRetrievedData> {
        const query = new URLSearchParams({ page: String(pageNumber), size: String(pageSize), search: this.getSearchQuery() ?? '', sort: JSON.stringify(this.getSorting()) })
        const { items, total } = await (await fetch('/api/products?' + query)).json()
        return { data: items, totalRecordCount: total, hasNextPage: pageNumber * pageSize < total }
    }
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
                story: `An office order in a \`MemoryDataProvider\`, shown by a grid, a search box and an order summary of your own. Try: select lines, set a quantity to 0, then search for *desk* and *\\*desk*.`,
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
                story: `IT tickets, five to a page, steered by buttons that call the provider's setters and \`refresh()\`. Try: click *Newest first* and watch the sort arrow and the pager follow.`,
            },
        },
    },
}

export const WithoutADatasetControl: Story = {
    name: 'Without a DatasetControl',
    render: () => renderStory(<HandDownExample />),
    parameters: {
        docs: {
            description: {
                story: `Deals in a \`DataProviderScope\`, loaded by the page, with a selection count and load status drawn from \`useDataProviderEvents\`. Try: search for *Contoso*, then select a few rows.`,
            },
        },
    },
}

export const ReadFromCode: Story = {
    name: 'Read from code',
    render: () => renderStory(<ReadExample />),
    parameters: {
        docs: {
            description: {
                story: `Each button loads the deals into a new provider and prints what it reads back. Try: *Read a deal* to see the shapes \`getValue()\` returns, then *Group by account manager*.`,
            },
        },
    },
}

export const ReactToChanges: Story = {
    name: 'React to changes',
    render: () => renderStory(<EventsExample />),
    parameters: {
        docs: {
            description: {
                story: `A log of the provider's events, with each edited value saved as it is made. Try: click *Toggle deal 3*, then double-click a value, change it and press Enter.`,
            },
        },
    },
}

export const SaveToYourApi: Story = {
    name: 'Save to your API',
    render: () => renderStory(<OwnProviderExample />),
    parameters: {
        docs: {
            description: {
                story: `A \`MemoryDataProvider\` whose \`onRecordSave\` sends each record to a stand-in server first. Try: set a price below zero and save.`,
            },
        },
    },
}
