import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EveryDataTypeExample, OwnRecordsExample, PageByPageExample, RequiredAndReadOnlyExample } from '../../../grid/examples/dataExamples'

const DESCRIPTION = `
The grid draws what its provider holds: the provider's columns become the grid's columns, and the records of its current page become the rows. This page shows how to hand the grid records of your own, what it reads from each column, how it draws and edits every data type, and how to page through more records than one page holds.

{{story: Show your own records}}

- \`dataSource\` holds the records as plain objects, one property per column.
- \`metadata\` describes the table. \`PrimaryIdAttribute\` names the property that holds each record's id, and is required. \`PrimaryNameAttribute\` names the property that holds the record's name, and \`LogicalName\` is the table's name: both go into the reference a record is opened with.
- \`setColumns\` lists the columns. What the grid reads from each is in the next section.
- \`refresh()\` loads the records. The grid never loads its provider: until something calls \`refresh()\`, it shows no rows.
- Build the provider once, here with \`React.useMemo\`: the grid reads \`provider\` only when it mounts.

## What the grid reads from a column

| Field | What the grid does with it | Left out |
|---|---|---|
| \`name\` | The column's id, also its key in \`colDefs\`, and the property that holds its value in each record. | Required |
| \`dataType\` | How the values are formatted, drawn and edited: see *Data types* below. | Required |
| \`displayName\` | The header's text. | An empty header |
| \`visualSizeFactor\` | The column's width in pixels. While every column fits, the columns share the free space in proportion to it; once they don't, the grid scrolls sideways. A width the user drags to is written back here. See *Widths* on [**Columns**](?path=/docs/grid-columns--overview). | \`200\` (\`DEFAULT_COLUMN_WIDTH\`) |
| \`order\` | The column's position, lowest first. A move the user makes is written back here. | After the ordered columns, in the order you passed them |
| \`isHidden\` | Leaves the column out of the grid. Its values can still be read from the records. | \`false\` |
| \`alignment\` | \`'left'\`, \`'center'\` or \`'right'\`. | \`'right'\` for whole numbers, decimals and currency, \`'left'\` for the rest |
| \`isPrimary\` | Draws the value as a link that opens the record, while \`enableNavigation\` is on. The \`PrimaryNameAttribute\` column is a link only with it. | \`false\` |
| \`oneClickEdit\` | Draws the cell's editor in place, without a double-click. See [**Editing**](?path=/docs/grid-editing--overview). | \`false\` |
| \`autoHeight\` | Grows the row to fit this column's text, which wraps. See [**Columns**](?path=/docs/grid-columns--overview). | \`false\` |
| \`isDraggable\` | \`false\` keeps the user from moving the column. | \`true\` |
| \`disableSorting\` | \`true\` keeps the column out of sorting. | \`false\`, and \`true\` for a multi-select option set |
| \`grouping\`, \`aggregation\` | Whether the provider groups by the column, and the total it shows for it. See [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview). | None |
| \`controls\` | A control of your own for the column's cells, honoured by the legacy client API module. See [**Legacy client API**](?path=/docs/grid-modules-legacy-client-api--overview). | None |
| \`metadata\` | What may be done with the column: see the next table. | |

### Metadata

\`metadata\` on a column says what may be done with it. When you call \`setColumns\`, the provider fills in \`IsValidForUpdate\`, \`SupportedFilterConditionOperators\`, \`CanBeGrouped\` and \`SupportedAggregations\` where you left them out, as the last column says. \`IsValidForGrid\` has no default.

| Key | What it switches on | Left out |
|---|---|---|
| \`IsValidForGrid\` | Sorting by the column, with the sorting module. | Nothing: the column cannot be sorted |
| \`IsValidForUpdate\` | Editing the column's values, while \`enableEditing\` is on. \`false\` locks the column: its header shows a lock and its cells never open an editor. A grouped column is never editable. | \`true\`, and \`false\` for File and Image columns |
| \`RequiredLevel\` | \`1\` or \`2\` make a value required. An empty value is outlined in red and its record refuses to save; while editing is on, the header shows an asterisk. See [**Editing**](?path=/docs/grid-editing--overview). | Not required |
| \`SupportedFilterConditionOperators\` | The operators the column's filter offers, with the filtering module. \`[]\` keeps the column out of filtering. | Every operator of the data type |
| \`CanBeGrouped\` | Grouping by the column, with the grouping module. A multi-select option set cannot be grouped by. | \`true\`, and \`false\` for File and Image columns |
| \`SupportedAggregations\` | The totals the column's menu offers, with the aggregation module. | \`count\`, \`countcolumn\`, \`min\`, \`max\`, \`sum\` and \`avg\` for numbers, currency and durations; \`count\`, \`countcolumn\`, \`min\` and \`max\` for dates; none for File and Image; \`count\` and \`countcolumn\` for the rest |
| \`OptionSet\` | The options of an option set, multi-select option set or two-options column, as \`{ Value, Label, Color }\`. A two-options column needs both \`0\` and \`1\`. With \`enableOptionSetColors\`, an option with a \`Color\` draws as a tag. | No labels: the cells show \`---\` |
| \`Precision\` | The decimal places of a decimal or currency value. | The user's number format |
| \`MaxLength\`, \`MinValue\`, \`MaxValue\` | \`MaxLength\` caps a Text value's length; \`MinValue\` and \`MaxValue\` bound a whole number or decimal. A value outside them is outlined in red and its record refuses to save. See [**Editing**](?path=/docs/grid-editing--overview). | No limit |

{{story: Required and read-only columns}}

## Data types

{{story: Every data type in one grid}}

| Data type | \`DataTypes\` | Drawn as | Edited with |
|---|---|---|---|
| Text | \`SingleLineText\` | The text, cut short with an ellipsis | A text box |
| Email | \`SingleLineEmail\` | A \`mailto:\` link | A text box for an email address |
| Phone | \`SingleLinePhone\` | A \`tel:\` link | A text box for a phone number |
| URL | \`SingleLineUrl\` | A link that opens in a new tab | A text box for a URL |
| Text area | \`SingleLineTextArea\` | Text that wraps, cut to the lines the row has room for | A multi-line text box |
| Multiline text | \`Multiple\` | Text that wraps, cut to the lines the row has room for | A multi-line text box |
| Whole number | \`WholeNone\` | The number in the user's number format | A number box |
| Decimal | \`Decimal\` | The number with \`Precision\` decimal places | A number box |
| Currency | \`Currency\` | The amount with its currency symbol | A number box |
| Duration | \`WholeDuration\` | Minutes as a duration: \`90\` is *1.5 hours* | A box that offers durations and takes typed ones |
| Date only | \`DateAndTimeDateOnly\` | The date | A date picker |
| Date and time | \`DateAndTimeDateAndTime\` | The date and the time | A date picker with a time |
| Option set | \`OptionSet\` | The option's label, or a tag in its colour | A drop-down of the options |
| Multi-select option set | \`MultiSelectOptionSet\` | The labels separated by \`;\`, or a tag for each | A drop-down that ticks several options |
| Two options | \`TwoOptions\` | The label of \`0\` or \`1\`, or a tag | A toggle |
| Lookup | \`LookupSimple\`, \`LookupOwner\`, \`LookupCustomer\`, \`LookupRegarding\` | A link for each record it references | A lookup box that searches the referenced tables in Dataverse |
| File | \`File\` | An icon for its type and its name, which links to the file | Not editable |
| Image | \`Image\` | A thumbnail and its name | Not editable |
| Language, time zone | \`WholeLanguage\`, \`WholeTimeZone\` | The number itself, such as \`1033\` | A text box |

- Emails, phones, URLs, lookups and the primary column are links only while \`enableNavigation\` is on, which is the default; without it they draw as text. A file's link is always there.
- An empty value draws as \`---\`.
- Tags need \`enableOptionSetColors\` and a \`Color\` on the option.

In a \`MemoryDataProvider\`, a record holds its values as plain data, and \`record.getValue()\` hands some of them back in another shape:

| Data type | What the record holds | What \`record.getValue()\` returns |
|---|---|---|
| Option set | The option's \`Value\`, such as \`2\` | A string, such as \`'2'\` |
| Multi-select option set | An array of values, such as \`[1, 4]\` | One string, such as \`'1,4'\` |
| Two options | \`true\` or \`false\` | \`'1'\` or \`'0'\` |
| Date only | An ISO string, such as \`'2026-09-30'\` | The date, such as \`'2026-09-30'\` |
| Date and time | An ISO string, such as \`'2026-09-30T09:30:00Z'\` | An ISO string |
| Duration | A number of minutes | The same number |
| Lookup | An array of references, such as \`[{ entityType: 'contact', id: 'contact-1', name: 'Jana Nováková' }]\` | An array of \`{ etn, id: { guid }, name }\` |
| File | Its id in \`<column>\`, beside \`<column>.filename\`, \`<column>.fileurl\`, \`<column>.filesizeinbytes\` and \`<column>.mimetype\` | \`{ fileName, fileUrl, fileSize, mimeType }\` |
| Image | Its content as base64 in \`<column>\`, beside \`<column>.filename\`, \`<column>.mimetype\` and \`<column>.thumbnailurl\` or \`<column>.fileurl\`. Without content in \`<column>\`, it draws as \`---\`. | \`{ fileName, fileContent, thumbnailUrl, fileUrl, mimeType }\` |

Compare option set and two-options values as strings, such as \`record.getValue('billable') === '1'\`, or convert them with \`Number()\`: \`'0'\` is truthy.

## Paging

The grid shows one page of its provider, and has no pager of its own. A provider holds 50 records a page unless you set another size, so a provider over 300 records shows the first 50, and nothing tells the user that there are more. Set the page size with \`getPaging().setPageSize(n)\` before you call \`refresh()\`, or draw a pager of your own over \`getPaging()\`:

{{story: Browse a large catalogue page by page}}

| Member of \`getPaging()\` | What it is |
|---|---|
| \`pageNumber\` | The page the grid shows, from 1. |
| \`pageSize\` | How many records a page holds: 50 unless you set it. |
| \`totalResultCount\` | How many records there are across every page. |
| \`hasPreviousPage\`, \`hasNextPage\` | Whether there is a page before or after this one. |
| \`loadPreviousPage()\`, \`loadNextPage()\`, \`loadExactPage(n)\` | Loads that page; the grid draws it once it is in. |
| \`setPageSize(n)\` | Sets the page size for the next load. Call \`refresh()\` after it, which goes back to page 1. |
| \`reset()\` | Loads page 1 again. |

\`getPaging()\` returns the paging as it is at that moment, so read it again after every load, for example in \`onDataLoaded\`. Sorting and filtering run in the provider, over every record, and go back to page 1.

## The examples' data

Most examples in these docs are handed a \`provider\` over one of four datasets, already loaded, with every record on one page. Their columns can be sorted, filtered and grouped by, every column but files and images can be edited, and the number columns offer totals.

| Dataset | Records | Columns |
|---|---|---|
| Sales pipeline | 30 deals of a sales team | Deal (the name), Account manager, Stage (Qualify, Propose, Negotiate, Won, Lost), Products (multi-select), Value (currency), Probability (%), Close date, Time spent (duration), Recurring (two options) |
| Timesheets | 24 entries a consulting team logged last week | Work done (the name), Employee, Project, Date, Hours (decimal), Billable, Hourly rate, Status (Draft, Submitted, Approved, Rejected), Comment (multiline) |
| Support tickets | 36 tickets a support desk opened over the last week | Ticket, Subject (the name), Customer, Priority (High, Normal, Low), Status (New, In progress, Waiting on customer, Resolved), Channel, Assigned to, Opened, Respond by (date and time), Time spent, Escalated |
| Products | 16 products of an office furniture shop | Photo (image, read-only), Product (the name), SKU, Category, Price, In stock, Reorder at, Supplier, Last restocked, Discontinued, Product page (URL) |

The timesheets, tickets and products are dated from today, so they never age. The sales pipeline also has columns of the other data types, such as email, phone, website, a contract file, a logo and notes, which some examples add. In **Code**, \`createDealsProvider()\`, \`createTimesheetsProvider()\`, \`createTicketsProvider()\` and \`createProductsProvider()\` build a fresh copy of each dataset, not yet loaded.

Every example has three tabs. **Preview** runs it. **Code** is the example itself: edit it and the preview runs your version over the same records. **Data** shows, as JSON, the provider the example draws, even one it builds itself: the table's metadata, the columns with the keys the provider filled in, and the records with every saved change. **Reset** brings back the original code and data, and **Copy code** copies the code.
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
                story: `An office supplies catalogue built from scratch: a \`MemoryDataProvider\` over an array, \`setColumns\` with \`IsValidForGrid\` on every column, and \`refresh()\`. Open Unit price's menu and sort the catalogue by it.`,
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
                story: `A furniture catalogue of 300 products shown 25 at a time: \`getPaging().setPageSize(25)\` before the first \`refresh()\`, and a pager under the grid that reads \`getPaging()\` again in \`onDataLoaded\`. Page through it, change the page size, or sort by Price: the provider sorts all 300 and goes back to page 1.`,
            },
        },
    },
}
