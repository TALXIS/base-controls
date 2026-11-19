import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../concepts/guide/startGuide'
import { YourBrandExample } from '../../../../concepts/guide/make-it-yours/yourBrandExamples'

const STEP = 'Your brand'

const DESCRIPTION = `
{{block: progress}}

This step starts from the app of [**The opening plan**](?path=/docs/concepts-guide-more-controls-the-opening-plan--overview) and changes one thing: every control draws in the coffee chain's colours, down to the panel a store opens in.

{{canvas: Your brand}}

## How it works

The app is the one from [**The opening plan**](?path=/docs/concepts-guide-more-controls-the-opening-plan--overview), and only *GridExample.tsx* changes. In **Code**, the new lines carry \`//new:\`. A **theme** is the colours, fonts and effects the controls draw in, and \`useThemeBuilder\` generates a whole one from three colours: an accent, a background and a text colour. \`AppThemeProvider\` hands it to every control below it, and the panels, menus and callouts they open draw in it too.

Here the provider wraps \`StoreOpenings\`; in your application, it is the \`AppThemeProvider\` among the root providers of [**Your first list**](?path=/docs/concepts-guide-basics-your-first-list--overview). A dark variant, an area in a theme of its own, and colours for your own components are on [**Theming**](?path=/docs/concepts-theming--overview).

## Try it

- Tick *Kraków Kazimierz*: its checkbox, the store names and the icon of **Mark 1 as open** are coffee brown.
- Open *Porto Ribeira*: the panel, the form and the opening plan are drawn in the brand too.
- In **Code**, change \`primary\` to \`'#0f7b8a'\`: the accent turns teal.

## Remember

- Three colours make a theme.
- Set it once at the root: every control, and everything it opens, draws in it.

{{block: navigation}}
`

const meta = {
    title: 'Concepts/Guide/Make it yours/Your brand',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { progress: () => <GuideProgress current={STEP} />, navigation: () => <GuideNavigation current={STEP} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const YourBrand: Story = {
    name: 'Your brand',
    tags: ['!dev'],
    render: () => renderStory(<YourBrandExample />),
}
