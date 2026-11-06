import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { FirstAppExample } from './quickStartExamples'

const DESCRIPTION = `
This page takes you from an empty React application to a first working control: install the packages, wrap the application in the providers every control needs, and add a control below them. The example is a whole application: a data provider with three products, a [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview) that loads it and a [**Grid**](?path=/docs/controls-grid-get-started--overview) that draws it. Try it below: open **Code** and add a fourth product.

{{canvas: Overview}}

## Install

\`\`\`bash
npm install @talxis/base-controls @talxis/client-libraries @fluentui/react@8.121.5
\`\`\`

Base Controls runs on React 16.8 or 17 and Fluent UI 8.121.5 or earlier.

## Set up the application

Wrap the application in the providers once, then add controls anywhere below them, as the example does. \`PcfContextProvider\` and \`AppThemeProvider\` are required; add the others when you need what they provide.

| Provider | Provides | Without it |
|---|---|---|
| \`PcfContextProvider\` | The user, formatting, dialogs and data access: [**PCF context**](?path=/docs/concepts-pcf-context--overview) | The controls throw |
| \`AppThemeProvider\` | The theme: [**Theming**](?path=/docs/concepts-theming--overview) | The controls throw |
| \`StateProvider\` | A store for what controls keep across mounts: [**State persistence**](?path=/docs/concepts-state-persistence--overview) | Every control shares one in-memory store for the page |
| \`LabelsProvider\` | Your wording and translations: [**Localization**](?path=/docs/concepts-localization--overview) | English |

What each part of the example is, and how far you can take it: [**Building blocks**](?path=/docs/concepts-building-blocks--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Data providers', iconName: 'Database', href: '?path=/docs/concepts-data-providers--overview', text: 'Put your own records in a provider, from memory, Dataverse or your own API.' },
    { title: 'Grid', iconName: 'Table', href: '?path=/docs/controls-grid-get-started--overview', text: 'Switch on sorting, filtering, editing and more, module by module.' },
    { title: 'DatasetControl', iconName: 'ViewDashboard', href: '?path=/docs/controls-datasetcontrol-get-started--overview', text: 'Add views, a ribbon, quick find and paging around the grid.' },
]

const meta = {
    title: 'Concepts/Quick start',
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
    render: () => renderStory(<FirstAppExample />),
}
