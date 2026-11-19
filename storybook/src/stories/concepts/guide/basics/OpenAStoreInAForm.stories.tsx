import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../concepts/guide/startGuide'
import { OpenAStoreInAFormExample } from '../../../../concepts/guide/basics/openAStoreInAFormExamples'

const STEP = 'Open a store in a form'

const DESCRIPTION = `
{{block: progress}}

A row shows a store at a glance, and the team edits the whole store in one place. This step opens a store in a form beside the list when its name is clicked.

{{canvas: Open a store in a form}}

## How it works

The list is the one from [**Views and commands**](?path=/docs/concepts-guide-basics-views-and-commands--overview). In **Code**, the new lines carry \`//new:\`, and *StoreForm.tsx* is new.

**Hooks.** A **hook** is a function you add where a control asks for one, and it changes one thing the control does. \`grid.hooks.openRecord\` asks what opening a record does, such as a click on a store's name: the hook sets \`request.isHandled\`, so the provider does not open the store itself, and hands the record to \`onOpenStore\`. What an open request holds is under *Link to the record* on [**Shape the columns**](?path=/docs/controls-grid-guide-make-it-yours-shape-the-columns--overview), and every hook of the grid is under *Hooks* on Grid's [**Reference**](?path=/docs/controls-grid-reference--overview). The grid calls \`onSetup\` with each new grid before it loads, the place to add a hook: see Grid's [**From your code**](?path=/docs/controls-grid-guide-advanced-from-your-code--overview).

**The form.** \`StoreForm\` hands the grid's own record to \`Form.Root\` from \`onLoad\`, and draws a field for each column the list shows. The form and the grid share that record, so a change in one shows in the other at once. How a form lays out its fields: [**Form**](?path=/docs/controls-form-get-started--overview).

**The panel.** \`Panel\` is Fluent's panel, which Base Controls draws in the app theme: see [**Fluent UI**](?path=/docs/concepts-fluent-ui--overview).

## Try it

- Click *Kraków Kazimierz*: its form opens in a panel.
- Change its *Manager* to *Anna Wiśniewska* and close the panel: the grid shows her, and the ribbon offers **Save**.
- Press **Edit columns**, add *Seats* and press **Save**, then open a store: its form has *Seats* too.

## Remember

- A hook changes one thing a control does, such as what opening a record does.
- The form and the grid share one record.

Your list edits and saves the stores, switches views and opens each store in a form. *More controls* shows the same stores on a map and plans each opening.

{{block: navigation}}
`

const meta = {
    title: 'Concepts/Guide/Basics/Open a store in a form',
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

export const OpenAStoreInAForm: Story = {
    name: 'Open a store in a form',
    tags: ['!dev'],
    render: () => renderStory(<OpenAStoreInAFormExample />),
}
