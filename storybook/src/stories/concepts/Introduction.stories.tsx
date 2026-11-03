import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ShowcaseExample } from '../../grid/examples/getStartedExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
Base Controls is a set of ready-made React components for business applications: grids, task grids with a Gantt chart, checklists, forms, maps and more. You hand them your data, and they show it, edit it and save it. They are built on Fluent UI v8 and run in Power Apps as PCF controls, or in your own React 16.8 or 17 application.

{{canvas: Overview}}

## How it works

- **Your data goes into a data provider.** It holds the records and knows how to load and save them, from memory, Dataverse or your own API.
- **A control shows it.** Data controls such as the grid, task grid and checklist draw a provider. Add only the features you need.
- **Your application sets shared settings once.** The theme, language and host are set at the root and apply to every control.

## Learn the concepts

{{block: explore}}

## Pick a control

{{block: controls}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Quick start', iconName: 'Rocket', href: '?path=/docs/concepts-quick-start--overview', text: 'Install the package, set up your application and add a first control.' },
    { title: 'Data providers', iconName: 'Database', href: '?path=/docs/concepts-data-providers--overview', text: 'The data layer the grid, task grid and checklist read: records, sorting, filters, paging, selection and saving.' },
    { title: 'Localization', iconName: 'LocaleLanguage', href: '?path=/docs/concepts-localization--overview', text: 'Translate every label, change the wording, and add languages of your own.' },
    { title: 'Theming', iconName: 'Color', href: '?path=/docs/concepts-theming--overview', text: 'Build a theme from your brand colours and give parts of the application their own.' },
    { title: 'Fluent UI', iconName: 'Puzzle', href: '?path=/docs/concepts-fluent-ui--overview', text: 'How the controls build on Fluent UI, and which of its components to use beside them.' },
    { title: 'Layout', iconName: 'Devices3', href: '?path=/docs/concepts-layout--overview', text: 'Fit controls and your own components to the space they are given, from a full page to a phone.' },
    { title: 'State persistence', iconName: 'History', href: '?path=/docs/concepts-state-persistence--overview', text: 'Let users come back where they left off, within a session or across sessions.' },
    { title: 'PCF context', iconName: 'PlugConnected', href: '?path=/docs/concepts-pcf-context--overview', text: 'Connect the controls to their host: the user, formatting, dialogs and data access.' },
    { title: 'Control isolation', iconName: 'Package', href: '?path=/docs/concepts-control-isolation--overview', text: 'Run a control in its own frame, safe from the styles and scripts of the page around it.' },
]

const CONTROLS: IExploreCard[] = [
    { title: 'Grid', iconName: 'Table', href: '?path=/docs/controls-grid-get-started--overview', text: 'An editable table on AG Grid: sorting, filtering, grouping, totals and more, module by module.' },
    { title: 'DatasetControl', iconName: 'ViewDashboard', href: '?path=/docs/controls-datasetcontrol-get-started--overview', text: 'The frame around a list of records: loading, views, a ribbon, quick find, column editing and paging.' },
    { title: 'TaskGrid', iconName: 'Timeline', href: '?path=/docs/controls-taskgrid-get-started--overview', text: 'Tasks as a tree, with commands to build the plan and an optional Gantt chart.' },
    { title: 'Checklist', iconName: 'CheckList', href: '?path=/docs/controls-checklist-get-started--overview', text: 'A to-do list over a provider: tick items off, rename, reorder, add and delete them.' },
    { title: 'Form', iconName: 'Questionnaire', href: '?path=/docs/controls-form-get-started--overview', text: 'A record laid out in tabs and sections, with validation, change tracking and saving.' },
    { title: 'Map', iconName: 'MapPin', href: '?path=/docs/controls-map-overview--overview', text: 'Records with an address or location as pins on a map.' },
]

const meta = {
    title: 'Concepts/Introduction',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { explore: () => <ExploreCards cards={EXPLORE} />, controls: () => <ExploreCards cards={CONTROLS} /> }),
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
