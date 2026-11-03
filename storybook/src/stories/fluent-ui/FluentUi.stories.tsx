import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { CommandBarsExample } from './fluentUiExamples'

const DESCRIPTION = `
Base Controls is built on Fluent UI v8, Microsoft's React component library: its controls are drawn with Fluent's components, and its themes are Fluent themes. So your own Fluent components sit next to the controls and look the same, and one theme styles both. Where Fluent's own component falls short, Base Controls ships a version of it that draws its menus in the app theme, fixes Fluent's quirks and lines up with the controls. Try it below: narrow the bars with the slider, and open *Share* on both.

{{canvas: Two command bars}}

## What comes from Fluent

| What | From Fluent |
|---|---|
| Components | Fluent UI v8, \`@fluentui/react\` 8.121.5 or earlier, which your application installs |
| Themes | Fluent's \`ITheme\`: see [**Theming**](?path=/docs/concepts-theming--overview) |
| Styles | \`mergeStyleSets\`, and the \`styles\` props Fluent's components take |
| Icons | Fluent's icon font: register it once per window with \`initializeIcons()\`, unless your host already has |

## Fluent's component or Base Controls'

Base Controls' versions take the same props as Fluent's. Use them where there is one:

| Base Controls | What it adds to Fluent's |
|---|---|
| \`CommandBar\` | Menus and tooltips in the app theme, folds when its own box resizes, no side padding, icon-only buttons when compact, \`align\` |
| \`ComboBox\`, \`DatePicker\`, \`TimePicker\`, \`TagPicker\` | Lists and calendars in the app theme |
| \`Callout\`, \`ContextualMenu\`, \`TooltipHost\`, \`Panel\`, \`Dialog\` | Drawn in the app theme, not in the theme around what opened them |
| \`useSurfaceMenuProps(menuProps)\` | A Fluent button's \`menuProps\`, drawn in the app theme |
| \`useTheme()\` | Fluent's theme, and it requires an \`AppThemeProvider\` |

## Fluent UI v9

- The controls do not use Fluent UI v9.
- A PCF host hands its controls a v9 theme: build a theme from it with \`createThemeBuilder({ fluentDesignLanguage })\` (see [**Theming**](?path=/docs/concepts-theming--overview)).
- v9 components in a part of your own need their own \`FluentProvider\`: see *A whole design system* on [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).
`

const meta = {
    title: 'Concepts/Fluent UI',
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

export const TwoCommandBars: Story = {
    name: 'Two command bars',
    render: () => renderStory(<CommandBarsExample />),
}
