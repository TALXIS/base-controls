import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { SwitchLanguageExample } from '../../localization/localizationExamples'

const DESCRIPTION = `
Every string the controls draw is a *label*: a key such as \`'grid.noRecordsFound'\` with an English default. \`LocalizationProvider\` replaces labels for everything below it, the DatasetControl, the Grid, their modules, the task grid and the Gantt alike. No control takes strings through its own props.

\`\`\`tsx
import { CZECH_LABELS, LocalizationProvider } from '@talxis/base-controls'

const labels = { ...CZECH_LABELS, 'quickFind.searchPlaceholder': 'Hledat obchody...' }

<LocalizationProvider labels={labels}>
    <DatasetControl onLoad={loadDeals}>...</DatasetControl>
</LocalizationProvider>
\`\`\`

Below, one deal list in three wordings. Switch to Czech and open a column menu, the view switcher or the page size, then pick *Your own wording*, change a label and press *Apply*.

{{story: Switch the language}}

## Labels

\`labels\` maps keys to strings. A key you leave out falls back to the provider above, and then to its English default, so a page can set its language once and a single control can still reword a label of its own:

\`\`\`tsx
<LocalizationProvider labels={CZECH_LABELS}>
    <Header />
    <LocalizationProvider labels={{ 'grid.noRecordsFound': 'Žádné faktury.' }}>
        <InvoicesControl />
    </LocalizationProvider>
</LocalizationProvider>
\`\`\`

Some labels hold placeholders, such as \`Page {{ number }}\`: keep them in a translation and they are filled in. Column names, option labels and formatted values are not labels; they come from the provider or the store.

## When a change shows

| What | Follows a change of \`labels\` |
|---|---|
| Parts, overlays, tooltips, callouts and dialogs | At once |
| Column menus, header tooltips, totals captions and other strings a module builds | When the control mounts again |

When the language changes, give the control a new \`key\` along with the new labels, as the example does. Pass the same \`labels\` object on every render otherwise, from \`useMemo\` or outside your component.

## Translations

\`CZECH_LABELS\` translates every label in the library. Each control also exports its label sets with their Czech translations, such as \`GRID_LABELS\` and \`GRID_LABELS_CS\`; [**DatasetControl**](?path=/docs/localization-datasetcontrol--overview), [**Grid**](?path=/docs/localization-grid--overview), [**Task grid**](?path=/docs/localization-task-grid--overview), [**Checklist**](?path=/docs/localization-checklist--overview) and [**Fields and messages**](?path=/docs/localization-fields-and-messages--overview) list every key with its default.

\`translateLabels(GRID_LABELS, { 'grid.noRecordsFound': '…' })\` checks a translation's keys against a set while you type. Inside a component or module of your own, \`useLabels(GRID_LABELS).get('grid.noRecordsFound')\` reads a string as the nearest provider gives it, and \`grid.getLabels(set)\` and \`control.getLabels(set)\` do the same from a running grid or DatasetControl.
`

const meta = {
    title: 'Localization/Get started',
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
                story: `A deal list with views, column editing, search, selection, editing, sorting, filtering, totals and paging, under \`CZECH_LABELS\` or a wording of your own. Open **Code** to change the labels.`,
            },
        },
    },
}
