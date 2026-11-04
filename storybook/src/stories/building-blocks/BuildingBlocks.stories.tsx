import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { ApplicationExample, CustomFieldExample, PureUiExample } from './buildingBlocksExamples'

const DESCRIPTION = `
An application built with Base Controls has providers at the root that connect it to its host and set its look, data providers that hold its records, and controls that show and edit them. Each control is made of parts, and you can configure them, replace them or add parts of your own. Try it below: switch the theme, then click a deal's name to open it in a form.

{{canvas: An application from parts}}

## The PCF context

The controls started as parts of PCF controls in Power Apps, so every part reads the **PCF context**: the user, formatting, navigation, dialogs and data access.

- **In a PCF**, pass the host's context to \`PcfContextProvider\`, and every part uses the host's dialogs, navigation and Web API.
- **Standalone**, \`PcfContextProvider\` without a context builds one, so the same parts run in any React application.
- **One is required either way.** It is the application's single way to reach its host.

Which providers go at the root: [**Quick start**](?path=/docs/concepts-quick-start--overview). What the context holds: [**PCF context**](?path=/docs/concepts-pcf-context--overview).

## Lists and records

- **A list of records** is a data provider. \`DatasetControl\` loads it, and a [**Grid**](?path=/docs/controls-grid-get-started--overview), [**TaskGrid**](?path=/docs/controls-taskgrid-get-started--overview) or [**Checklist**](?path=/docs/controls-checklist-get-started--overview) draws it.
- **A single record** is a [**Form**](?path=/docs/controls-form-get-started--overview).
- Views, quick find, paging, selection and saving work the same in every list, whether the records come from memory, Dataverse or your own API: [**Data providers**](?path=/docs/concepts-data-providers--overview).

## Customise a control

- **Set its options.** Every control has its own extension points, such as the grid's modules, column definitions and hooks: see [**Modules**](?path=/docs/controls-grid-modules--overview) and [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview).
- **Replace a piece of its UI.** Swap what a part draws, or draw the part yourself.
- **Write a part of your own.** Place it among the built-in parts.

Every part is split in two:

- **The UI** takes plain props and owns the look: its styles, its default texts and its replaceable pieces (\`components\`). It never reads a runtime, the PCF context or a store.
- **The adapter** reads the runtime and draws the UI. It translates from the runtime to props, and from the UI's events back.

How the pieces of each part are named and replaced: [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).

## A field of your own

A form is built from \`Form.Field\`, \`Form.Cell\` and \`Form.Control\`, and a control of your own can draw any field: it reads and writes the field through \`useField()\`, and the form tracks the change like any other. Try it below: drag the win chance, and the ribbon reports unsaved changes.

{{canvas: A field of your own}}

## Plain UI with your own data

A UI part takes only props, so it draws anywhere, with no control behind it. Try it below: set a deal's stage to **Won**, then switch to **Won deals**.

{{canvas: Plain UI}}

## How the package is layered

Each layer uses only the ones before it:

1. **core**: plumbing with no look (hooks, state, events, services).
2. **labels**: the texts and their translations.
3. **pcf**: the PCF context, its contract and the Xrm shims.
4. **theme**: themes and colours.
5. **ui**: UI shared by more than one control, driven only by props.
6. **fields**: the field controls.
7. **data**: the data provider a control reads.
8. **controls**: everything from the ribbon to the map.

On top sit the PCF entry points and every part's labels gathered per language. The earlier controls are still exported, mostly with names starting with \`Legacy\`.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Quick start', iconName: 'Rocket', href: '?path=/docs/concepts-quick-start--overview', text: 'Install the package, set up the root providers and add a first control.' },
    { title: 'Data providers', iconName: 'Database', href: '?path=/docs/concepts-data-providers--overview', text: 'Put your records in a provider, from memory, Dataverse or your own API.' },
    { title: 'Your own UI', iconName: 'Edit', href: '?path=/docs/controls-datasetcontrol-your-own-ui--overview', text: 'Replace the pieces a part draws, or draw the whole part yourself.' },
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

export const CustomField: Story = {
    name: 'A field of your own',
    render: () => renderStory(<CustomFieldExample />),
}

export const PureUi: Story = {
    name: 'Plain UI',
    render: () => renderStory(<PureUiExample />),
}
