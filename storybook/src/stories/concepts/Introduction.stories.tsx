import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ShowcaseExample } from '../../grid/examples/getStartedExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
Base Controls is a set of ready-made React components for business applications: grids, task plans with Gantt charts, forms, fields, maps and more. You hand them your data, and they take care of showing it, editing it and saving it. They are built on Fluent UI and work both in Power Apps, as PCF controls, and in any React application.

{{canvas: Overview}}

## How it works

- **Your data goes into a data provider.** It holds the records and knows how to load and save them, from memory, Dataverse or your own API.
- **A control shows the provider.** Pick the control that fits, such as a grid, and add only the features you need.
- **Your application sets the look once.** The theme, language and other shared settings are set at the root and apply to every control.

## Next steps

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Quick start', iconName: 'Rocket', href: '?path=/docs/concepts-quick-start--overview', text: 'Install the package, set up your application and add a first control.' },
    { title: 'Data providers', iconName: 'Database', href: '?path=/docs/concepts-data-providers--overview', text: 'The data layer every control reads: records, sorting, filters, paging, selection and saving.' },
    { title: 'Theming', iconName: 'Color', href: '?path=/docs/concepts-theming--overview', text: 'Build a theme from your brand colours and give parts of the application their own.' },
    { title: 'Localization', iconName: 'LocaleLanguage', href: '?path=/docs/concepts-localization--overview', text: 'Translate every label, change the wording, and add languages of your own.' },
    { title: 'Layout', iconName: 'Devices3', href: '?path=/docs/concepts-layout--overview', text: 'Fit controls and your own components to the space they are given, from a full page to a phone.' },
    { title: 'State persistence', iconName: 'History', href: '?path=/docs/concepts-state-persistence--overview', text: 'Let users come back where they left off, within a session or across sessions.' },
    { title: 'PCF context', iconName: 'PlugConnected', href: '?path=/docs/concepts-pcf-context--overview', text: 'Connect the controls to their host: the user, formatting, dialogs and data access.' },
    { title: 'Control isolation', iconName: 'Package', href: '?path=/docs/concepts-control-isolation--overview', text: 'Run a control in its own frame, safe from the styles and scripts of the page around it.' },
]

const meta = {
    title: 'Concepts/Introduction',
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
