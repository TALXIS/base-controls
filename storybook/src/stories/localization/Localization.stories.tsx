import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { SwitchLanguageExample } from '../../localization/localizationExamples'

const DESCRIPTION = `
Every string the controls draw is a *label*: a key such as \`'taskGrid.new'\` with an English default. Wrap the application in \`LabelsProvider\` to translate or reword the labels below it, or wrap a single part of it to reword just that part.

\`\`\`tsx
<LabelsProvider labels={{ ...CZECH_LABELS, 'taskGrid.new': 'Přidat práci' }}>
    <TaskDatasetControl onLoad={loadTasks}>...</TaskDatasetControl>
</LabelsProvider>
\`\`\`

Below, the full task grid in English, Czech, Japanese or a wording of your own. Open **Code** for the Japanese translation in \`japanese.ts\` and the translated view and column names in \`columns.ts\`.

{{canvas: Overview}}

## How labels behave

| What | How |
|---|---|
| A key you leave out | Falls back to the provider above, then to English, so a page sets its language once and one control can still reword a label |
| \`{{ placeholders }}\` | Liquid templates: keep the placeholders and any filters in a translation |
| Changing labels after mount | Components draw the new labels at once. What a control has already built from them, such as grid cells and headers, ribbon commands or column names, keeps its text until it is built again: redraw cells and headers with \`cells.render()\` and \`columns.headers.render()\` (see *Redrawing* on [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview)), or remount the control with a new \`key\` |
| View, column and option names | Data, not labels: the demo translates them in \`columns.ts\` |
| Dates and numbers | Follow the user's culture from the [**PCF context**](?path=/docs/concepts-pcf-context--overview) |

## Add a language

To translate inside your app alone, build a map of every key you translate and pass it to \`LabelsProvider\`, as the demo's \`japanese.ts\` does. Building it from \`translateLabels\` for each set, spread into one map, checks every key against its set while you type.

To add a supported language to the library itself, where each component keeps its English strings in a \`labels.ts\` and \`src/localization\` gathers each language into one map:

1. Beside every \`labels.ts\`, add a \`labels.<language>.ts\` that translates its set with \`translateLabels\`, and export it from the folder's \`index.ts\`.
2. Add \`src/localization/<language>.ts\` that spreads every translated set into one map, and export it from \`src/localization/index.ts\`.

## Labels in your own components

Give a component of yours labels the way the library's own do, rather than hard-coded strings or text props. Prefix every key with the component's name: \`defineLabels\` throws on a key another set already defines with a different string.

\`\`\`tsx
//labels.ts: one set per component
export const INVOICE_LABELS = defineLabels({
    'invoice.title': 'Invoice',
    'invoice.lineCount': 'Lines: {{ count }}',
})

//labels.<language>.ts: one file per supported language
export const INVOICE_LABELS_CS = translateLabels(INVOICE_LABELS, {
    'invoice.title': 'Faktura',
    'invoice.lineCount': 'Řádky: {{ count }}',
})

//Invoice.tsx
const Invoice = (props: IInvoiceProps) => {
    const labels = useLabels(INVOICE_LABELS)
    return <Stack>
        <Text>{labels.get('invoice.title')}</Text>
        <Text>{labels.get('invoice.lineCount', { count: props.lines.length })}</Text>
    </Stack>
}
\`\`\`
`

const meta = {
    title: 'Concepts/Localization',
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

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<SwitchLanguageExample />),
}
