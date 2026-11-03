import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { BrandExample, ReadableTagsExample, RedRowsExample } from './themingExamples'

const DESCRIPTION = `
A theme says what everything is drawn in: its colours, fonts and effects. It is a Fluent UI v8 theme (\`ITheme\`), so the controls, Fluent's own components and yours all look the same, and one theme at the root of the application is all most applications need.

## The providers

Put an \`ApplicationThemeProvider\` at the root of the application. Everything below it draws in its theme, including the dialogs, menus and other surfaces that open over the application:

\`\`\`tsx
const Root = () => {
    const theme = useThemeBuilder({ colors: { primary: '#5B5FC7', background: '#ffffff', text: '#242424' } })
    return <ApplicationThemeProvider theme={theme}>
        <App />
    </ApplicationThemeProvider>
}
\`\`\`

Use a \`ThemeProvider\` for an area of the application that looks different, such as a dark banner. It themes only what is inside it. Without a \`theme\`, either provider takes the theme above it, or Fluent's default colours when there is none.

- Both providers render an element painted in the theme's background and font. \`applyTo='none'\` keeps the element but paints nothing.
- \`ThemeContext\` hands a theme down with no element at all. It is cheap enough to use for every item of a long list.
- The theme goes through as it is; nothing from the theme above is merged into it.

A control reads the theme when it mounts. To switch themes, mount it again, for example with the theme's \`id\` as its \`key\`; every theme the builder generates carries one.

## Build a theme

A theme is generated from three colours: \`primary\` for accents and selection, \`background\` and \`text\`. The rest of the palette follows from them, light or dark depending on the background. \`useThemeBuilder(source, options?)\` builds one in a component and keeps it between renders:

| Source | The colours come from |
|---|---|
| \`{ colors }\` | The three colours |
| \`{ theme }\` | An existing theme, which comes back as it is when nothing changes |
| \`{ fluentDesignLanguage }\` | The Fluent v9 theme a PCF host hands its controls |

Its options change the theme the source builds:

- **\`tint\`** tints the background and text by a hue, as \`ThemeBuilder.tint\` does.
- **\`edit\`** changes details the colours do not, such as fonts. Themes are cached by the edit's \`key\`, so a key must always mean the same edit.

\`\`\`tsx
const warning = useThemeBuilder({ theme: useTheme() }, { tint: { hue: '#d13438' } })
const compact = useThemeBuilder({ theme: useTheme() }, { edit: { key: 'compact', edit: theme => { theme.fonts.medium.fontSize = 12 } } })
\`\`\`

Outside React, \`createThemeBuilder(source?)\` returns the builder itself, starting from Fluent's defaults without a source:

| Member | Does |
|---|---|
| \`colors\` | The three colours. Change one and the whole palette follows it |
| \`tint(hue, strength?)\` | Tints \`background\` and \`text\` by a hue, the way \`getTintColors\` below does |
| \`edit(key, edit)\` | Adds an edit over the built theme; edits run in the order they were added |
| \`getTheme()\` | The theme, generated from the colours with every edit applied |

\`\`\`ts
const builder = createThemeBuilder({ theme })
builder.tint('#d13438')
const warning = builder.getTheme()
\`\`\`

Tinting or changing a colour generates the theme again from its three colours, so what a \`{ theme }\` source carried beyond them, such as fonts, component styles or earlier edits, is not kept; add it back with \`edit\`. \`tint\` also changes \`colors\` in place, so tinting twice compounds.

Colours, here and in the helpers below, are strings Fluent can parse: hex, \`rgb()\`, \`hsl()\` or a colour name. CSS variables are not colours it can work with.

{{story: Brand colours}}

## Surfaces

Themes are often local: every cell of an escalated ticket is themed red, so the fields inside it fit the row. The list a field opens should not turn red too, because it opens over the whole application.

Base Controls' menus, callouts, tooltips, pickers, panels and dialogs are such surfaces, and they draw in the **application theme**, never in a \`ThemeProvider\`'s local one:

| Opened | Draws in |
|---|---|
| Below an \`ApplicationThemeProvider\` | The nearest application theme |
| With none above | The theme around what opened it |

These follow the application theme:

- the controls
- \`Callout\`, \`ContextualMenu\`, \`TooltipHost\`, \`Panel\`, \`Dialog\` and \`CommandBar\`
- \`ComboBox\`, \`DatePicker\`, \`TimePicker\` and \`TagPicker\`

Fluent's own components take the theme around them. Draw a surface of your own in the theme \`useApplicationTheme()\` returns, and wrap an area whose surfaces should look different in an \`ApplicationThemeProvider\` of its own.

{{story: Red rows}}

## Your own components

Read the theme with Fluent's \`useTheme()\`. Take colours from \`semanticColors\` where one fits, such as \`bodyText\`, \`bodySubtext\` or \`bodyDivider\`, so the component looks right in any theme.

A colour of your own, such as a status, is where themes go wrong: a red that looks right on white glares on a dark background. Start from a hue rather than a finished colour: give a themed area the \`tint\` option of \`useThemeBuilder\`, and work out loose colours with \`getTintColors\`:

| Helper | Returns |
|---|---|
| \`getTintColors(hue, { background, text }, strength?)\` | \`{ background, border, text }\` tinted by \`hue\` over those colours: \`'subtle'\`, the default, is a wash and \`'strong'\` a fill |
| \`getTextColorForBackground(color)\` | A text colour for that background: the nearest shade of its own hue at a contrast of 7:1, or black or white where none reaches it |
| \`getColorContrast(color, otherColor)\` | The WCAG contrast ratio, from 1 to 21. Text needs 4.5 to pass AA and 7 to pass AAA |
| \`isLightColor(color)\` | Whether dark text reads better on it than light text, which also tells a light theme from a dark one |
| \`mixColors(color, base, weight)\` | \`color\` mixed into \`base\`: a \`weight\` of 0 is \`base\`, 1 is \`color\` |

\`getTintColors\` uses different amounts over a light and a dark background, and its text always reaches a contrast of 4.5:1.

{{story: Readable tags}}
`

const meta = {
    title: 'Concepts/Theming',
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
                story: `Deals in an application theme built from three colours, with most parts and grid modules switched on, so their menus, panels and editors open in it too. Try: pick a brand, then edit, sort, filter, group and open the menus.`,
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
                story: `Escalated tickets tinted red by a module's \`registerCellTheme\`; [**Appearance**](?path=/docs/controls-grid-appearance--overview) covers colouring cells. Try: double-click the *Status* of a red ticket and open its list; it opens in the application theme, not in red.`,
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
                story: `A card reading its colours from \`useTheme()\`, in a light and a dark theme, with stage tags each tinted from one hue by \`useThemeBuilder\`'s \`tint\`.`,
            },
        },
    },
}
