import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../grid/guide/gridGuide'
import { EditAndSaveExample } from '../../../../grid/guide/basics/editAndSaveExamples'

const STEP = 'Edit and save'

const DESCRIPTION = `
{{block: progress}}

The team corrects a value where they see it and saves it to the CRM. This step adds the editing module to the grid, and **Save** and **Discard changes** above it.

{{canvas: Edit and save}}

## How it works

This step adds a ribbon to the header and a module to the grid of [**Your first deal grid**](?path=/docs/controls-grid-guide-basics-your-first-deal-grid--overview). In **Code**, the new lines carry \`//new:\`.

**Grid modules.** A grid module adds one feature to the grid, listed in its \`modules\`; what a module is, for every control, is on the Concepts guide's [**Edit and save**](?path=/docs/concepts-guide-basics-edit-and-save--overview). \`createEditingModule()\` lets users change values: a double-click or F2 opens the cell's editor, the control of its data type. Without the module, a double-click opens the record instead. Files and images never open an editor. Every grid module is under *Modules* on [**Reference**](?path=/docs/controls-grid-reference--overview).

**How a value commits.** A value reaches its record when the cell's control commits it:

| Control | Columns | Commits |
|---|---|---|
| Text input | Text, multiline text, email, phone, URL, numbers, currency, a typed duration | When the editor closes |
| Picker that closes, toggle | Option set, two options, date only, a duration picked from its list | As soon as a value is picked |
| Picker that stays open | Date and time, multi-select option set, lookup | On every pick, until you leave the cell |

Enter closes the editor and moves down a row, and Esc closes it and keeps what was typed; \`record.clearChanges()\` undoes a record's changes. Every key is under *Keyboard* on [**Reference**](?path=/docs/controls-grid-reference--overview).

**Saving.** An edit stays on its record as an **unsaved change**. The ribbon's **Save** calls \`provider.save()\`, which saves every changed deal, and **Discard changes** calls \`provider.clearChanges()\`; each shows only while there are unsaved changes. While \`provider.save()\` runs, the grid covers its rows with its loading overlay. The ribbon, and the question the browser asks before a load over unsaved changes, are on the DatasetControl guide's [**Act on deals**](?path=/docs/controls-datasetcontrol-guide-features-act-on-deals--overview).

With \`createEditingModule({ enableAutoSave: true })\`, a record saves each time one of its values commits.

**The save status.** The editing module adds a narrow column at the start of every row, which shows how the row's last save went:

| It shows | When |
|---|---|
| A spinner | While the record saves |
| A green check | For two seconds once the record has saved |
| A red icon | Once the save was refused, until the user dismisses it: see [**Check what users enter**](?path=/docs/controls-grid-guide-basics-check-what-users-enter--overview) |

The status lives on screen only: a row that scrolls out of view, or a grid that mounts again, loses it.

## Try it

- Double-click the first deal's *Value*, replace it with 5000 and press Enter: the focus moves down a row, and **Save** and **Discard changes** appear.
- Double-click a *Stage* and pick *Negotiate*: the picker closes and the value is in. Press **Discard changes**: both deals are as they were, and both commands go.
- Change a value and press **Save**: a spinner covers the grid while the CRM saves, then a green check shows at the start of the row for two seconds.
- In **Code**, pass \`{ enableAutoSave: true }\` to \`createEditingModule\`, then change a value: a spinner shows at the start of its row, then the check.

## Remember

- A grid module adds one feature, listed in the grid's \`modules\`.
- An edit stays unsaved until **Save**, unless auto-save is on.
- The save status at the start of a row shows how its last save went.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Grid/Guide/Basics/Edit and save',
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

export const EditAndSave: Story = {
    name: 'Edit and save',
    tags: ['!dev'],
    render: () => renderStory(<EditAndSaveExample />),
}
