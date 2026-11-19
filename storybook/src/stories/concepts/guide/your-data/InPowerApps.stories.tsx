import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../concepts/guide/startGuide'
import { InPowerAppsExample } from '../../../../concepts/guide/your-data/inPowerAppsExamples'

const STEP = 'In Power Apps'

const DESCRIPTION = `
{{block: progress}}

This step starts from the app of [**The opening plan**](?path=/docs/concepts-guide-more-controls-the-opening-plan--overview) and changes one thing: **Mark N as open** asks first, through the host's dialogs. The same app then runs in Power Apps as a PCF control, with the host's user, culture and dialogs.

{{canvas: In Power Apps}}

## How it works

*StoresRibbon.tsx* and *GridExample.tsx* change, and in **Code** their new lines carry \`//new:\`; *index.tsx* is new. The **PCF context** holds what only the host knows: the user, their culture, the host's dialogs and its data. Every control reads it from the \`PcfContextProvider\` at the root.

| In the code | Is | See |
|---|---|---|
| \`usePcfContext()\` in *StoresRibbon.tsx* | The context at the root; \`navigation.openConfirmDialog\` asks the user through the host | [**PCF context**](?path=/docs/concepts-pcf-context--overview) |
| *index.tsx* | The PCF control: its \`updateView\` renders \`StoreOpenings\` under the root providers, handing \`PcfContextProvider\` the host's context | *In a PCF control* on [**PCF context**](?path=/docs/concepts-pcf-context--overview) |
| \`export\` on \`StoreOpenings\` | What *index.tsx* imports | |

In Power Apps, *index.tsx* is the root, and the context is the host's. Anywhere else, such as this page, the provider builds the context itself, with the browser's own dialogs and the culture you give it: *Outside a PCF control* on [**PCF context**](?path=/docs/concepts-pcf-context--overview) lists what it fills in. The root providers are on [**Your first list**](?path=/docs/concepts-guide-basics-your-first-list--overview).

## Try it

- Tick *Kraków Kazimierz* and *Ghent Korenmarkt*, then **Mark 2 as open**: the browser asks *Mark 2 as open?*
- **Cancel**: both stay *Fitting out*.
- **Mark 2 as open** again and **OK**: both are *Open*.

## Remember

- Read the host through \`usePcfContext()\`: the same code asks Power Apps, or the browser outside it.
- In Power Apps, the PCF control is the root and hands over the host's context.

{{block: navigation}}
`

const meta = {
    title: 'Concepts/Guide/Your data/In Power Apps',
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

export const InPowerApps: Story = {
    name: 'In Power Apps',
    tags: ['!dev'],
    render: () => renderStory(<InPowerAppsExample />),
}
