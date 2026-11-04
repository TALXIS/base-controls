import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from './storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { ValidationExample } from '../../form/react-form/fieldsAndValidationExamples'

const DESCRIPTION = `
\`Form.Field\` binds what is inside it to one column of the record, and says whether that field is required and whether its value is valid. A save checks every field first; when one fails, the save stops, the control shows the error and \`Form.Notifications\` lists every failure. Try it below: type a phone number without a country code and press **Save**.

{{canvas: Check the phone}}

## Bind a field

- \`name\` is the name of a column of the record. The cell's label, the control and \`useField()\` inside the field all work on that column.
- Two fields of one name show the same value.
- \`disabled\` on \`Form.Control\` draws the field read-only, with a lock by the label.

## Make a field required

A column whose metadata has \`RequiredLevel\` 1 or 2 is required wherever it is edited, as *Account name* is in the example. \`requiredLevel\` on \`Form.Field\` sets the requirement on this form instead. It takes \`RequiredLevelEnum\` from \`@talxis/client-metadata\`:

| Value | Name | The field |
|---|---|---|
| 0 | \`None\` | Is not required, even when its column is. |
| 1, 2 | \`SystemRequired\`, \`ApplicationRequired\` | Is required: when empty, it stops a save. The label has a red asterisk. |
| 3 | \`Recommended\` | Has a blue plus by its label, and never stops a save. |

## Check a value

- \`validation\` takes \`{ error, errorMessage }\`. Work it out from the value and pass it again whenever it changes, as the example does from \`onFieldValueChanged\`.
- A save checks a field's \`validation\` first, then the record's own checks: the requirement, a column's \`MaxLength\`, \`MinValue\` and \`MaxValue\`, and the format of an email or a URL.

## When errors show

- Nothing shows until the user first tries to save. From then on, each control shows its error under it as its value changes.
- The failures of a save are its *validation summary*, made again at each save.
- A save checks every column of the record, whether the form shows it or not.
- The \`requiredLevel\` and \`validation\` of a field written straight in the children of \`Form.Root\` count even in a tab never opened. Those of a field inside a component of yours count once that component has rendered.

## Show messages

- \`Form.Notifications\` shows its \`messages\` first, then the validation summary, each failure after its column's display name. A failed save's \`errors\` land there too: see [**Loading and saving**](?path=/docs/controls-form-loading-and-saving--overview).
- A message is \`{ text, level }\`, with \`level\` one of \`'ERROR'\`, \`'WARNING'\` and \`'INFO'\`. \`text\` is HTML.
- Several messages fold into one bar headed by their count, coloured by the most severe; a click unfolds them.
- \`useValidationSummary()\` and \`onValidationSummaryChanged\` hand the summary to your code: see [**Talking to the form**](?path=/docs/controls-form-talking-to-the-form--overview).

## Reference

| Part | Prop | Description |
|---|---|---|
| \`Form.Field\` | \`name\` | The column the field binds to. |
| \`Form.Field\` | \`requiredLevel\` | A \`RequiredLevelEnum\` value in place of the column's requirement. |
| \`Form.Field\` | \`validation\` | \`{ error, errorMessage }\`, checked before the record's own checks. |
| \`Form.Control\` | \`disabled\` | Draws the field read-only, with a lock by the label. |
| \`Form.Notifications\` | \`messages\` | \`{ text, level }\` items, shown before the validation summary. |

Every prop is live. \`components\` of \`Form.Control\` and \`Form.Notifications\` changes how they draw: see [**Your own UI**](?path=/docs/controls-form-your-own-ui--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Loading and saving', iconName: 'Save', href: '?path=/docs/controls-form-loading-and-saving--overview', text: 'Send each save to your API and show what it refused.' },
    { title: 'Your own UI', iconName: 'Edit', href: '?path=/docs/controls-form-your-own-ui--overview', text: 'Draw a field, the tabs, the ribbon or the notifications your own way.' },
    { title: 'Talking to the form', iconName: 'Plug', href: '?path=/docs/controls-form-talking-to-the-form--overview', text: 'Follow every change and save, and read, set and save values from your own code.' },
]

const meta = {
    title: 'Controls/Form/Fields and validation',
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

export const CheckThePhone: Story = {
    name: 'Check the phone',
    render: () => renderStory(<ValidationExample />),
}
