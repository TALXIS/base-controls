import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../grid/guide/gridGuide'
import { CheckWhatUsersEnterExample } from '../../../../grid/guide/basics/checkWhatUsersEnterExamples'

const STEP = 'Check what users enter'

const DESCRIPTION = `
{{block: progress}}

The CRM has rules: every deal has a name, the CRM sets the account manager, and it refuses a discount the sales director has not approved. This step tells the grid what each column allows, and shows a save the CRM refuses.

{{canvas: Check what users enter}}

## How it works

The grid is the one of [**Edit and save**](?path=/docs/controls-grid-guide-basics-edit-and-save--overview), unchanged. In **Code**, the new lines are in *deals.ts* and carry \`//new:\`: \`RULES\` adds to the \`metadata\` of three columns, and \`DealsProvider\` refuses a discount over 20%.

**What a column allows.** A column's \`metadata\` says what can be done with it. Every key is under *Columns* on [**Reference**](?path=/docs/controls-grid-reference--overview).

| Key | Does | The header shows |
|---|---|---|
| \`RequiredLevel\` | \`1\` or \`2\` makes an empty value invalid | An asterisk, with the editing module |
| \`IsValidForUpdate\` | \`false\` **locks** the column: none of its cells opens an editor | A lock |
| \`MinValue\`, \`MaxValue\` | A whole number or a decimal outside them is invalid | |
| \`MaxLength\` | Single-line text longer than this is invalid | |

A value must also suit its data type: a number, an email address, a URL and a date are checked. [**Lock closed deals**](?path=/docs/controls-grid-guide-features-lock-closed-deals--overview) locks rows and cells as well as columns.

**An invalid value** shows an error icon in its cell, with the message in its tooltip, and a red outline while the cell has the focus. The values are checked in any grid, with or without the editing module. A record with an invalid value is refused before it reaches the provider, and the save status at the start of its row turns red; a click on it lists each error under its column's header text. Rules of your own go in a validation hook, as [**Hooks**](?path=/docs/controls-grid-guide-advanced-hooks--overview) shows.

**A refused save.** The server has the last word. A provider's \`onRecordSave\` refuses a record by resolving with \`{ success: false, errors: [{ fieldName, message }] }\`, as \`DealsProvider\` does; leave out \`fieldName\` for an error about the whole record. A save that throws is refused too, with the error's message. A refused deal keeps its values and stays unsaved. How a provider saves to your server is under *Your own provider* on [**Data providers**](?path=/docs/concepts-data-providers--overview).

## Try it

- Double-click the first deal's *Deal*, clear it and press Enter: an error icon shows; hover it: *Value is required.* Press **Save**: the row's status turns red; click it: the callout lists *Deal* with *Value is required.*
- Double-click an *Account manager*: no editor opens, and the header shows a lock.
- Set a *Probability (%)* to 120: its error icon says *Number must be less than 100.*
- Set another deal's *Discount (%)* to 25 and press **Save**: its status turns red, and its callout lists *Discount (%)* with *A discount over 20% needs the sales director to approve it.* **Save** stays, and **Discard changes** puts the discount back.

## Remember

- A column's metadata checks a value before it is saved.
- A locked column opens no editor.
- The server has the last word, and a refused deal stays unsaved.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Grid/Guide/Basics/Check what users enter',
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

export const CheckWhatUsersEnter: Story = {
    name: 'Check what users enter',
    tags: ['!dev'],
    render: () => renderStory(<CheckWhatUsersEnterExample />),
}
