import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { BrandExample, OwnComponentExample, SurfaceExample } from './themingExamples'

const DESCRIPTION = `
Every control draws in the theme of the nearest \`ThemeProvider\` above it. A theme is a Fluent theme, so the controls, Fluent's own components and yours share the same colours and fonts. An application needs one provider at its root; the controls make a theme of their own only where they draw something in other colours, such as a coloured cell.

\`\`\`tsx
import { ThemeProvider } from '@talxis/base-controls'

<ThemeProvider>
    <App />
</ThemeProvider>
\`\`\`

Without a \`theme\`, a provider takes the theme of the provider above it, or the default theme generated from Fluent's own colours when there is none. Pass \`theme\` to draw in your own:

\`\`\`tsx
const theme = createThemeBuilder({ colors: { primary: '#5B5FC7', background: '#ffffff', text: '#242424' } }).getTheme()

<ThemeProvider theme={theme}>
    <App />
</ThemeProvider>
\`\`\`

## Build a theme

A theme comes from three colours: \`primary\` for accents, links and selection, \`background\` and \`text\`. \`createThemeBuilder({ colors })\` works out the whole palette from them, light or dark depending on the background, and \`createThemeBuilder({ theme })\` starts from a theme you already have, with its colours as the seed. Change \`colors\` to regenerate the palette, and \`edit(key, edit)\` to change details on top, such as fonts; \`getTheme()\` returns the result. Themes are cached on their colours and edit keys, so the same key must always mean the same edit.

\`\`\`tsx
const builder = createThemeBuilder({ theme: appTheme })
builder.colors.background = '#fdecea'
builder.edit('bold', theme => { theme.fonts.medium.fontWeight = 600 })
const warning = builder.getTheme()
\`\`\`

In a component, \`useThemeBuilder\` keeps the theme while the colours and the edit's key stay the same:

\`\`\`tsx
const banner = useThemeBuilder({ colors: { primary: '#7f85f5', background: '#383838', text: '#ffffff' } })
const compact = useThemeBuilder({ theme: useTheme() }, { key: 'compact', edit: theme => { theme.fonts.medium.fontSize = 12 } })
\`\`\`

Colours are strings Fluent can parse, such as hex, \`rgb()\` or a colour name, not CSS variables.

## Theme part of the page

Providers nest: a \`ThemeProvider\` further down themes only what is inside it. It also paints its own element in the theme's background, text colour and font; pass \`applyTo='none'\` to hand the theme down without painting anything.

A control reads the theme as it mounts, and some of what it draws is built then and kept. To switch themes, mount the control again, for example with the theme's \`id\` as its \`key\`.

{{story: Brand colours}}

## Surfaces

Menus, callouts, tooltips, dropdown lists, date pickers, panels and dialogs are surfaces: they open in a layer over the application, not inside the element that opened them. A surface in the colours of that element looks out of place, such as a dark menu over a light page, opened from a dark banner, or a red calendar opened from a cell coloured red.

A surface is drawn in the **surface theme** instead. A \`ThemeProvider\` sets it with \`surfaceTheme\` for everything opened inside it:

| Opened inside | Drawn in |
|---|---|
| A provider with \`surfaceTheme\` | That theme |
| A provider without one | The surface theme of the nearest provider above that has one |
| No provider that sets one | The theme of the outermost provider |

So with one provider at the root, every surface opens in the application theme. Set \`surfaceTheme\` lower down only where an area should open its surfaces in something else.

The controls' own surfaces follow it, and so do this package's \`Callout\`, \`ContextualMenu\`, \`TooltipHost\`, \`Panel\`, \`Dialog\`, \`CommandBar\`, \`DatePicker\`, \`TimePicker\`, \`ComboBox\` and \`TagPicker\`, which wrap Fluent's components of the same name. Fluent's own components take the theme around them, so for a surface of your own, use one of these or draw it in the theme \`useSurfaceTheme()\` returns.

{{story: Surfaces}}

## Your own components

Read the theme with Fluent's \`useTheme()\`. Take colours from \`semanticColors\` where one fits, such as \`bodyText\`, \`bodySubtext\` or \`bodyDivider\`, so a component reads the same in any theme. For text over a colour of your own, \`getTextColorForBackground(color)\` returns one that reads on it, and \`isLightColor(color)\` tells which side it is on.

{{story: Your own component}}

To colour individual cells and column headers, see *Colour cells by their data* on [**Grid › Appearance**](?path=/docs/grid-appearance--overview).
`

const meta = {
    title: 'Theming',
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

export const BrandColours: Story = {
    name: 'Brand colours',
    render: () => renderStory(<BrandExample />),
    parameters: {
        docs: {
            description: {
                story: `Deals drawn in a theme generated from three colours, with the control keyed by the theme's \`id\` so it mounts again when they change. Try: pick a brand, or your own colours, then open the view switcher and the column menus.`,
            },
        },
    },
}

export const YourOwnComponent: Story = {
    name: 'Your own component',
    render: () => renderStory(<OwnComponentExample />),
    parameters: {
        docs: {
            description: {
                story: `The same \`Total\` drawn in the application theme and in a dark one, reading its colours from \`useTheme()\`.`,
            },
        },
    },
}

export const Surfaces: Story = {
    name: 'Surfaces',
    render: () => renderStory(<SurfaceExample />),
    parameters: {
        docs: {
            description: {
                story: `A dark banner with a menu and a callout, and its \`surfaceTheme\` picked above it. Try: open *Export* and *Details* with each choice; not set, they open in the application theme from the root.`,
            },
        },
    },
}
