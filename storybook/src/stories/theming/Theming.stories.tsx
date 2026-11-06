import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { BrandExample, DerivedThemesExample, ReadableTagsExample, RedRowsExample } from './themingExamples'

const DESCRIPTION = `
A theme is the colours, fonts and effects everything is drawn in. You generate it from three colours, an accent, a background and a text colour, and set it once at the root: every control below draws in it, down to the menus and panels it opens. Try it below: pick a brand, then open **Share**.

{{canvas: Brand colours}}

## Providers

| Provider | For |
|---|---|
| \`AppThemeProvider\` | The application's theme, at the root: see [**Quick start**](?path=/docs/concepts-quick-start--overview). |
| \`ThemeProvider\` | An area that looks different, such as a dark banner. Themes only what is inside it. |
| \`ThemeContext\` | The same, without an element of its own: use it for each item of a long list. |

Without a \`theme\`, a provider takes the one above it, or Fluent's default colours. A control reads the theme when it mounts, so to switch themes, remount it with the theme's \`id\` as its \`key\`, as the example does.

## Build a theme

\`useThemeBuilder(source, options?)\` generates a theme in a component and keeps it between renders; \`createThemeBuilder(source?)\` returns the builder outside React. The source is three colours, an existing theme, or the Fluent design state a PCF host hands its controls. Colours are hex, \`rgb()\`, \`hsl()\` or names, not CSS variables.

Tinting or changing a colour generates the theme again from its three colours, so a \`{ theme }\` source loses its fonts and earlier edits; add them back with \`edit\`.

{{story: Tint and edit}}

## Surfaces

Menus, callouts, tooltips, pickers, panels and dialogs open over the whole application, so they draw in the app theme, never in a local \`ThemeProvider\`'s. Draw a surface of your own in the theme \`useAppTheme()\` returns.

{{story: Red rows}}

## Your own components

Read the theme with \`useTheme()\` from \`@talxis/base-controls\` and take colours from \`semanticColors\`, such as \`bodyText\` or \`bodyDivider\`. For a colour of your own, such as a status, start from a hue, so it reads in a light and a dark theme:

| Helper | Returns |
|---|---|
| \`getTintColors(hue, { background, text }, strength?)\` | \`{ background, border, text }\` tinted by the hue, \`'subtle'\`, \`'strong'\` or \`'solid'\`; its text always reaches 4.5:1 |
| \`getTextColorForBackground(color)\` | A readable text colour for that background |
| \`getColorContrast(color, otherColor)\` | The WCAG contrast ratio, from 1 to 21 |
| \`isLightColor(color)\` | Whether dark text reads better on it |
| \`mixColors(color, base, weight)\` | \`color\` mixed into \`base\`, by a \`weight\` from 0 to 1 |

{{story: Readable tags}}

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Fluent UI', iconName: 'Design', href: '?path=/docs/concepts-fluent-ui--overview', text: 'Which Fluent UI and Base Controls components to use beside the controls.' },
    { title: 'Appearance', iconName: 'Color', href: '?path=/docs/controls-grid-appearance--overview', text: 'Colour the grid\'s cells, rows and headers.' },
    { title: 'Pieces and slots', iconName: 'Edit', href: '?path=/docs/concepts-pieces-and-slots--overview', text: 'Replace what a part draws with components in your own look.' },
]

const meta = {
    title: 'Concepts/Theming',
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

export const BrandColours: Story = {
    name: 'Brand colours',
    render: () => renderStory(<BrandExample />),
}

export const TintAndEdit: Story = {
    name: 'Tint and edit',
    render: () => renderStory(<DerivedThemesExample />),
    parameters: {
        docs: {
            description: {
                story: `Four cards, each drawn in a theme built another way. Try: change the hue, or the font size in the \`edit\`.`,
            },
        },
    },
}

export const RedRows: Story = {
    name: 'Red rows',
    render: () => renderStory(<RedRowsExample />),
    parameters: {
        docs: {
            description: {
                story: `Escalated tickets drawn red by a cell theme, which [**Appearance**](?path=/docs/controls-grid-appearance--overview) explains. Try: open the **Status** list of a red ticket.`,
            },
        },
    },
}

export const ReadableTags: Story = {
    name: 'Readable tags',
    render: () => renderStory(<ReadableTagsExample />),
    parameters: {
        docs: {
            description: {
                story: `A card that reads its colours from \`useTheme()\`, with stage tags from \`getTintColors\`, in a light and a dark theme. Try: change a stage's hue.`,
            },
        },
    },
}
