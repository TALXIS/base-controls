import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../grid/guide/gridGuide'
import { EveryDataTypeExample, YourFirstDealGridExample } from '../../../../grid/guide/basics/yourFirstDealGridExamples'

const STEP = 'Your first deal grid'

const DESCRIPTION = `
{{block: progress}}

The guide builds the sales team's deal grid, one step at a time. This first step shows the team's 30 deals in a read-only grid, each value drawn for its data type.

{{canvas: Your first deal grid}}

## How it works

A grid draws the records of a provider as rows, and the provider's columns as its columns.

| In the code | What it is |
|---|---|
| \`deals\` | The 30 deals of the docs dataset, copied once outside \`onLoad\`, so a saved value stays. |
| \`metadata\` | A deal's id column, its name column and its entity. |
| \`dealColumns\` | The ten columns the grid shows, each copied from the docs dataset, with its \`order\`. |
| \`DealsProvider\` | The provider: a \`MemoryDataProvider\` that stands in for your CRM. The next step saves to it. |
| \`loadDeals\` | The DatasetControl's \`onLoad\`: it returns \`{ provider }\`, a new \`DealsProvider\` over the same \`deals\` on every load. |
| \`DatasetControl\` | Loads the deals and hands the provider to every part inside it. |
| \`DatasetControl.Body\` | The region that holds the grid. |
| \`ClientSideGrid\` | Draws the provider of the DatasetControl around it. It takes no provider prop. |

The DatasetControl around the grid is the one [**Your first deal list**](?path=/docs/controls-datasetcontrol-guide-basics-your-first-deal-list--overview) builds; to draw a provider without one, see *Hand it to controls* on [**Data providers**](?path=/docs/concepts-data-providers--overview). Like every control, the grid needs the root providers from [**Your first list**](?path=/docs/concepts-guide-basics-your-first-list--overview); the examples of this guide already have them.

\`ClientSideGrid\` holds every row at once. \`ServerSideGrid\` fetches the rows of a group as the group opens, as [**Open groups on demand**](?path=/docs/controls-grid-guide-features-open-groups-on-demand--overview) shows. Either grid shows the provider's current page; the DatasetControl's paging parts move between pages, as [**Search and page**](?path=/docs/controls-datasetcontrol-guide-features-search-and-page--overview) shows.

**Columns.** Each of the provider's columns is an \`IColumn\`. Every key is under *Columns* on [**Reference**](?path=/docs/controls-grid-reference--overview).

| Key | What it is |
|---|---|
| \`name\` | The column's id, and the property of a record that holds its value |
| \`dataType\` | How the value is drawn, and edited once the grid can edit |
| \`displayName\` | The header's text |
| \`visualSizeFactor\` | The width in pixels |
| \`order\` | The position, lowest first |
| \`metadata\` | What the column allows, filled in by the provider; [**Check what users enter**](?path=/docs/controls-grid-guide-basics-check-what-users-enter--overview) sets it |

## Every data type

All twenty deal columns, one of each data type but lookups, over the same deals.

{{canvas: Every data type}}

| Data type | \`DataTypes\` | Shown as |
|---|---|---|
| Text | \`SingleLineText\` | Text, cut with an ellipsis |
| Email, phone, URL | \`SingleLineEmail\`, \`SingleLinePhone\`, \`SingleLineUrl\` | A link |
| Text area, multiline text | \`SingleLineTextArea\`, \`Multiple\` | Text that wraps up to the row's height, with a grip that drags the row taller |
| Whole number, decimal | \`WholeNone\`, \`Decimal\` | The number in the user's format |
| Currency | \`Currency\` | The amount with its symbol |
| Duration | \`WholeDuration\` | Minutes as a duration: \`90\` is *1.5 hours* |
| Date only, date and time | \`DateAndTimeDateOnly\`, \`DateAndTimeDateAndTime\` | The date, with the time if it has one |
| Option set, two options | \`OptionSet\`, \`TwoOptions\` | The option's label |
| Multi-select option set | \`MultiSelectOptionSet\` | The labels, separated by semicolons |
| Lookup | \`LookupSimple\`, \`LookupOwner\`, \`LookupCustomer\`, \`LookupRegarding\` | A link to each record |
| File | \`File\` | An icon of the file's type, and a link named after the file |
| Image | \`Image\` | Its thumbnail, and the file's name |
| Language | \`WholeLanguage\` | The language's name |
| Time zone | \`WholeTimeZone\` | The number |
| Any type, empty | | \`---\` |

Emails, phones, URLs, lookups and a column with \`isPrimary: true\` draw as links unless the grid has \`enableNavigation={false}\`. Option sets and two options draw as tags in their options' colours with \`enableOptionSetColors\`, as [**Colours and density**](?path=/docs/controls-grid-guide-make-it-yours-colours-and-density--overview) shows.

How \`record.getValue()\` shapes option sets, two options and dates is under *Load and read* on [**Data providers**](?path=/docs/concepts-data-providers--overview). Files and images come back as objects:

| Data type | The record holds | \`getValue()\` returns |
|---|---|---|
| File | The file's id in \`<column>\`, and \`<column>.filename\`, \`.fileurl\`, \`.filesizeinbytes\`, \`.mimetype\` | \`{ fileAttachmentId, fileName, fileUrl, fileSize, mimeType }\` |
| Image | The image in base64 in \`<column>\`, and \`<column>.filename\`, \`.fileurl\`, \`.filesizeinbytes\`, \`.mimetype\`, \`.thumbnailurl\` | \`{ fileContent, fileName, fileUrl, fileSize, mimeType, thumbnailUrl }\` |

## Try it

- Open **Data**: the provider holds the 30 deals and the ten columns.
- In **Code**, open *deals.ts* and add \`'products'\` after \`'stage'\` in \`COLUMN_NAMES\`: *Products* shows each deal's products, separated by semicolons.
- Remove \`'notes'\`: the *Notes* column goes.
- In *Every data type*, scroll right: *Email* and *Website* are links, *Contract* is a link named after its file, and *Logo* shows a blue thumbnail and the image's name.

## Remember

- The grid draws the provider of the DatasetControl around it, and takes no provider of its own.
- A column's data type decides how its values look.
- \`ClientSideGrid\` holds every row at once.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Grid/Guide/Basics/Your first deal grid',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { progress: () => <GuideProgress current={STEP} />, navigation: () => <GuideNavigation current={STEP} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const YourFirstDealGrid: Story = {
    name: 'Your first deal grid',
    tags: ['!dev'],
    render: () => renderStory(<YourFirstDealGridExample />),
}

export const EveryDataType: Story = {
    name: 'Every data type',
    tags: ['!dev'],
    render: () => renderStory(<EveryDataTypeExample />),
}
