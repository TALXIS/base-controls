import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { OwnLabelsExample, SwitchLanguageExample } from '../../localization/localizationExamples'

const DESCRIPTION = `
Every string the controls draw is a *label*: a key such as \`'quickFind.searchPlaceholder'\` with an English default. A \`LabelsProvider\` replaces labels for everything below it, so one provider at the root translates the whole application, and another around a single control rewords just that control. Try it below: switch the grid to Czech, then open a column's menu.

{{canvas: Overview}}

## How labels behave

- **A key you leave out** falls back to the provider above, then to English, so a page sets its language once and one control can still reword a label.
- **\`{{ placeholders }}\`** are Liquid templates: keep the placeholders and any filters in a translation.
- **Labels changed after mount** redraw components at once, but what a control has built, such as grid cells or headers, keeps its text: remount the control with a new \`key\`, or redraw the grid as on [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview).
- **View, column and option names** are data, not labels: translate them where you define them, as the example does with its columns.
- **Dates and numbers** follow the user's culture from the [**PCF context**](?path=/docs/concepts-pcf-context--overview).

## Add a language

To translate inside your app alone, build one map of every key you translate and pass it to \`LabelsProvider\`. Build it from \`translateLabels\` for each set, spread into one map, so every key is checked against its set as you type; \`labels/cs.ts\` in the next example translates a set this way.

To add a supported language to the library itself, where each part keeps its English strings in \`labels/en.ts\`:

1. Beside every \`labels/en.ts\`, add a \`labels/<language>.ts\` that translates its set with \`translateLabels\`, and export it from \`labels/index.ts\`.
2. Spread every translated set into \`src/labels/sets/<language>.ts\`, and export it from \`src/labels/sets/index.ts\`.

## Labels in your own components

Give a component of yours labels the way the library's own do, rather than hard-coded strings or text props. Prefix every key with the component's name: \`defineLabels\` throws on a key another set already defines with a different string.

{{story: Your own labels}}

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Quick start', iconName: 'Rocket', href: '?path=/docs/concepts-quick-start--overview', text: 'Where the LabelsProvider sits among the providers at the root.' },
    { title: 'PCF context', iconName: 'PlugConnected', href: '?path=/docs/concepts-pcf-context--overview', text: 'Set the user\'s culture, which formats dates, numbers and money.' },
    { title: 'Talking to the grid', iconName: 'Chat', href: '?path=/docs/controls-grid-talking-to-the-grid--overview', text: 'Redraw the grid\'s cells and headers from your code.' },
]

const meta = {
    title: 'Concepts/Localization',
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
    render: () => renderStory(<SwitchLanguageExample />),
}

export const YourOwnLabels: Story = {
    name: 'Your own labels',
    render: () => renderStory(<OwnLabelsExample />),
    parameters: {
        docs: {
            description: {
                story: `An invoice header with a label set of its own and a Czech translation in separate files. Try: switch Czech off.`,
            },
        },
    },
}
