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

| When | What happens |
|---|---|
| A provider leaves a key out | The key falls back to the provider above, then to English, so a page sets its language once and one control can still reword a label. |
| A label holds \`{{ placeholders }}\` | It is a Liquid template: keep the placeholders and any filters in a translation. |
| Labels change after mount | Components draw again with them, but what a control has built, such as grid cells or headers, keeps its text: remount the control with a new \`key\`, as the example does, or redraw the grid as *Redrawing* on [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview) describes. |
| A name comes from your data | View, column and option names are data, not labels: translate them where you define them, as the example does with its columns. |
| A date or number is drawn | It follows the culture of the provider's \`formatting\`, not the labels. Hand the provider the one from \`usePcfContext()\`, as the example does: see *Pick a provider* on [**Data providers**](?path=/docs/concepts-data-providers--overview). |

## Add a language

Every part exports its English set, such as \`GRID_LABELS\` or \`ERROR_MESSAGE_BAR_LABELS\`. Translate each set you use with \`translateLabels(set, strings)\`, which checks every key against the set as you type, and spread the results into one map for \`LabelsProvider\`. \`CZECH_LABELS\` is such a map for Czech, and \`labels/cs.ts\` in the next example translates a set this way.

## Labels in your own components

Give a component of yours labels the way the library's own do, rather than hard-coded strings or text props: define the English set with \`defineLabels\` and read it with \`useLabels\`. Prefix every key with the component's name, as \`defineLabels\` throws on a key another set already defines with a different string.

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
