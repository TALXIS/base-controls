import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { OwnLabelsExample, SwitchLanguageExample } from '../../localization/localizationExamples'

const DESCRIPTION = `
Every string the controls draw is a *label*: a key such as \`'taskGrid.new'\` with an English default. Wrap the application in \`LabelsProvider\` to translate or reword the labels below it, or wrap a single part of it to reword just that part. Below, the full task grid in English, Czech, Japanese or a wording of your own; **Code** has the Japanese translation in \`japanese.ts\` and the translated view and column names in \`columns.ts\`.

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

{{story: Your own labels}}
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

export const YourOwnLabels: Story = {
    name: 'Your own labels',
    render: () => renderStory(<OwnLabelsExample />),
    parameters: {
        docs: {
            description: {
                story: `An invoice header with a label set of its own and a Czech translation in separate files. Try: switch Czech off, then add a key to \`labels.ts\` and translate it.`,
            },
        },
    },
}
