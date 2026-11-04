import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { CommandBarsExample } from './fluentUiExamples'

const DESCRIPTION = `
Base Controls is built on Fluent UI v8, Microsoft's React component library: its controls are drawn with Fluent's components and its themes are Fluent themes, so your own Fluent components sit beside them in the same look. For a few components, Base Controls ships a version of its own that draws its menus in the app theme and lines up with the controls. Try it below: narrow the bars with the slider, then open **Share** on both.

{{canvas: Two command bars}}

## What comes from Fluent

| What | From Fluent |
|---|---|
| Components | Fluent UI v8, which your application installs: see [**Quick start**](?path=/docs/concepts-quick-start--overview) |
| Themes | Fluent's \`ITheme\`: see [**Theming**](?path=/docs/concepts-theming--overview) |
| Styles | \`mergeStyleSets\`, and the \`styles\` props Fluent's components take |
| Icons | Fluent's icon font: register it once per window with \`initializeIcons()\`, unless your host already has |

## Fluent's component or Base Controls'

Base Controls' versions take the same props as Fluent's. Use them where there is one:

| Base Controls | What it adds to Fluent's |
|---|---|
| \`CommandBar\` | Menus and tooltips in the app theme, folds when its own box resizes, no side padding, icon-only buttons when compact, \`align\` |
| \`ComboBox\`, \`DatePicker\`, \`TimePicker\`, \`TagPicker\` | Lists and calendars in the app theme |
| \`Callout\`, \`ContextualMenu\`, \`TooltipHost\`, \`Panel\`, \`Dialog\` | Drawn in the app theme: see [**Theming**](?path=/docs/concepts-theming--overview) |
| \`useSurfaceMenuProps(menuProps)\` | A Fluent button's \`menuProps\`, drawn in the app theme |
| \`useTheme()\` | Throws outside an \`AppThemeProvider\` |

## Fluent UI v9

- The controls do not use Fluent UI v9.
- A PCF host hands its controls a v9 theme: build a theme from it with \`createThemeBuilder({ fluentDesignLanguage })\` (see [**Theming**](?path=/docs/concepts-theming--overview)).
- v9 components in a part of your own need their own \`FluentProvider\`: see [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Theming', iconName: 'Color', href: '?path=/docs/concepts-theming--overview', text: 'Build a theme from your brand colours, and draw your own components in it.' },
    { title: 'Your own UI', iconName: 'Edit', href: '?path=/docs/controls-datasetcontrol-your-own-ui--overview', text: 'Replace the pieces a part draws, with Fluent UI or a design system of your own.' },
]

const meta = {
    title: 'Concepts/Fluent UI',
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

export const TwoCommandBars: Story = {
    name: 'Two command bars',
    render: () => renderStory(<CommandBarsExample />),
}
