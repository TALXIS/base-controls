import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EveryDataTypeExample, OwnRecordsExample, PageByPageExample, RequiredAndReadOnlyExample } from '../../../grid/examples/dataExamples'

const DESCRIPTION = `
The grid shows what its provider holds: the provider's columns become the grid's columns, and the records of the current page become its rows.

{{story: Show your own records}}

- \`dataSource\` holds the records, one property per column.
- \`metadata\` describes the table. \`PrimaryIdAttribute\` names the id property and is required. \`PrimaryNameAttribute\` and \`LogicalName\` are used when a record is opened.
- \`columns\` lists the columns. What the grid reads from each is below.
- Create the provider once, here with \`React.useMemo\`. The grid reads \`provider\` only when it mounts.

## Columns

| Field | What it does | Default |
|---|---|---|
| \`name\` | The column's id, its key in \`colDefs\`, and the record property that holds its value. | Required |
| \`dataType\` | How values are formatted, drawn and edited. See [**Data types**](#data-types). | Required |
| \`displayName\` | The header's text. | Empty |
| \`visualSizeFactor\` | The width in pixels. Columns share spare space in proportion to it. A resize is written back here. | \`200\` |
| \`order\` | The position, lowest first. A move is written back here. | The order you passed |
| \`isHidden\` | Leaves the column out of the grid. | \`false\` |
| \`alignment\` | \`'left'\`, \`'center'\` or \`'right'\`. | Right for numbers and currency, left for the rest |
| \`isPrimary\` | Draws the value as a link that opens the record. | \`false\` |
| \`oneClickEdit\` | Shows the editor in the cell without a double-click. See [**Editing**](?path=/docs/grid-editing--overview). | \`false\` |
| \`autoHeight\` | Grows the row to fit wrapped text. | \`false\` |
| \`isDraggable\` | \`false\` stops the user moving the column. | \`true\` |
| \`disableSorting\` | Keeps the column out of sorting. | \`false\`; \`true\` for multi-select option sets |
| \`grouping\`, \`aggregation\` | Groups by the column, or totals it. See [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview). | None |
| \`metadata\` | What can be done with the column. See below. | |

### Metadata

The provider fills in the keys you leave out, as the last column says.

| Key | What it does | Default |
|---|---|---|
| \`IsValidForUpdate\` | Lets the column be edited. \`false\` locks it and shows a lock in its header. | \`true\`; \`false\` for files and images |
| \`RequiredLevel\` | \`1\` or \`2\` make a value required: an empty one is outlined in red and the record won't save. | Not required |
| \`SupportedFilterConditionOperators\` | The operators its filter offers. \`[]\` turns filtering off. | All operators of the data type |
| \`CanBeGrouped\` | Lets the column be grouped by. | \`true\`; \`false\` for files, images and multi-select option sets |
| \`SupportedAggregations\` | The totals its menu offers. | All for numbers, currency and durations; \`count\`, \`countcolumn\`, \`min\`, \`max\` for dates; \`count\` and \`countcolumn\` for the rest |
| \`OptionSet\` | The options, as \`{ Value, Label, Color }\`. Two options need \`0\` and \`1\`. With \`enableOptionSetColors\`, an option with a \`Color\` is drawn as a tag. | No labels |
| \`Precision\` | Decimal places of a decimal or currency value. | The user's number format |
| \`MaxLength\`, \`MinValue\`, \`MaxValue\` | Limits on a text length or a number. A value outside them won't save. | No limit |

{{story: Required and read-only columns}}

## Data types

{{story: Every data type in one grid}}

| Data type | \`DataTypes\` | Shown as | Edited with |
|---|---|---|---|
| Text | \`SingleLineText\` | Text, cut with an ellipsis | A text box |
| Email, phone, URL | \`SingleLineEmail\`, \`SingleLinePhone\`, \`SingleLineUrl\` | A link | A text box |
| Text area, multiline text | \`SingleLineTextArea\`, \`Multiple\` | Wrapped text | A multi-line text box |
| Whole number, decimal | \`WholeNone\`, \`Decimal\` | The number in the user's format | A number box |
| Currency | \`Currency\` | The amount with its symbol | A number box |
| Duration | \`WholeDuration\` | Minutes as a duration, \`90\` is *1.5 hours* | A duration box |
| Date only, date and time | \`DateAndTimeDateOnly\`, \`DateAndTimeDateAndTime\` | The date, with the time if it has one | A date picker |
| Option set | \`OptionSet\` | The label, or a coloured tag | A drop-down |
| Multi-select option set | \`MultiSelectOptionSet\` | The labels, or a tag for each | A multi-select drop-down |
| Two options | \`TwoOptions\` | The label, or a tag | A toggle |
| Lookup | \`LookupSimple\`, \`LookupOwner\`, \`LookupCustomer\`, \`LookupRegarding\` | A link to each record | A lookup that searches Dataverse |
| File, image | \`File\`, \`Image\` | The file's name, or a thumbnail | Not editable |
| Language, time zone | \`WholeLanguage\`, \`WholeTimeZone\` | The number | A text box |

Links need \`enableNavigation\`, which is on by default. An empty value is shown as \`---\`.

\`record.getValue()\` returns some types in another shape than the record holds:

| Data type | Record holds | \`getValue()\` returns |
|---|---|---|
| Option set | \`2\` | \`'2'\` |
| Multi-select option set | \`[1, 4]\` | \`'1,4'\` |
| Two options | \`true\` | \`'1'\` |
| Date only, date and time | An ISO string | A \`Date\` in local time |
| Lookup | \`[{ entityType, id, name }]\` | \`[{ etn, id: { guid }, name }]\` |
| File | \`<column>\` plus \`<column>.filename\`, \`.fileurl\`, \`.filesizeinbytes\`, \`.mimetype\` | \`{ fileName, fileUrl, fileSize, mimeType }\` |
| Image | Base64 content in \`<column>\` plus \`<column>.filename\`, \`.mimetype\`, \`.thumbnailurl\` | \`{ fileName, fileContent, thumbnailUrl, fileUrl, mimeType }\` |

Compare option sets and two options as strings, such as \`record.getValue('billable') === '1'\`. \`'0'\` is truthy.

## Paging

The grid shows one page and has no pager of its own. A \`MemoryDataProvider\` puts every record on one page unless you pass \`pageSize\`; other providers show 50 a page. To page, set the size and draw your own pager over \`getPaging()\`:

{{story: Browse a large catalogue page by page}}

| \`getPaging()\` | What it is |
|---|---|
| \`pageNumber\` | The current page, from 1. |
| \`pageSize\` | Records per page. |
| \`totalResultCount\` | Records across all pages. |
| \`hasPreviousPage\`, \`hasNextPage\` | Whether there is another page. |
| \`loadPreviousPage()\`, \`loadNextPage()\`, \`loadExactPage(n)\` | Loads that page. |
| \`setPageSize(n)\` | Sets the size for the next load. Call \`refresh()\` after it. |

\`getPaging()\` is a snapshot, so read it again after each load, for example in \`onDataLoaded\`. Sorting and filtering cover every record and go back to page 1.

## The examples' data

Most examples get a \`provider\` over one of four datasets, already loaded. Their columns can be sorted, filtered, grouped and edited, apart from files and images.

| Dataset | Records | Columns |
|---|---|---|
| Sales pipeline | 30 deals | Deal, Account manager, Stage, Products, Value, Probability, Close date, Time spent, Recurring |
| Timesheets | 24 entries from last week | Work done, Employee, Project, Date, Hours, Billable, Hourly rate, Status, Comment |
| Support tickets | 36 tickets from the last week | Ticket, Subject, Customer, Priority, Status, Channel, Assigned to, Opened, Respond by, Time spent, Escalated |
| Products | 16 office furniture products | Photo, Product, SKU, Category, Price, In stock, Reorder at, Supplier, Last restocked, Discontinued, Product page |

Dates are relative to today. In **Code**, \`createDealsProvider()\`, \`createTimesheetsProvider()\`, \`createTicketsProvider()\` and \`createProductsProvider()\` create a fresh copy of each.

Every example has three tabs: **Preview** runs it, **Code** lets you edit it (some examples have several files), and **Data** shows the provider as JSON. **Reset** restores the original code and data.
`

const meta = {
    title: 'Grid/Get started/Data',
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

export const ShowYourOwnRecords: Story = {
    name: 'Show your own records',
    render: () => renderStory(<OwnRecordsExample />),
    parameters: {
        docs: {
            description: {
                story: `An office supplies catalogue in a \`MemoryDataProvider\`. Sort it by Unit price from the column's menu.`,
            },
        },
    },
}

export const RequiredAndReadOnlyColumns: Story = {
    name: 'Required and read-only columns',
    render: () => renderStory(<RequiredAndReadOnlyExample />),
    parameters: {
        docs: {
            description: {
                story: `A warehouse stock count with editing and auto-save on. SKU, Product and On record come from the stock system and set \`IsValidForUpdate: false\`, so their headers show a lock; Counted and Note leave it out, so they are editable. Counted sets \`RequiredLevel: 2\`: the two lines not counted yet are outlined in red, and clearing a count refuses the save, so open the red icon at the start of that row to see why.`,
            },
        },
    },
}

export const EveryDataTypeInOneGrid: Story = {
    name: 'Every data type in one grid',
    render: () => renderStory(<EveryDataTypeExample />),
    parameters: {
        docs: {
            description: {
                story: `A supplier directory with a column of each data type in the table below, except language and time zone, with \`enableEditing\` and \`enableOptionSetColors\`. Double-click a cell to open its editor, or click a Supplier or a Contact: an \`onOpenDatasetItem\` interceptor says what the link opens. Contact is read-only because a lookup's editor searches Dataverse, and this page has none.`,
            },
        },
    },
}

export const BrowseALargeCataloguePageByPage: Story = {
    name: 'Browse a large catalogue page by page',
    render: () => renderStory(<PageByPageExample />),
    parameters: {
        docs: {
            description: {
                story: `300 products, 25 a page through \`pageSize\`. The pager under the grid reads \`getPaging()\` in \`onDataLoaded\`. Sorting by Price sorts all 300 and goes back to page 1.`,
            },
        },
    },
}
