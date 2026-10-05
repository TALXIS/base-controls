import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EveryDataTypeExample, OwnRecordsExample, RequiredAndReadOnlyExample } from '../../../grid/examples/dataExamples'

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
| \`isPrimary\` | Draws the value as a link that opens the record. | \`false\` |
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
                story: `A supplier directory with a column of each data type in the table below, with \`enableEditing\` and \`enableOptionSetColors\`. Double-click a cell to open its editor, or click a Supplier or a Contact: \`onOpenRecord\` says what the link opens. Contact is read-only because a lookup's editor currently only works in an Xrm environment with a \`FetchXmlDataProvider\`.`,
            },
        },
    },
}
