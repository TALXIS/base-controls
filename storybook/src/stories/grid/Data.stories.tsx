import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { EveryDataTypeExample, RequiredAndReadOnlyExample, ValueTypesExample } from '../../grid/examples/dataExamples'

const DESCRIPTION = `
The grid draws whatever its data provider holds: the provider's columns become the grid's columns, and the records of its current page the rows. Each column's data type decides how its values are formatted, drawn and edited. Try it below: open **Code** and change the \`dataType\` of *Unit price* to \`DataTypes.Decimal\`.

{{canvas: Office supplies}}

## Describe a column

Each of the provider's columns is an \`IColumn\`. Its \`name\` is the column's id: the record property that holds its value, and its column definition's \`colId\`. Its \`dataType\` decides how the value is drawn and edited, and \`displayName\` is the header's text. Every key the grid reads is under *Reference* below.

Creating and loading the provider is on [**Data providers**](?path=/docs/concepts-data-providers--overview); changing a column on top of it, without touching the provider, is on [**Columns**](?path=/docs/controls-grid-columns--overview).

## Say what a column allows

A column's \`metadata\` says what can be done with it, and the provider fills in the keys you leave out. Without the [**Editing**](?path=/docs/controls-grid-modules-editing--overview) module every cell is read-only; with it, \`IsValidForUpdate: false\` locks the column. \`RequiredLevel\`, \`MaxLength\`, \`MinValue\` and \`MaxValue\` make a value invalid in any grid (see *Validation* on [**Editing**](?path=/docs/controls-grid-modules-editing--overview)).

\`OptionSet\` holds the options of an option set or two options column, and \`Precision\` the decimal places of a number. Sorting, filtering, grouping and totals read keys of their own, listed under *Metadata* below.

{{story: Mark columns required or read-only}}

## Data types

Each data type has its own way of drawing a value, and its own editor while the editing module is on; every type is under *Reference* below. Emails, phones, URLs, lookups and the primary column draw as links unless \`enableNavigation\` is \`false\`.

{{story: See every data type}}

## Read files and images

How \`record.getValue()\` shapes option sets, two options, dates and lookups is under *Load and read* on [**Data providers**](?path=/docs/concepts-data-providers--overview). Files and images are read like this:

| Data type | Record holds | \`getValue()\` returns |
|---|---|---|
| File | \`<column>\` plus \`<column>.filename\`, \`.fileurl\`, \`.filesizeinbytes\`, \`.mimetype\` | \`{ fileName, fileUrl, fileSize, mimeType }\` |
| Image | Base64 content in \`<column>\` plus \`<column>.filename\`, \`.mimetype\`, \`.thumbnailurl\` | \`{ fileName, fileContent, thumbnailUrl, fileUrl, mimeType }\` |

## Paging

The grid shows the records of the provider's current page, so the page size decides how many rows it has. Inside a DatasetControl, its paging parts move between pages (see [**Paging**](?path=/docs/controls-datasetcontrol-parts-paging--overview)); from your code, \`provider.getPaging()\` does (see *Sort, filter, search and page* on [**Data providers**](?path=/docs/concepts-data-providers--overview)).

## Reference

### Column keys

| Key | Default | Description |
|---|---|---|
| \`name\` | Required | The column's id, its column definition's \`colId\`, and the record property that holds its value. |
| \`dataType\` | Required | How values are formatted, drawn and edited. |
| \`displayName\` | Empty | The header's text. |
| \`visualSizeFactor\` | \`200\` | The width in pixels; columns share spare space by it. A resize is written back here. |
| \`order\` | The order you passed | The position, lowest first. A move is written back here. |
| \`isHidden\` | \`false\` | Leaves the column out of the grid. |
| \`isPrimary\` | \`false\` | Draws the value as a link that opens the record. |
| \`disableSorting\` | \`false\`; \`true\` for multi-select option sets | Keeps the column out of sorting. |
| \`grouping\`, \`aggregation\` | None | Groups by the column, or totals it: see [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview). |
| \`metadata\` | Filled in by the provider | See *Metadata*. |

### Metadata

| Key | Default | Description |
|---|---|---|
| \`IsValidForUpdate\` | \`true\`; \`false\` for files and images | \`false\` locks the column, with editing. |
| \`RequiredLevel\` | Not required | \`1\` or \`2\` make an empty value invalid. |
| \`SupportedFilterConditionOperators\` | Every operator of the data type | The operators its filter offers; \`[]\` turns filtering off. |
| \`CanBeGrouped\` | \`true\`; \`false\` for files and images | Lets the column be grouped by; a multi-select option set never is. |
| \`SupportedAggregations\` | All for numbers, currency and durations; \`count\`, \`countcolumn\`, \`min\`, \`max\` for dates; none for files and images; \`count\`, \`countcolumn\` for the rest | The totals its menu offers. |
| \`OptionSet\` | No labels | The options, as \`{ Value, Label, Color }\`; two options need \`0\` and \`1\`. |
| \`Precision\` | The user's number format | Decimal places of a decimal or currency value. |
| \`MaxLength\`, \`MinValue\`, \`MaxValue\` | No limit | A text length or a number outside them is invalid. |

### Data types

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
| Lookup | \`LookupSimple\`, \`LookupOwner\`, \`LookupCustomer\`, \`LookupRegarding\` | A link to each record | A Dataverse search; needs Xrm and a \`FetchXmlDataProvider\` |
| File, image | \`File\`, \`Image\` | The file's name, or a thumbnail | Not editable |
| Language, time zone | \`WholeLanguage\`, \`WholeTimeZone\` | The number | A text box |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Columns', iconName: 'TripleColumn', href: '?path=/docs/controls-grid-columns--overview', text: 'Change the provider\'s columns, or add your own, with a hook.' },
    { title: 'Editing', iconName: 'Edit', href: '?path=/docs/controls-grid-modules-editing--overview', text: 'Edit values in place, check them and save them.' },
    { title: 'Data providers', iconName: 'Database', href: '?path=/docs/concepts-data-providers--overview', text: 'Create, load, sort and save the records the grid shows.' },
]

const meta = {
    title: 'Controls/Grid/Data',
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

export const OfficeSupplies: Story = {
    name: 'Office supplies',
    render: () => renderStory(<ValueTypesExample />),
}

export const RequiredAndReadOnlyColumns: Story = {
    name: 'Mark columns required or read-only',
    render: () => renderStory(<RequiredAndReadOnlyExample />),
    parameters: {
        docs: {
            description: {
                story: `A stock count with auto-save, where *SKU*, *Product* and *On record* set \`IsValidForUpdate: false\` and *Counted* sets \`RequiredLevel: 2\`. Try: clear a count.`,
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
                story: `A supplier directory with a column of each data type and \`enableOptionSetColors\`. Try: double-click a cell to open its editor.`,
            },
        },
    },
}
