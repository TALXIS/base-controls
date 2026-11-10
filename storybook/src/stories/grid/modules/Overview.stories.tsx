import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { OpenTicketGroupsExample, PickModulesExample } from '../../../grid/examples/modulesExamples'

const DESCRIPTION = `
Editing, selecting, sorting, filtering, grouping, totals and copying are modules: you pass the ones you want in \`modules\`, and a feature you leave out is not there at all. How the grid gets its rows is a module too, the row model, which \`ClientSideGrid\` and \`ServerSideGrid\` load for you. Try it below: turn off *Sorting* and open a column's menu.

{{canvas: Pick the features of a ticket queue}}

## The modules

| Module | Adds | See |
|---|---|---|
| \`createClientSideRowModelModule()\`, \`createServerSideRowModelModule()\` | How the grid gets its rows; \`ClientSideGrid\` and \`ServerSideGrid\` load one | *Row models* below |
| \`createEditingModule()\` | Editing in place, a save status per row, locks and saving | [**Editing**](?path=/docs/controls-grid-modules-editing--overview) |
| \`createRowSelectionModule({ mode })\`, \`createCellSelectionModule()\`, \`createClipboardModule()\` | Selecting rows, highlighting blocks of cells, copying and pasting | [**Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview) |
| \`createSortingModule()\`, \`createFilteringModule()\` | Sorting and filtering from a column's menu | [**Sorting and filtering**](?path=/docs/controls-grid-modules-sorting-and-filtering--overview) |
| \`createGroupingModule()\`, \`createAggregationModule()\` | Grouping the rows by a column, and totals | [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview) |
| \`createLegacyClientApiCompatibilityModule()\` | What Power Apps client scripts set on records | [**Legacy client API**](?path=/docs/controls-grid-modules-legacy-client-api--overview) |
| \`createLicenseModule({ key })\` | Your AG Grid Enterprise licence | *Enterprise features and the licence* below |
| An \`IGridModule\` of your own | A feature of your own | [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview) |

Which columns offer a feature comes from the provider's columns: \`disableSorting\`, and the metadata keys \`SupportedFilterConditionOperators\`, \`CanBeGrouped\` and \`SupportedAggregations\` (see [**Data**](?path=/docs/controls-grid-data--overview)). Once loaded, a module is reached by its name: see [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview).

## Switch a module on or off

\`modules\` and every module's options are read at mount: to switch a module or change its options, give the grid a new \`key\`, as the queue above does (see *Change a prop that is read at mount* on [**Props and events**](?path=/docs/controls-grid-props-and-events--overview)). A module's events are on its instance: in \`onSetup\`, reach it with \`grid.modules.observe(name, …)\`.

What the provider holds survives the remount: its records, sorting, filters, grouping and selection. A module you switch off leaves its state on the provider, so clear that too: when grouping goes away, remove each of \`provider.grouping.getGroupBys()\` with \`removeGroupBy(alias)\` and call \`provider.refresh()\`, as the queue does.

## Text and looks

Modules take no text of their own: to change their labels, see [**Localization**](?path=/docs/concepts-localization--overview). Sorting, filtering, grouping and aggregation take a \`components\` option for what they draw, and the editing and row selection modules draw columns of their own, which you restyle on their column definitions. Their pages list what they draw under *Changing how it looks*.

## Enterprise features and the licence

The grid runs on AG Grid Community. Server-side rows, cell selection, the clipboard and grouping use AG Grid Enterprise, which needs a licence from AG Grid. The packages come with \`@talxis/base-controls\`; to license them, pass your key to \`createLicenseModule\`, as the example under *Row models* does, and leave the module out while there is no key.

The key holds for the whole page: once one grid registers it, every grid on the page is licensed. Without a key, AG Grid logs a licence message to the console and, on any host but \`localhost\` and \`127.0.0.1\`, draws a watermark over every grid on the page.

## Row models

The row model decides how the grid gets its rows, and you pick it with the component: \`ClientSideGrid\` loads the client-side row model ahead of your \`modules\`, and \`ServerSideGrid\` the server-side one. Both show the provider's current page (see *Paging* on [**Data**](?path=/docs/controls-grid-data--overview)), and without grouping they show the same rows. They differ once the rows are grouped:

| Component | Row model | A group's records | Opening a group | Requests to your data source |
|---|---|---|---|---|
| \`ClientSideGrid\` | \`createClientSideRowModelModule()\` | Fetched for every group, at every level, as soon as the provider loads | Instant, once the groups have arrived | One per group, all at once, after every load |
| \`ServerSideGrid\` | \`createServerSideRowModelModule()\`, AG Grid Enterprise | Fetched when the group opens | Shows a loading row until the records arrive | One per group the user opens; after a reload, one per group still open |

Use \`ClientSideGrid\` by default, and \`ServerSideGrid\` when users group by a column with many values or into big groups. \`Grid\` itself loads no row model, so its \`modules\` must hold exactly one of the two.

{{story: Open ticket groups on demand}}

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Editing', iconName: 'Edit', href: '?path=/docs/controls-grid-modules-editing--overview', text: 'Edit values in place, check them and save them.' },
    { title: 'Grouping and totals', iconName: 'GroupList', href: '?path=/docs/controls-grid-modules-grouping-and-totals--overview', text: 'Group the rows by a column, and total its values.' },
    { title: 'Write a module', iconName: 'Puzzle', href: '?path=/docs/controls-grid-extending-write-a-module--overview', text: 'Package a feature of your own as a module.' },
]

const meta = {
    title: 'Controls/Grid/Modules',
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

export const OpenTicketGroupsOnDemand: Story = {
    name: 'Open ticket groups on demand',
    render: () => renderStory(<OpenTicketGroupsExample />),
    parameters: {
        docs: {
            description: {
                story: `A support queue grouped by customer, against a slow service that counts its fetches, drawn by \`ClientSideGrid\` or \`ServerSideGrid\`. Try: pick *Server side (Enterprise)* and open a customer.`,
            },
        },
    },
}

export const PickTheFeaturesOfATicketQueue: Story = {
    name: 'Pick the features of a ticket queue',
    render: () => renderStory(<PickModulesExample />),
}
