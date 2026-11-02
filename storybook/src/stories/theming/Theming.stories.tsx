import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { BrandExample, OwnComponentExample, SurfaceExample } from './themingExamples'

const DESCRIPTION = `
A theme says what everything is drawn in: its colours, fonts and effects. It is a Fluent theme, so the controls, Fluent's own components and yours all look the same, and one theme at the root of the application is all most applications need.

## The provider

Controls draw in the theme of the nearest \`ThemeProvider\` above them. Put one at the root of the application:

\`\`\`tsx
const Root = () => {
    const theme = useThemeBuilder({ colors: { primary: '#5B5FC7', background: '#ffffff', text: '#242424' } })
    return <ThemeProvider theme={theme}>
        <App />
    </ThemeProvider>
}
\`\`\`

Without a \`theme\`, a provider takes the theme of the provider above it, or Fluent's default colours when there is none. Providers nest, so a provider further down themes only what is inside it, such as a dark banner. It also paints its own element in the theme's background and font; \`applyTo='none'\` hands the theme down without painting anything.

A control reads the theme when it mounts. To switch themes, mount it again, for example with the theme's \`id\` as its \`key\`.

## Build a theme

A theme is generated from three colours: \`primary\` for accents and selection, \`background\` and \`text\`. The rest of the palette follows from them, light or dark depending on the background. \`useThemeBuilder(source, edit?)\` builds one in a component and keeps it between renders:

| Source | The colours come from |
|---|---|
| \`{ colors }\` | The three colours |
| \`{ theme }\` | An existing theme, which comes back as it is when nothing changes |
| \`{ fluentDesignLanguage }\` | The Fluent v9 theme a PCF host hands its controls |

An edit changes details the colours do not, such as fonts. Themes are cached by their edit's \`key\`, so a key must always mean the same edit:

\`\`\`tsx
const compact = useThemeBuilder({ theme: useTheme() }, { key: 'compact', edit: theme => { theme.fonts.medium.fontSize = 12 } })
\`\`\`

Outside React, \`createThemeBuilder(source)\` returns the builder itself. Change its \`colors\`, add edits with \`edit(key, edit)\`, then call \`getTheme()\`. Without a source, it builds Fluent's defaults.

{{story: Brand colours}}

## Surfaces

Themes are often local. Take a grid that draws escalated tickets red: every cell of such a ticket is themed red, so the fields inside it fit the row. But the list a field opens should not turn red too. It opens over the whole application, so it should look like the rest of the application.

Menus, callouts, tooltips, pickers, panels and dialogs are such surfaces, and they draw in the **surface theme** rather than in the theme of what opened them. Unless you set it, the surface theme is the theme of the root provider, so every surface looks like the application however the area around it is themed. To give one area's surfaces another theme, pass \`surfaceTheme\` to its provider; it applies to everything opened below it.

The controls follow the surface theme, and so do this package's \`Callout\`, \`ContextualMenu\`, \`TooltipHost\`, \`Panel\`, \`Dialog\` and \`CommandBar\`. Fluent's own components take the theme around them, so for a surface of your own, use one of these or draw it in the theme \`useSurfaceTheme()\` returns.

{{story: Red rows}}

## Your own components

Read the theme with Fluent's \`useTheme()\`. Take colours from \`semanticColors\` where one fits, such as \`bodyText\`, \`bodySubtext\` or \`bodyDivider\`, so the component looks right in any theme. For a colour of your own, two helpers keep text readable on it:

| Helper | Returns |
|---|---|
| \`getTextColorForBackground(color)\` | A text colour that reads on that background |
| \`isLightColor(color)\` | Whether text on that colour has to be dark |

{{story: Readable tags}}
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
                story: `Deals in a theme built from three colours; its menus and panels open in it too. Try: pick a brand or your own colours.`,
            },
        },
    },
}

export const YourOwnComponent: Story = {
    name: 'Readable tags',
    render: () => renderStory(<OwnComponentExample />),
    parameters: {
        docs: {
            description: {
                story: `A card reading its colours from \`useTheme()\`, in two themes, with tags whose text comes from \`getTextColorForBackground\`.`,
            },
        },
    },
}

export const Surfaces: Story = {
    name: 'Red rows',
    render: () => renderStory(<SurfaceExample />),
    parameters: {
        docs: {
            description: {
                story: `Escalated tickets drawn red. Try: double-click the *Status* of a red ticket and open its list; it opens in the application theme, not in red.`,
            },
        },
    },
}
