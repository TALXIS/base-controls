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

## How labels resolve

| What | How |
|---|---|
| A key you leave out | Falls back to the provider above, then to English, so a page sets its language once and one control can still reword a label |
| \`{{ placeholders }}\` | Keep them in a translation |
| Changing labels after mount | Because of memoization, a change may not show until the affected component draws again. Trigger that on the component directly: components have an API for it, such as the grid's \`cells.render()\` and \`columns.headers.render()\` |
| View, column and option names | Data, not labels: the demo translates them in \`columns.ts\` |
| Dates and numbers | Follow the user's culture from the [**PCF context**](?path=/docs/concepts-pcf-context--overview) |

## Add a supported language

Each component keeps its English strings in a \`labels.ts\`, and each supported language in a \`labels.<language>.ts\` beside it. \`src/localization\` holds one file per language that gathers them into a single map. To support a new language:

1. Beside every \`labels.ts\`, add a \`labels.<language>.ts\` that translates its set with \`translateLabels\`, and export it from the folder's \`index.ts\`.
2. Add \`src/localization/<language>.ts\` that spreads every translated set into one map, and export it from \`src/localization/index.ts\`.

\`translateLabels\` checks every key against its set while you type, and a key you miss falls back to English. To translate inside your app alone, without changing the library, build the same map there and pass it to \`LabelsProvider\`, as the demo's \`japanese.ts\` does.

## Labels in your own components

Give a component of yours labels the way the library's own do, rather than hard-coded strings or text props:

\`\`\`tsx
//labels.ts: one set per component, every key prefixed with its name
export const INVOICE_LABELS = defineLabels({
    'invoice.title': 'Invoice',
    'invoice.lineCount': '{{ count }} lines',
})

//labels.<language>.ts: one file per supported language
export const INVOICE_LABELS_CS = translateLabels(INVOICE_LABELS, {
    'invoice.title': 'Faktura',
    'invoice.lineCount': '{{ count }} řádků',
})

//Invoice.tsx
const Invoice = (props: IInvoiceProps) => {
    const labels = useLabels(INVOICE_LABELS)
    return <Text>{labels.get('invoice.title')}: {labels.get('invoice.lineCount', { count: props.lines.length })}</Text>
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
