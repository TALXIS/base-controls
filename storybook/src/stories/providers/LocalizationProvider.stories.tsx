import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { SwitchLanguageExample } from './localizationProviderExamples'

const DESCRIPTION = `
Every string the controls draw is a *label*: a key such as \`'grid.noRecordsFound'\` with an English default. \`LocalizationProvider\` replaces labels for everything below it, the DatasetControl, the Grid, their modules, the task grid and the Gantt alike. No control takes strings through its own props.

\`\`\`tsx
import { CZECH_LABELS, LocalizationProvider } from '@talxis/base-controls'

const labels = { ...CZECH_LABELS, 'quickFind.searchPlaceholder': 'Hledat obchody...' }

<LocalizationProvider labels={labels}>
    <DatasetControl onLoad={loadDeals}>...</DatasetControl>
</LocalizationProvider>
\`\`\`

{{story: Switch the language}}

## Labels

\`labels\` maps keys to strings. A key you leave out falls back to the provider above, and then to its English default. A provider inside another lays its labels over the outer one's, so a page can set the language once and a single control can still change a string of its own.

Some labels hold placeholders, such as \`Page {{ number }}\`: keep them in a translation, and they are filled in. \`CZECH_LABELS\` is the Czech translation of every label in the library.

Pass the same \`labels\` object on every render, from \`useMemo\` or outside your component. A control reads some of its strings, such as its column menus, once when it mounts: give it a new \`key\` when the language changes, as the example does.

## Which keys there are

Each control lists its keys, with their English defaults:

| Control | Key prefixes | Listed on |
|---|---|---|
| DatasetControl and its parts | \`dataset\`, \`viewSwitcher\`, \`quickFind\`, \`editColumns\`, \`pagination\`, \`pageSizeSwitcher\`, \`notifications\`, \`emptyRecords\`, \`userQueries\` | [**DatasetControl › Localization**](?path=/docs/datasetcontrol-localization--overview) |
| Grid and its modules | \`grid\`, \`gridSorting\`, \`gridFiltering\`, \`filterOperators\`, \`gridGrouping\`, \`gridAggregation\` | [**Grid › Localization**](?path=/docs/grid-localization--overview) |
| Task grid, its modules and the Gantt | \`taskGrid\`, \`customColumns\`, \`lookupMany\`, \`templates\`, \`checklist\`, \`dependencies\`, \`gantt\`, \`markers\`, \`nonWorkingDays\`, \`taskTooltip\`, \`links\` | [**Task grid › Localization**](?path=/docs/taskgrid-localization--overview) |
| CheckList | \`checkList\` | *Change its wording* on [**Checklist › Customization**](?path=/docs/checklist-customization--overview) |

## Typed translations

Every control exports its label set, such as \`GRID_LABELS\`, and its Czech translation, such as \`GRID_LABELS_CS\`. \`translateLabels(GRID_LABELS, { 'grid.noRecordsFound': '…' })\` checks your keys against a set while you type. Inside a component of your own, \`useLabels(GRID_LABELS).get('grid.noRecordsFound')\` reads a string as the nearest provider gives it.
`

const meta = {
    title: 'Providers/LocalizationProvider',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const SwitchTheLanguage: Story = {
    name: 'Switch the language',
    render: () => renderStory(<SwitchLanguageExample />),
    parameters: {
        docs: {
            description: {
                story: `A deal list in Czech, with two strings of its own over \`CZECH_LABELS\`. Try: open a column menu, search for *zzz*, then switch back to English.`,
            },
        },
    },
}
