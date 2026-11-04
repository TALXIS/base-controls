import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from './storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { AutoSaveExample, SaveExample, SwitchRecordsExample } from '../../form/react-form/loadingAndSavingExamples'

const DESCRIPTION = `
A form edits one \`IRecord\`, the same object a data provider holds for each of its rows. \`Form.Root\` asks for it through \`onLoad\`, edits it in place and saves it through the record's own provider. Try it below: set *Credit limit* above 50,000 and press **Save**.

{{canvas: Save to your API}}

## Load a record

- \`onLoad\` returns \`{ record }\`. It runs as the form mounts, behind a placeholder, and again on every refresh.
- When it throws, \`onError\` gets the error and the placeholder stays.

\`createMemoryRecord\` makes a record for a form with no data provider behind it:

| Parameter | Holds |
|---|---|
| \`columns\` | The fields, as a data provider's columns: see [**Data providers**](?path=/docs/concepts-data-providers--overview). |
| \`data\` | The values by column name, as Dataverse returns a record. |
| \`metadata\` | \`PrimaryIdAttribute\` and \`PrimaryNameAttribute\`, the columns of the record's id and name. |
| \`onSave\` | Optional. Called with the record on every save; without it, a save only commits in memory. |

## Save the record

The ribbon's **Save**, \`autoSave\` and \`useForm().save()\` all save the same way:

1. Every field of the record is checked first. When one fails, the save stops: see [**Fields and validation**](?path=/docs/controls-form-fields-and-validation--overview).
2. The record saves through its provider; a record from \`createMemoryRecord\` calls \`onSave\`.
3. A save that succeeds commits the change. One that fails commits nothing, and its errors show in \`Form.Notifications\`.

\`onSave\` returns \`{ recordId, success, fields, errors? }\`:

- \`fields\` names the columns the save wrote.
- \`errors\` is a list of \`{ fieldName?, message }\`. \`Form.Notifications\` puts the column's display name before the message of an error with a \`fieldName\`.
- An \`onSave\` that throws fails the save, with the error's message as its error.

\`Form.Ribbon\` takes an \`onSave\` of its own, which its **Save** button calls in place of saving. \`onBeforeSave\` and \`onAfterSave\` on \`Form.Root\` follow every save: see [**Talking to the form**](?path=/docs/controls-form-talking-to-the-form--overview).

## Save as you go

With \`autoSave\`, the form saves each change as soon as the user commits it, by leaving the field.

- Values set together are saved once, and a change made while a save runs is saved after it.
- Each save checks the fields as **Save** does.
- The form reads \`autoSave\` at mount.

{{story: Save as you go}}

## Pass a record you already have

A record of a grid or any other data provider goes to \`onLoad\` as it is, and saves through that provider. \`onLoad\` runs at mount and on refresh only, so to show another record, mount the form anew with a new \`key\`.

{{story: Switch records}}

## Load again

\`refresh()\`, on the api of \`onFormReady\` and on \`useForm()\`, runs \`onLoad\` again and draws the form anew. The record \`onLoad\` returns is shown as it is, unsaved changes included; return a new record to drop them.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Fields and validation', iconName: 'CheckList', href: '?path=/docs/controls-form-fields-and-validation--overview', text: 'Make fields required, check their values and show what stops a save.' },
    { title: 'Talking to the form', iconName: 'Plug', href: '?path=/docs/controls-form-talking-to-the-form--overview', text: 'Follow every change and save, and read, set and save values from your own code.' },
    { title: 'Data providers', iconName: 'Database', href: '?path=/docs/concepts-data-providers--overview', text: 'Where records come from and where they are saved: in memory, in Dataverse or behind your API.' },
]

const meta = {
    title: 'Controls/Form/Loading and saving',
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

export const SaveToYourApi: Story = {
    name: 'Save to your API',
    render: () => renderStory(<SaveExample />),
}

export const SaveAsYouGo: Story = {
    name: 'Save as you go',
    render: () => renderStory(<AutoSaveExample />),
    parameters: {
        docs: {
            description: {
                story: `The account saves each change as the user leaves the field. Try: change the phone, then click outside the field.`,
            },
        },
    },
}

export const SwitchRecords: Story = {
    name: 'Switch records',
    render: () => renderStory(<SwitchRecordsExample />),
    parameters: {
        docs: {
            description: {
                story: `Three accounts of one provider, one at a time in the form. Try: rename Contoso, switch to Fabrikam and back.`,
            },
        },
    },
}
