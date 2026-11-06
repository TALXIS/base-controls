import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { ApplicationExample, PureUiExample } from './buildingBlocksExamples'

const DESCRIPTION = `
An application built with Base Controls has providers at the root that connect it to its host and set its look, data providers that hold its records, and controls that show and edit them. Each control is made of parts, and you can configure them, replace what they draw or add parts of your own. Try it below: switch the theme, then click a deal's name to open it in a form.

{{canvas: An application from parts}}

## The root

The root sets up what every control reads: the *PCF context*, which connects the controls to their host with the user, formatting, dialogs and data access, and the app theme. In Power Apps the context is the host's own; anywhere else, \`PcfContextProvider\` builds one, so the same controls run in any React application. Which providers go at the root: [**Quick start**](?path=/docs/concepts-quick-start--overview). What the context holds: [**PCF context**](?path=/docs/concepts-pcf-context--overview).

## Lists and records

| To show | Use |
|---|---|
| A list of records | A data provider, loaded by a [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview) and drawn by a [**Grid**](?path=/docs/controls-grid-get-started--overview), [**TaskGrid**](?path=/docs/controls-taskgrid-get-started--overview) or [**Checklist**](?path=/docs/controls-checklist-get-started--overview) |
| A single record | A [**Form**](?path=/docs/controls-form-get-started--overview) |
| Records with a position | A [**Map**](?path=/docs/controls-map-get-started--overview) |

Sorting, filtering, paging, selection and saving work the same in every list, whether the records come from memory, Dataverse or your own API: see [**Data providers**](?path=/docs/concepts-data-providers--overview).

## The runtime

A control that loads something keeps its state and its work in a *runtime*, a new one for every mount, which \`onMounted\` hands to you. How a mount loads, fails and is replaced: [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview).

## Customise a control

| To | Use |
|---|---|
| Change what a control does | Its props, and for the grid its modules, column definitions and hooks: see [**Modules**](?path=/docs/controls-grid-modules--overview) |
| Change how a part looks | Its \`components\`, which replace what the part draws: see [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview) |
| Add a part of your own | A component placed among the built-in parts: see DatasetControl's [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview) |
| Draw a field yourself | A control of your own inside \`Form.Field\`: see the form's [**Your own UI**](?path=/docs/controls-form-your-own-ui--overview) |

## Parts without a control

Every part is split in two. The *UI* takes plain props and owns the look: its styles, its default texts and its \`components\`. The *adapter* reads the control's runtime and draws the UI with props. As the UI never reads a runtime, it also draws from your own state, with no control behind it.

{{story: Plain UI}}

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Quick start', iconName: 'Rocket', href: '?path=/docs/concepts-quick-start--overview', text: 'Install the package, set up the root providers and add a first control.' },
    { title: 'Data providers', iconName: 'Database', href: '?path=/docs/concepts-data-providers--overview', text: 'Put your records in a provider, from memory, Dataverse or your own API.' },
    { title: 'Pieces and slots', iconName: 'Edit', href: '?path=/docs/concepts-pieces-and-slots--overview', text: 'Replace the pieces a part draws, or draw the whole part yourself.' },
]

const meta = {
    title: 'Concepts/Building blocks',
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

export const Application: Story = {
    name: 'An application from parts',
    render: () => renderStory(<ApplicationExample />),
}

export const PureUi: Story = {
    name: 'Plain UI',
    render: () => renderStory(<PureUiExample />),
    parameters: {
        docs: {
            description: {
                story: `The DatasetControl's frame, view switcher, quick find and paging, with the form's sections as cards, all drawn from React state. Try: set a deal's stage to **Won**, then switch to **Won deals**.`,
            },
        },
    },
}
