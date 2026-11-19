import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { GuideMap } from '../../grid/guide/gridGuide'
import { ShowcaseExample } from '../../grid/guide/overviewExamples'

const DESCRIPTION = `
A grid shows a provider's records as rows and columns on AG Grid, each value drawn with the control for its data type. Everything beyond showing them, from editing to grouping, is a module you add, and hooks let your code change what the grid decides. Try it below: pick the *Closing deals* preset, tick two open deals, then hover one and press **Mark as won** at the right end of its row.

{{canvas: Explore a sales pipeline}}

## What you see

| You see | Drawn by | Taught in |
|---|---|---|
| The deals, each value drawn for its data type | \`ClientSideGrid\` in \`DatasetControl.Body\` | [**Your first deal grid**](?path=/docs/controls-grid-guide-basics-your-first-deal-grid--overview) |
| An editor on a double-click, and with *Auto-save* a spinner, then a check, at the start of a saved row | The editing module | [**Edit and save**](?path=/docs/controls-grid-guide-basics-edit-and-save--overview) |
| A red icon at the start of a row the CRM refused, and the lock in the header of *Account manager* | The CRM in *deals.ts*, and the columns' metadata | [**Check what users enter**](?path=/docs/controls-grid-guide-basics-check-what-users-enter--overview) |
| The sort items and **Filter By** in a column's menu, and the arrow and funnel after a header's name | The sorting and filtering modules | [**Sort and filter**](?path=/docs/controls-grid-guide-basics-sort-and-filter--overview) |
| Checkboxes, highlighted blocks of cells, and Ctrl+C | The row selection, cell selection and clipboard modules | [**Select and copy**](?path=/docs/controls-grid-guide-features-select-and-copy--overview) |
| Group rows, and the totals row under the deals | The grouping and aggregation modules | [**Group and total**](?path=/docs/controls-grid-guide-features-group-and-total--overview) |
| Won and lost deals locked, with a lock at the start of their rows (*Closing deals*) | A row lock hook | [**Lock closed deals**](?path=/docs/controls-grid-guide-features-lock-closed-deals--overview) |
| *Deal* pinned and linked to a form, and *Recurring* edited right in its cell | Column definitions and \`openRecord\` hooks | [**Shape the columns**](?path=/docs/controls-grid-guide-make-it-yours-shape-the-columns--overview) |
| Tags in colour, zebra rows, compact rows, tinted close dates and values, and won and lost deals in green and red | Props and cell theme hooks | [**Colours and density**](?path=/docs/controls-grid-guide-make-it-yours-colours-and-density--overview) |
| **Push a week** in an overdue close date, an icon after *Close date*, *Quick views* in a menu, and **Mark as won** in a column of its own | Cell commands, header adornments and menu sections | [**Cells and headers of your own**](?path=/docs/controls-grid-guide-make-it-yours-cells-and-headers-of-your-own--overview) |
| An icon before an overdue or due close date | A control parameters hook | [**Hooks**](?path=/docs/controls-grid-guide-advanced-hooks--overview) |

## How it fits together

The grid draws the provider of the DatasetControl around it; modules add features to it, and hooks change what it decides as it draws.

| Part | Does | Works on |
|---|---|---|
| The provider | Holds the deals and their columns, and what is sorted, filtered, grouped, selected and unsaved | Returned by the DatasetControl's \`onLoad\` |
| \`ClientSideGrid\`, \`ServerSideGrid\` | Draw the provider; the row model each loads decides how the rows arrive | The DatasetControl's provider |
| Modules | Each adds one feature, such as editing or grouping, for as long as the grid is mounted | The grid of each mount |
| Hooks | Each changes one decision the grid makes as it draws, such as a lock or a colour | A service or a module of the grid |

## The guide

The guide builds a deal grid one step at a time, from a read-only grid to a module of your own.

{{block: guide}}

Coming from the DatasetControl guide? Its deal list is the frame [**Your first deal grid**](?path=/docs/controls-grid-guide-basics-your-first-deal-grid--overview) starts from.

## Words you will meet

| Word | Means | Explained in |
|---|---|---|
| Module | A feature you add to the grid through \`modules\`, such as editing or grouping. | [**Edit and save**](?path=/docs/controls-grid-guide-basics-edit-and-save--overview) |
| Save status | The narrow column at the start of each row: a spinner while the row saves, a check once it has, and a red icon when it was refused. | [**Edit and save**](?path=/docs/controls-grid-guide-basics-edit-and-save--overview) |
| Lock | What keeps a column, a row or a cell from being edited. | [**Lock closed deals**](?path=/docs/controls-grid-guide-features-lock-closed-deals--overview) |
| Summary row | A group row or the totals row: a record that stands for many deals. | [**Group and total**](?path=/docs/controls-grid-guide-features-group-and-total--overview) |
| Hook | A function the grid asks as it draws, which changes one decision, such as a lock or a colour. | [**Lock closed deals**](?path=/docs/controls-grid-guide-features-lock-closed-deals--overview) |
| Row model | How the grid gets its rows: all at once with \`ClientSideGrid\`, or a group at a time with \`ServerSideGrid\`. | [**Open groups on demand**](?path=/docs/controls-grid-guide-features-open-groups-on-demand--overview) |
| Service | One part of the grid, found by its key on \`grid.services\`, such as \`columns\`. | [**Shape the columns**](?path=/docs/controls-grid-guide-make-it-yours-shape-the-columns--overview) |
| Column definition | AG Grid's \`ColDef\` for one column, with the grid's own \`context\`, which a hook can change. | [**Shape the columns**](?path=/docs/controls-grid-guide-make-it-yours-shape-the-columns--overview) |
| The deal grid | The ribbon of *Select and copy* over a \`ClientSideGrid\` with row selection, editing, sorting and filtering: what every step of *Make it yours* and *Advanced* starts from. | [**Shape the columns**](?path=/docs/controls-grid-guide-make-it-yours-shape-the-columns--overview) |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Your first deal grid', iconName: 'Education', href: '?path=/docs/controls-grid-guide-basics-your-first-deal-grid--overview', text: 'Start the guide: the team\'s deals in a read-only grid.' },
    { title: 'Reference', iconName: 'Table', href: '?path=/docs/controls-grid-reference--overview', text: 'Every prop, event, module, hook, service key and slot of the Grid.' },
    { title: 'DatasetControl', iconName: 'ViewDashboard', href: '?path=/docs/controls-datasetcontrol-overview--overview', text: 'The frame around the grid: views, a ribbon, search and paging.' },
]

const meta = {
    title: 'Controls/Grid/Overview',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { guide: () => <GuideMap />, explore: () => <ExploreCards cards={EXPLORE} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ExploreASalesPipeline: Story = {
    name: 'Explore a sales pipeline',
    render: () => renderStory(<ShowcaseExample />),
}
