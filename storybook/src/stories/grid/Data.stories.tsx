import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { EveryDataTypeExample, OwnRecordsExample, RequiredAndReadOnlyExample } from '../../grid/examples/dataExamples'

const DESCRIPTION = `
The grid draws what its provider holds: the provider's columns become the grid's columns, and the records of the current page become its rows. This page lists what the grid reads from each column, and how it draws and edits each data type. Creating and loading the provider is on [**Data providers**](?path=/docs/data-providers--overview).

{{story: Show your own records}}

## Provider columns

Each of the provider's columns is an \`IColumn\`. The grid reads these keys; how to change a column's definition on top of them is on [**Columns**](?path=/docs/grid-columns--overview).

| Key | Default | Description |
|---|---|---|
| \`name\` | Required | The column's id, its key in \`colDefs\`, and the record property that holds its value. |
| \`dataType\` | Required | How values are formatted, drawn and edited. See *Data types* below. |
| \`displayName\` | Empty | The header's text. |
| \`visualSizeFactor\` | \`200\` | The width in pixels. Columns share spare space in proportion to it. A resize is written back here. |
| \`order\` | The order you passed | The position, lowest first. A move is written back here. |
| \`isHidden\` | \`false\` | Leaves the column out of the grid. |
| \`isPrimary\` | \`false\` | Draws the value as a link that opens the record. |
| \`disableSorting\` | \`false\`; \`true\` for multi-select option sets | Keeps the column out of sorting. |
| \`grouping\`, \`aggregation\` | None | Groups by the column, or totals it. See [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview). |
| \`metadata\` | Filled in by the provider | What can be done with the column. See *Metadata* below. |

### Metadata

A column's \`metadata\` says what can be done with it. The provider fills in the keys you leave out, as the *Default* column says.

| Key | Default | Description |
|---|---|---|
| \`IsValidForUpdate\` | \`true\`; \`false\` for files and images | Lets the column be edited. \`false\` locks it and shows a lock in its header. |
| \`RequiredLevel\` | Not required | \`1\` or \`2\` make a value required: an empty one is outlined in red and the record won't save. |
| \`SupportedFilterConditionOperators\` | All operators of the data type | The operators its filter offers. \`[]\` turns filtering off. |
| \`CanBeGrouped\` | \`true\`; \`false\` for files, images and multi-select option sets | Lets the column be grouped by. |
| \`SupportedAggregations\` | All for numbers, currency and durations; \`count\`, \`countcolumn\`, \`min\`, \`max\` for dates; \`count\` and \`countcolumn\` for the rest | The totals its menu offers. |
| \`OptionSet\` | No labels | The options, as \`{ Value, Label, Color }\`. Two options need \`0\` and \`1\`. With \`enableOptionSetColors\`, an option with a \`Color\` is drawn as a tag. |
| \`Precision\` | The user's number format | Decimal places of a decimal or currency value. |
| \`MaxLength\`, \`MinValue\`, \`MaxValue\` | No limit | Limits on a text length or a number. A value outside them won't save. |

{{story: Mark columns required or read-only}}

## Data types

Each data type has its own way of drawing a value and its own editor.

{{story: See every data type}}

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
| Lookup | \`LookupSimple\`, \`LookupOwner\`, \`LookupCustomer\`, \`LookupRegarding\` | A link to each record | A lookup that searches Dataverse; it needs an Xrm environment and a \`FetchXmlDataProvider\` |
| File, image | \`File\`, \`Image\` | The file's name, or a thumbnail | Not editable |
| Language, time zone | \`WholeLanguage\`, \`WholeTimeZone\` | The number | A text box |

Links need \`enableNavigation\`, which is on by default. An empty value is shown as \`---\`.

## Read values

\`record.getValue()\` returns some types in another shape than the record holds. Reading records is under *Read records* on [**Data providers**](?path=/docs/data-providers--overview).

| Data type | Record holds | \`getValue()\` returns |
|---|---|---|
| Option set | \`2\` | \`'2'\` |
| Multi-select option set | \`[1, 4]\` | \`'1,4'\` |
| Two options | \`true\` | \`'1'\` |
| Date only, date and time | An ISO string | A \`Date\` in local time |
| Lookup | \`[{ entityType, id, name }]\` | \`[{ etn, id: { guid }, name }]\` |
| File | \`<column>\` plus \`<column>.filename\`, \`.fileurl\`, \`.filesizeinbytes\`, \`.mimetype\` | \`{ fileName, fileUrl, fileSize, mimeType }\` |
| Image | Base64 content in \`<column>\` plus \`<column>.filename\`, \`.mimetype\`, \`.thumbnailurl\` | \`{ fileName, fileContent, thumbnailUrl, fileUrl, mimeType }\` |

## Paging

The grid shows the records of the provider's current page, and its page size decides how many rows that is. Moving between pages is the provider's: in a DatasetControl, its *Paging* parts drive it (see [**DatasetControl › Paging**](?path=/docs/datasetcontrol-parts-paging--overview)), and from your code, \`provider.getPaging()\` does (see *Sort, filter, search and page* on [**Data providers**](?path=/docs/data-providers--overview)). Grouping changes what a page holds: see [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview).
`

const meta = {
    title: 'Grid/Data',
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
                story: `An office supplies catalogue in a \`MemoryDataProvider\`. Try: sort it by *Unit price* from the column's menu.`,
            },
        },
    },
}

export const RequiredAndReadOnlyColumns: Story = {
    name: 'Mark columns required or read-only',
    render: () => renderStory(<RequiredAndReadOnlyExample />),
    parameters: {
        docs: {
            description: {
                story: `A stock count with editing and auto-save on. *SKU*, *Product* and *On record* set \`IsValidForUpdate: false\`, so their headers show a lock, and *Counted* sets \`RequiredLevel: 2\`. Try: clear a count, then open the red icon at the start of its row to see why it was not saved.`,
            },
        },
    },
}

export const EveryDataTypeInOneGrid: Story = {
    name: 'See every data type',
    render: () => renderStory(<EveryDataTypeExample />),
    parameters: {
        docs: {
            description: {
                story: `A supplier directory with a column of each data type and \`enableOptionSetColors\`. Try: double-click a cell to open its editor, or click a supplier or a contact to see what the link opens.`,
            },
        },
    },
}
