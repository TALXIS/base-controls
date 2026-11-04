import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { BasicUsageExample, ShowcaseExample } from '../../dataset-control/examples/getStartedExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
DatasetControl is the frame around a list of records. It loads them, shows a placeholder or an error while it does, and holds the parts around them: views, a ribbon, quick find, column editing, paging and notifications. What shows the records is up to you, usually a [**Grid**](?path=/docs/controls-grid-get-started--overview).

Below is a sales pipeline with every part and grid module switched on. Try: group by a column, then pick *Save as new view* from the view switcher.

{{canvas: Overview}}

## Basic usage

The least a control needs: views to switch between, an \`onLoad\` that returns \`{ provider }\`, and the parts you want. Open **Code**; its comments walk through each piece.

{{story: Three deals, two views}}

## How it fits together

Each piece, and each of the control's props, has its own page:

| To | Use | See |
|---|---|---|
| Load the records of a view | \`onLoad\`, \`onLoadDependencies\` for what every load needs first, \`destroyProviderOnUnmount\` | [**Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview) |
| List views to switch between | \`onLoadViews\` and \`DatasetControl.ViewSwitcher\` | [**Views**](?path=/docs/controls-datasetcontrol-views--overview) |
| Place the parts and size the control | \`Header\`, \`Body\` and \`Footer\`, each with a start and an end; \`height\` | [**Layout**](?path=/docs/controls-datasetcontrol-layout--overview) |
| Show a failure | Throw. The control shows it, with *Try again* where it can. | [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview) |
| Drive the control from your code | \`useDatasetControl()\` inside it; \`onMounted\`, \`onReady\` and \`onDestroyed\` outside; \`modules\` | [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview) |
| Bring the user back where they left off | \`stateKey\` | [**State**](?path=/docs/controls-datasetcontrol-state--overview) |
| Change what a part draws, or translate it | \`components\`, \`className\`, \`scope\`, \`LabelsProvider\` | [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview), [**Localization**](?path=/docs/concepts-localization--overview) |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Loading data', iconName: 'CloudDownload', href: '?path=/docs/controls-datasetcontrol-loading-data--overview', text: 'Load each view in your own onLoad, behind a placeholder, with a failed load shown and retried for you.' },
    { title: 'Error handling', iconName: 'Error', href: '?path=/docs/controls-datasetcontrol-error-handling--overview', text: 'Throw from a load or a command, and the user sees the error with a way to try again.' },
    { title: 'Talking to the control', iconName: 'Plug', href: '?path=/docs/controls-datasetcontrol-talking-to-the-control--overview', text: 'Switch views, reload, follow every load and reach any part from your own code.' },
    { title: 'Views', iconName: 'ViewList', href: '?path=/docs/controls-datasetcontrol-views--overview', text: 'Many views of the same records, each loading its own provider set-up or drawn with a UI of its own.' },
    { title: 'Every part', iconName: 'Puzzle', href: '?path=/docs/controls-datasetcontrol-parts-ribbon--overview', text: 'A ribbon that follows the selection, quick find, column editing, paging and notifications.' },
    { title: 'Layout that adapts', iconName: 'ResponsiveDesign', href: '?path=/docs/controls-datasetcontrol-layout--overview', text: 'Left and right regions, a height that fills any space, and a header that gives way on a narrow screen.' },
    { title: 'Back where they left off', iconName: 'History', href: '?path=/docs/controls-datasetcontrol-state--overview', text: 'Every view keeps its sorting, search, paging and scroll, and the control reopens on the view the user was on.' },
    { title: 'Your own UI', iconName: 'GridViewSmall', href: '?path=/docs/controls-datasetcontrol-your-own-ui--overview', text: 'Replace any piece a part draws, add parts of your own, and show the records as a list, cards or a chart.' },
    { title: 'Your language', iconName: 'LocaleLanguage', href: '?path=/docs/concepts-localization--overview', text: 'Translate or reword every string the control and its parts show.' },
]

const meta = {
    title: 'Controls/DatasetControl/Get started',
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

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<ShowcaseExample />),
}

export const BasicUsage: Story = {
    name: 'Three deals, two views',
    render: () => renderStory(<BasicUsageExample />),
    parameters: {
        docs: {
            description: {
                story: `The smallest working control. Try: switch to *Won deals*, search for *desk*, then add a deal to \`DEALS\` in **Code**.`,
            },
        },
    },
}
