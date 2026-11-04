import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { BasicUsageExample, ShowcaseExample } from '../../grid/examples/getStartedExamples'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
Grid shows the records of a data provider as rows and columns, on top of <a href="https://www.ag-grid.com/" target="_blank" rel="noreferrer">AG Grid</a>, and draws each value with the control for its data type. On its own it only shows the records; editing, selection, sorting, filtering and grouping are modules you switch on. Try it below: open **Code** and add a column to \`columns\`.

{{canvas: Overview}}

## Set it up

- Like every control, the grid needs the root providers from [**Quick start**](?path=/docs/concepts-quick-start--overview).
- The grid takes no provider prop: how it gets one is on [**Data providers**](?path=/docs/concepts-data-providers--overview).
- \`modules\` switches features on, and a row model is the one every grid needs.
- Every prop and event is on [**Props and events**](?path=/docs/controls-grid-props-and-events--overview).

## Switch on modules

- [**Editing**](?path=/docs/controls-grid-modules-editing--overview): change values in place, check them and save them.
- [**Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview): select rows, highlight blocks of cells and copy them into a spreadsheet.
- [**Sorting and filtering**](?path=/docs/controls-grid-modules-sorting-and-filtering--overview): sort and filter from each column's menu.
- [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview): group the rows by a column and total its values.

Some modules need AG Grid Enterprise: see *AG Grid Enterprise and the licence* on [**Modules**](?path=/docs/controls-grid-modules--overview).

## What it can do

A sales pipeline built from the modules and a few modules of its own, with a preset for each use case. **Features & Modules** switches them one by one.

{{story: Explore a sales pipeline}}

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Data', iconName: 'Database', href: '?path=/docs/controls-grid-data--overview', text: 'How the provider\'s columns and data types decide what the grid draws.' },
    { title: 'Columns', iconName: 'TripleColumn', href: '?path=/docs/controls-grid-columns--overview', text: 'Pin, link and calculate columns, and add commands and header menus.' },
    { title: 'Appearance', iconName: 'Color', href: '?path=/docs/controls-grid-appearance--overview', text: 'Size the grid, colour cells by their data and draw your own cells.' },
]

const meta = {
    title: 'Controls/Grid/Get started',
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
    render: () => renderStory(<BasicUsageExample />),
}

export const ExploreASalesPipeline: Story = {
    name: 'Explore a sales pipeline',
    render: () => renderStory(<ShowcaseExample />),
    parameters: {
        docs: {
            description: {
                story: `Deals whose presets each switch on the modules of one use case. Try: pick the *Closing deals* preset.`,
            },
        },
    },
}
