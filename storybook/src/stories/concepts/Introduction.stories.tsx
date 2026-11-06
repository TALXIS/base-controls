import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ShowcaseExample } from '../../grid/examples/getStartedExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
Base Controls is a React library of controls for business applications: grids, task grids with a Gantt chart, checklists, forms and maps, which show your data, edit it and save it. They are built on Fluent UI v8, run in your own React 16.8 or 17 application, and plug into Power Apps as PCF controls. Try it below: pick a preset, then open **Code** to see how it is built.

{{canvas: Overview}}

## How it works

An application sets up its host and its look once, at the root: the PCF context gives every control the same user, formatting and dialogs, and the app theme the same colours. Records go into a data provider, which works the same whether they come from memory, Dataverse or your own API. Controls show the records, and you customise them from a single option down to what each part draws. How these fit together: [**Building blocks**](?path=/docs/concepts-building-blocks--overview).

## Learn the concepts

{{block: concepts}}

## Pick a control

{{block: controls}}

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Building blocks', iconName: 'Org', href: '?path=/docs/concepts-building-blocks--overview', text: 'What an application is made of, and how far you can customise it.' },
    { title: 'Quick start', iconName: 'Rocket', href: '?path=/docs/concepts-quick-start--overview', text: 'Install the package, set up your application and add a first control.' },
]

const CONCEPTS: IExploreCard[] = [
    { title: 'Data providers', iconName: 'Database', href: '?path=/docs/concepts-data-providers--overview', text: 'The records a list shows, with their sorting, filters, paging, selection and saving.' },
    { title: 'Localization', iconName: 'LocaleLanguage', href: '?path=/docs/concepts-localization--overview', text: 'Translate every label, change the wording, and add languages of your own.' },
    { title: 'Theming', iconName: 'Color', href: '?path=/docs/concepts-theming--overview', text: 'Build a theme from your brand colours and give parts of the application their own.' },
    { title: 'Fluent UI', iconName: 'Design', href: '?path=/docs/concepts-fluent-ui--overview', text: 'How the controls build on Fluent UI, and which of its components to use beside them.' },
    { title: 'Pieces and slots', iconName: 'Edit', href: '?path=/docs/concepts-pieces-and-slots--overview', text: 'Replace one button or one text a control draws, and keep the rest.' },
    { title: 'Layout', iconName: 'Devices3', href: '?path=/docs/concepts-layout--overview', text: 'Fit controls and your own components to the space they are given, from a full page to a phone.' },
    { title: 'State persistence', iconName: 'History', href: '?path=/docs/concepts-state-persistence--overview', text: 'Let users come back where they left off, within a session or across sessions.' },
    { title: 'PCF context', iconName: 'PlugConnected', href: '?path=/docs/concepts-pcf-context--overview', text: 'Connect the controls to their host: the user, formatting, dialogs and data access.' },
]

const CONTROLS: IExploreCard[] = [
    { title: 'DatasetControl', iconName: 'ViewDashboard', href: '?path=/docs/controls-datasetcontrol-get-started--overview', text: 'The frame around a list of records: loading, views, a ribbon, quick find, column editing and paging.' },
    { title: 'Grid', iconName: 'Table', href: '?path=/docs/controls-grid-get-started--overview', text: 'An editable table on AG Grid: sorting, filtering, grouping, totals and more, module by module.' },
    { title: 'TaskGrid', iconName: 'Timeline', href: '?path=/docs/controls-taskgrid-get-started--overview', text: 'Tasks as a tree, with commands to build the plan and an optional Gantt chart.' },
    { title: 'Checklist', iconName: 'CheckList', href: '?path=/docs/controls-checklist-get-started--overview', text: 'A to-do list over a provider: tick items off, rename, reorder, add and delete them.' },
    { title: 'Form', iconName: 'Questionnaire', href: '?path=/docs/controls-form-get-started--overview', text: 'A record laid out in tabs and sections, with validation, change tracking and saving.' },
    { title: 'Map', iconName: 'MapPin', href: '?path=/docs/controls-map-get-started--overview', text: 'Records with a latitude and a longitude as pins on a map.' },
    { title: 'Ribbon', iconName: 'Ribbon', href: '?path=/docs/controls-ribbon-get-started--overview', text: 'A bar of commands and menus, loaded again when what they act on changes.' },
    { title: 'RuntimeHost', iconName: 'Processing', href: '?path=/docs/controls-runtimehost-get-started--overview', text: 'Run a control of your own as the others run: loading, a failed load with a retry, and a remount.' },
    { title: 'IsolatedFrame', iconName: 'Package', href: '?path=/docs/controls-isolatedframe-get-started--overview', text: 'Run a control in its own frame, kept apart from the styles and scripts of the page around it.' },
]

const meta = {
    title: 'Concepts/Introduction',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { concepts: () => <ExploreCards cards={CONCEPTS} />, controls: () => <ExploreCards cards={CONTROLS} />, explore: () => <ExploreCards cards={EXPLORE} /> }),
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
