import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { SwitchLanguageExample } from '../../localization/localizationExamples'

const DESCRIPTION = `
Every string the controls draw is a *label*: a key such as \`'taskGrid.new'\` with an English default. \`LocalizationProvider\` replaces labels for everything below it, whichever control draws them. No control takes strings through its own props.

\`\`\`tsx
import { CZECH_LABELS, LocalizationProvider } from '@talxis/base-controls'

const labels = { ...CZECH_LABELS, 'taskGrid.addChild': 'Rozdělit úkol' }

<LocalizationProvider labels={labels}>
    <TaskDatasetControl onLoad={loadTasks}>...</TaskDatasetControl>
</LocalizationProvider>
\`\`\`

Below, one plan in four wordings: English, Czech from \`CZECH_LABELS\`, Japanese from a translation the example brings in \`japanese.ts\`, and your own. Switch language and open the view switcher, Edit columns, the settings, *New* or a column menu, point at a bar or a link, then pick *Your own wording*, change a label and press *Apply*.

{{story: Switch the language}}

## Labels

\`labels\` maps keys to strings. A key you leave out falls back to the provider above, and then to its English default, so a page can set its language once and one control can still reword a label of its own:

\`\`\`tsx
<LocalizationProvider labels={CZECH_LABELS}>
    <Header />
    <LocalizationProvider labels={{ 'grid.noRecordsFound': 'Žádné faktury.' }}>
        <InvoicesControl />
    </LocalizationProvider>
</LocalizationProvider>
\`\`\`

Some labels hold placeholders, such as \`Page {{ number }}\`: keep them in a translation and they are filled in. View, column and option names are not labels: they come from the data, so the example's views carry them per language, in \`columns.ts\`.

## Dates and numbers

Labels translate the strings; dates, numbers and durations follow the user's formatting culture in the PCF context. In a hosted control it comes from the user's settings. Elsewhere, pass it to \`PcfContextProvider\`, as the example does for each language:

\`\`\`tsx
<PcfContextProvider userSettings={{ lcid: 1029, formatInfoCultureName: 'cs-CZ' }}>
    <LocalizationProvider labels={CZECH_LABELS}>...</LocalizationProvider>
</PcfContextProvider>
\`\`\`

## When a change shows

| What | Follows a change of \`labels\` |
|---|---|
| Parts, overlays, tooltips, callouts and dialogs | At once |
| Ribbon commands, column menus, totals captions and other strings a module builds | When the control mounts again |

When the language changes, give the control a new \`key\` along with the new labels, as the example does. Otherwise pass the same \`labels\` object on every render, from \`useMemo\` or outside your component.

## Translations and keys

\`CZECH_LABELS\` translates every label in the library. Each control exports its label sets beside their Czech translations, such as \`GRID_LABELS\` and \`GRID_LABELS_CS\`, and a set's \`defaults\` hold its keys with their English text; \`BASE_CONTROLS_LABEL_SETS\` lists every set.

\`translateLabels(GRID_LABELS, { 'grid.noRecordsFound': '…' })\` checks a translation's keys against a set while you type. Inside a component or module of your own, \`useLabels(GRID_LABELS).get('grid.noRecordsFound')\` reads a string as the nearest provider gives it.
`

const meta = {
    title: 'Localization',
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
                story: `The full task grid with its Gantt: user views, Edit columns, custom columns, assignees and tags, templates, checklists, dependencies, dragging, markers, non-working days, tooltips and links, in English, Czech, Japanese or a wording of your own. Open **Code** for the Japanese translation in \`japanese.ts\` and the translated view and column names in \`columns.ts\`.`,
            },
        },
    },
}
