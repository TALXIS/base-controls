import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../concepts/guide/startGuide'
import { YourLanguageExample } from '../../../../concepts/guide/make-it-yours/yourLanguageExamples'

const STEP = 'Your language'

const DESCRIPTION = `
{{block: progress}}

This step starts from the app of [**The opening plan**](?path=/docs/concepts-guide-more-controls-the-opening-plan--overview) and changes one thing: every label the controls draw is in Czech, for the chain's team in Kraków.

{{canvas: Your language}}

## How it works

Only *GridExample.tsx* changes, and in **Code** its new lines carry \`//new:\`. Every string a control draws is a **label**, with an English default. \`LabelsProvider\` replaces the labels of everything below it, and \`CZECH_LABELS\` holds Czech for every part of the library.

| Drawn | Comes from | See |
|---|---|---|
| **Uložit**, **Upravit sloupce**, the search box, the column menus, **Nový** in the opening plan | The labels | [**Localization**](?path=/docs/concepts-localization--overview) |
| *All stores*, *Store*, *Fitting out*, *stores* in the search box, **Mark 2 as open** | Your data and your code: translate them where you define them | [**Localization**](?path=/docs/concepts-localization--overview) |
| Dates, numbers and the timeline's months | The culture of the PCF context | [**In Power Apps**](?path=/docs/concepts-guide-your-data-in-power-apps--overview) |

Here the provider wraps \`StoreOpenings\`; in your application, it goes among the root providers of [**Your first list**](?path=/docs/concepts-guide-basics-your-first-list--overview).

## Try it

- Click the search box: its hint is in Czech, and the columns it lists keep their names.
- Open **Upravit sloupce**, then a column's menu: both are in Czech.
- Open a store: **Uložit** on its ribbon, and **Nový** and **Přejít na dnešek** over its plan.
- In **Code**, rename *All stores* to *Všechny prodejny* in \`VIEWS\`: the view switcher shows the new name.

## Remember

- Labels come from the provider, names from your data.
- One provider at the root translates the whole application.

{{block: navigation}}
`

const meta = {
    title: 'Concepts/Guide/Make it yours/Your language',
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

export const YourLanguage: Story = {
    name: 'Your language',
    tags: ['!dev'],
    render: () => renderStory(<YourLanguageExample />),
}
