import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { GuideMap } from '../../dataset-control/guide/datasetControlGuide'
import { DealListExample } from '../../dataset-control/guide/overviewExamples'

const DESCRIPTION = `
A DatasetControl is the frame around a list of records: it loads them for the view the user has open and holds the parts around them, such as a view switcher, a ribbon, a search field and paging. You pick the parts and put them in it, and what draws the records is one of them, usually a [**Grid**](?path=/docs/controls-grid-overview--overview). Try it below: tick two deals and press **Mark 2 as won**, then switch to *Won deals*.

{{canvas: The deal list}}

## What you see

| You see | Drawn by | Taught in |
|---|---|---|
| The deals in rows and columns | \`ClientSideGrid\` in \`DatasetControl.Body\` | [**Your first deal list**](?path=/docs/controls-datasetcontrol-guide-basics-your-first-deal-list--overview) |
| The view switcher, with *Biggest deals* under *Reports* | \`DatasetControl.ViewSwitcher\` | [**Views**](?path=/docs/controls-datasetcontrol-guide-basics-views--overview) |
| The grey placeholder while a view loads | The control | [**Load the deals**](?path=/docs/controls-datasetcontrol-guide-basics-load-the-deals--overview) |
| When a load fails, the error with **Details** and **Try again** | The control | [**When loading fails**](?path=/docs/controls-datasetcontrol-guide-basics-when-loading-fails--overview) |
| The search field, the range such as *1 - 8 of 8* with its page size menu, and the page buttons | \`DatasetControl.QuickFind\`, \`DatasetControl.PageSizeSwitcher\` and \`DatasetControl.Pagination\` | [**Search and page**](?path=/docs/controls-datasetcontrol-guide-features-search-and-page--overview) |
| **Mark 2 as won** for two ticked deals, **Save** and **Discard changes** once a value is changed, and **Refresh** | \`DatasetControl.Ribbon\`, in \`DealsRibbon\` | [**Act on deals**](?path=/docs/controls-datasetcontrol-guide-features-act-on-deals--overview) |
| **Edit columns** | \`DatasetControl.EditColumns\` | [**Choose the columns**](?path=/docs/controls-datasetcontrol-guide-features-choose-the-columns--overview) |
| *Deals are synced from the CRM every night.* | \`DatasetControl.Notifications\`, with the message \`showSyncMessage\` adds | [**Messages and nothing to show**](?path=/docs/controls-datasetcontrol-guide-features-messages-and-nothing-to-show--overview) |
| Only icons in the header, once the control is narrow | The header | [**Lay it out**](?path=/docs/controls-datasetcontrol-guide-features-lay-it-out--overview) |
| **Save as new view** and **Manage views** in the view switcher, and under *My views* the views users save | The user views module, and \`DatasetControl.UserQueries\` | [**Views of their own**](?path=/docs/controls-datasetcontrol-guide-your-data-views-of-their-own--overview) |
| *Selected: …* in the footer | \`SelectedValue\`, a part of your own | [**Your own UI**](?path=/docs/controls-datasetcontrol-guide-advanced-your-own-ui--overview) |

## How it fits together

Every load calls \`onLoad\` and hands the provider it returns to each part. The parts all work on that one provider, so a search narrows the grid and the range in the footer, and ticking a deal changes the ribbon and the total.

| Part | Does | Works on |
|---|---|---|
| \`DatasetControl\` | Loads the records through \`onLoad\` on every load, opens the view, keeps how the user left each view, and shows the placeholder, or a failed load, in place of the parts. | What \`onLoad\` returns: the provider and the views |
| \`DatasetControl.Body\` and a grid | Draws the records. The grid takes no provider of its own, and takes grid modules for features such as row selection and editing. | The control's provider |
| \`ViewSwitcher\`, \`Ribbon\`, \`EditColumns\`, \`QuickFind\`, \`Notifications\`, \`PageSizeSwitcher\` and \`Pagination\` | Each does one thing around the records: switches the view, runs commands, picks the columns, searches, shows messages, or pages. | The control's provider |
| Control modules | Add a feature to the control, such as the user's own views, and load again on every load. | The control of each load |

## The guide

The guide builds the deal list above one step at a time, from a read-only grid to every part drawn your way.

{{block: guide}}

In a model-driven app? Do *Basics*, then [**Where views are kept**](?path=/docs/controls-datasetcontrol-guide-your-data-where-views-are-kept--overview).

## Words you will meet

| Word | Means | Explained in |
|---|---|---|
| Record | One row of the list, such as the deal *Contoso: CRM rollout*. | [**Your first deal list**](?path=/docs/controls-datasetcontrol-guide-basics-your-first-deal-list--overview) |
| Provider | What holds the records of one load, with their columns, sorting, filter, search and pages, such as a \`MemoryDataProvider\`. | [**Your first deal list**](?path=/docs/controls-datasetcontrol-guide-basics-your-first-deal-list--overview) |
| \`onLoad\` | Your function that returns the provider, and the views, on every load. | [**Your first deal list**](?path=/docs/controls-datasetcontrol-guide-basics-your-first-deal-list--overview) |
| Part | A component you put inside the control, such as the view switcher or the grid, which works on the control's provider. | [**Your first deal list**](?path=/docs/controls-datasetcontrol-guide-basics-your-first-deal-list--overview) |
| View | A named way to look at the records: which columns show, with a filter or sorting of its own. | [**Views**](?path=/docs/controls-datasetcontrol-guide-basics-views--overview) |
| Load | The control mounting anew, behind the placeholder: \`onLoad\` runs, the view opens and the first page comes in. The first mount and every view switch start one. | [**Load the deals**](?path=/docs/controls-datasetcontrol-guide-basics-load-the-deals--overview) |
| Unsaved changes | Values the user changed and has not saved yet. The control and its parts ask before they load over them. | [**Act on deals**](?path=/docs/controls-datasetcontrol-guide-features-act-on-deals--overview) |
| Module | A feature you add through a \`modules\` prop: the grid's, such as row selection, or the control's, such as the user's own views. | [**Act on deals**](?path=/docs/controls-datasetcontrol-guide-features-act-on-deals--overview) |
| Region | Where a part sits: the header, the body or the footer, the header and the footer each with a start and an end. | [**Lay it out**](?path=/docs/controls-datasetcontrol-guide-features-lay-it-out--overview) |
| User view | A view a user saved under a name of their own, listed under *My views*. | [**Views of their own**](?path=/docs/controls-datasetcontrol-guide-your-data-views-of-their-own--overview) |
| State key | The control's \`stateKey\`: where it keeps the open view and how the user left each view, so they come back the next time the control is shown. | [**Back where they left off**](?path=/docs/controls-datasetcontrol-guide-your-data-back-where-they-left-off--overview) |
| The control | The \`IDatasetControl\` of one load, through which your code switches views, reloads and reaches the parts. | [**From your code**](?path=/docs/controls-datasetcontrol-guide-advanced-from-your-code--overview) |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Your first deal list', iconName: 'Education', href: '?path=/docs/controls-datasetcontrol-guide-basics-your-first-deal-list--overview', text: 'Start the guide: the team\'s deals in a read-only grid.' },
    { title: 'Reference', iconName: 'Table', href: '?path=/docs/controls-datasetcontrol-reference--overview', text: 'Every prop, member, part key, module parameter and slot of the DatasetControl.' },
    { title: 'Grid', iconName: 'GridViewSmall', href: '?path=/docs/controls-grid-overview--overview', text: 'What draws the records: columns, editing, sorting and the grid\'s own modules.' },
]

const meta = {
    title: 'Controls/DatasetControl/Overview',
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

export const TheDealList: Story = {
    name: 'The deal list',
    render: () => renderStory(<DealListExample />),
}
