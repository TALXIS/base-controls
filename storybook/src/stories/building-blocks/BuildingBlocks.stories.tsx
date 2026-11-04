import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { ApplicationExample, CustomFieldExample, PureUiExample } from './buildingBlocksExamples'

const DESCRIPTION = `
Base Controls is a foundation to build business applications from parts. A few providers at the root give every part the same host and the same look. Lists and records plug in through data providers, so each one works the same way. And every part can be customised, from a single option down to what it draws, without giving up the rest. Try it below: switch the theme, then click a deal's name. The deal opens in a Base Controls form; change it there and the grid follows.

{{canvas: An application from parts}}

## Where it comes from

The controls started as parts of PCF controls in Power Apps, which is why everything reads the **PCF context**: the user, formatting, navigation, dialogs and data access.

- **In a PCF**, pass the host's context to \`PcfContextProvider\`, and every part uses the host's dialogs, navigation and Web API.
- **Standalone**, \`PcfContextProvider\` without a context builds one from a clean slate, so the same parts run in any React application.
- **Either way, one is required.** It is the application's single way to reach its host; the name may change, the role stays.

Which providers go at the root, and what each one gives: [**Quick start**](?path=/docs/concepts-quick-start--overview). What the context holds: [**PCF context**](?path=/docs/concepts-pcf-context--overview).

## One shape for all data

- **A list of records** is a data provider. \`DatasetControl\` loads it, and a [**Grid**](?path=/docs/controls-grid-get-started--overview), [**TaskGrid**](?path=/docs/controls-taskgrid-get-started--overview) or [**Checklist**](?path=/docs/controls-checklist-get-started--overview) draws it.
- **A single record** is a [**Form**](?path=/docs/controls-form-get-started--overview).
- Views, quick find, paging, selection and saving work the same in every list, whether the records come from memory, Dataverse or your own API: [**Data providers**](?path=/docs/concepts-data-providers--overview).

## Customise it

From the lightest touch to the deepest:

- **The control's own options.** Every control has its own extension points, such as the grid's [**modules**](?path=/docs/controls-grid-modules--overview), column definitions and [**hooks**](?path=/docs/controls-grid-extending-hooks--overview).
- **Replace a piece of its UI.** Every part is split in two, and you can swap what the UI draws or draw the UI yourself.
- **Write a part of your own.** Use the same split, and place it among the built-in parts.

The split works like this:

- **The UI** takes plain props and owns the look: its styles, its default texts and its replaceable pieces (\`components\`). It never reads a runtime, the PCF context or a store.
- **The adapter** reads the runtime and draws the UI. It only translates, from the runtime to props and from the UI's events back.

### A field of your own

A control's own parts compose like building blocks. Try it below: a deal form built from \`Form.Field\`, \`Form.Cell\` and \`Form.Control\`, where the win chance is a slider of your own that reads and writes its field through \`useField()\`. Drag it and the ribbon reports unsaved changes, as for any other field.

{{canvas: A field of your own}}

### Plain UI, your own data

Because the UI takes only props, it draws anywhere, with no control behind it. Try it below: a deal board in plain React state, drawn with the DatasetControl's own view switcher, ribbon, quick find, empty state and paging, the Form's tab and columns for the cards, Base Controls' own fields inside them, and the notification bar. Set a deal's stage to *Won* and switch to *Won deals*, sort by *Biggest first*, search for *Lit*, and page through.

{{canvas: Plain UI}}

How the pieces of each part are named and replaced: [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).

## How the package is layered

The package is built in layers, and each one uses only the ones before it, so you can take any of them on its own:

1. **core**: plumbing with no look (hooks, state, events, services).
2. **labels**: the texts and their translations.
3. **pcf**: the PCF context, its contract and the Xrm shims.
4. **theme**: themes and colours.
5. **ui**: UI shared by more than one control, driven only by props.
6. **fields**: the field controls.
7. **data**: the data provider a control reads.
8. **controls**: everything from the ribbon to the map.

On top sit the PCF entry points and every part's labels gathered per language. The earlier controls are still exported, mostly with names starting with \`Legacy\`.

### Contributing

Every control, and every module of one, has the same folders:

- \`runtime/\`: state and logic, with no rendering.
- \`adapters/\`: one folder per part, reading the runtime.
- \`ui/\`: one folder per part, with its \`styles.ts\` and \`components.tsx\`.
- \`modules/\`: optional features, split the same way.
- \`labels/\`: \`en.ts\` and one file per translation.

An import that points the wrong way, up a layer or from a UI into a runtime, fails the layer check:

\`\`\`bash
npm run check:layers
\`\`\`

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Quick start', iconName: 'Rocket', href: '?path=/docs/concepts-quick-start--overview', text: 'Install the package, set up the root providers and add a first control.' },
    { title: 'Data providers', iconName: 'Database', href: '?path=/docs/concepts-data-providers--overview', text: 'Put your records in a provider, from memory, Dataverse or your own API.' },
    { title: 'Your own UI', iconName: 'Edit', href: '?path=/docs/controls-datasetcontrol-your-own-ui--overview', text: 'Replace the pieces a part draws, or draw the whole part yourself.' },
    { title: 'PCF context', iconName: 'PlugConnected', href: '?path=/docs/concepts-pcf-context--overview', text: 'What the host gives every part: the user, formatting, dialogs and data access.' },
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
