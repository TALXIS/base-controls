import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from './storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { FromInsideExample, FromOutsideExample } from '../../form/react-form/talkingExamples'

const DESCRIPTION = `
Your code reaches the form from outside through \`onFormReady\` and the events of \`Form.Root\`, and from inside through \`useForm\` and \`useField\`. Through them it reads and sets values, saves, loads again and follows every change. Try it below: press **Set the phone**, then **Save**, and read the log under the form.

{{canvas: Follow the form}}

## From outside the form

\`onFormReady\` hands over an \`IFormApi\` once the record has loaded. Every load, \`refresh()\` included, draws the form anew and hands over a new one.

| Member | Description |
|---|---|
| \`getData()\` | The values by column name, unsaved changes included. |
| \`getField(name)\` | The field, with \`getValue()\` and \`setValue(value)\`. |
| \`refresh()\` | Runs \`onLoad\` again: see [**Loading and saving**](?path=/docs/controls-form-loading-and-saving--overview). |

## Events

| Event | Arguments | Fires when |
|---|---|---|
| \`onFieldValueChanged\` | \`fieldName\`, \`newValue\` | A value changes, from the user or from code. |
| \`onDirtyStateChanged\` | \`isDirty\` | The record gets its first unsaved change, or loses its last. |
| \`onBeforeSave\` | None | A save starts, before the fields are checked. |
| \`onAfterSave\` | \`{ success }\` | A save ends. \`success\` is false when a field failed, a save blocker stopped it or the record refused it. |
| \`onValidationSummaryChanged\` | \`summary\` | A save made a new validation summary: see [**Fields and validation**](?path=/docs/controls-form-fields-and-validation--overview). |
| \`onError\` | \`error\`, \`message\` | \`onLoad\` or a save blocker threw. |

Every event is live.

## From inside the form

Any component of yours inside \`Form.Root\` reaches the form through these hooks:

| Hook | Returns |
|---|---|
| \`useForm()\` | The form. Throws outside \`Form.Root\`. |
| \`useField(name?)\` | The field named, or the field of the \`Form.Field\` around the component; \`null\` with neither. Draws again when its value changes and after each save. |
| \`useValidationSummary()\` | The validation summary as \`{ fieldName?, error, errorMessage }\` items, drawing again when it changes. |

{{story: A part inside the form}}

What \`useForm()\` returns:

| Member | Description |
|---|---|
| \`save()\` | Saves as **Save** does, and resolves when the save ends. |
| \`isDirty()\`, \`isValid()\` | Whether there are unsaved changes, and whether every field passes its checks. |
| \`getRecord()\`, \`getData()\` | The record, and its values with the unsaved changes. |
| \`getField(name)\` | The field, with \`getValue()\`, \`setValue(value)\`, \`getColumn()\` and the rest. |
| \`getValidationSummary()\` | The validation summary of the last save. |
| \`refresh()\` | Runs \`onLoad\` again. |
| \`events\` | The events of \`Form.Root\`; \`addEventListener\` returns what removes the listener again. |
| \`registerSaveBlocker(blocker)\` | Runs \`blocker(request)\` before every save from now on; \`request.isBlocked = true\` stops the save. Returns what removes it. |

\`useForm()\` does not draw the component again: follow \`events\`, as \`SaveBar\` does with \`onDirtyStateChanged\`.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Loading and saving', iconName: 'Save', href: '?path=/docs/controls-form-loading-and-saving--overview', text: 'Load your own record, send each save to your API, save as the user goes and switch records.' },
    { title: 'Fields and validation', iconName: 'CheckList', href: '?path=/docs/controls-form-fields-and-validation--overview', text: 'Make fields required, check their values and show what stops a save.' },
    { title: 'Your own UI', iconName: 'Edit', href: '?path=/docs/controls-form-your-own-ui--overview', text: 'Draw a field, the tabs, the ribbon or the notifications your own way.' },
]

const meta = {
    title: 'Controls/Form/Talking to the form',
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

export const FollowTheForm: Story = {
    name: 'Follow the form',
    render: () => renderStory(<FromOutsideExample />),
}

export const APartInsideTheForm: Story = {
    name: 'A part inside the form',
    render: () => renderStory(<FromInsideExample />),
    parameters: {
        docs: {
            description: {
                story: `A bar of your own above the fields: the name, drawn again as it changes, and a **Save** that asks first. Try: rename the account and press **Save**.`,
            },
        },
    },
}
