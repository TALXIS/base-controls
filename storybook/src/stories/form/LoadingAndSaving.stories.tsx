import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from './storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { ILifecycleStep, Lifecycle } from '../../grid/showcase/Lifecycle'
import { AutoSaveExample, SaveExample, SwitchRecordsExample } from '../../form/react-form/loadingAndSavingExamples'

const DESCRIPTION = `
A form does not fetch data itself: you hand it a record, and it edits that record and saves it through the record's data provider. The record can be one a grid already shows, or one held in memory whose saves go to your API. Try it below: set *Credit limit* above 50,000 and press **Save**.

{{canvas: Save to your API}}

## Lifecycle

\`Form.Root\` loads its record as it mounts, and again whenever your code asks for it.

{{block: lifecycle}}

## A record of your own

\`createMemoryRecord\` holds one record in memory, for a form with no data provider behind it, as the example above does:

| Parameter | Holds |
|---|---|
| \`columns\` | The fields, as a data provider's columns: see [**Data providers**](?path=/docs/concepts-data-providers--overview). |
| \`data\` | The values by column name, as Dataverse returns a record. |
| \`metadata\` | \`PrimaryIdAttribute\` and \`PrimaryNameAttribute\`, the columns of the record's id and name. |
| \`save\` | Optional. Called with the record on every save, before the change is committed; without it, a save only commits in memory. |

\`save\` resolves \`{ recordId, success, fields, errors? }\`, where \`fields\` names the columns the save wrote and each error is \`{ fieldName?, message }\`. A \`save\` that throws fails the save, with the error's message as its error.

## Save the record

**Save** on the ribbon, \`enableAutoSave\` and \`save()\` of \`useForm()\` all save the same way. Every field of the record is checked first, and one that fails stops the save, as [**Fields and validation**](?path=/docs/controls-form-fields-and-validation--overview) describes. The record then saves through its provider: a save that succeeds commits the change, and one that fails commits nothing and shows its errors in \`Form.Notifications\`, an error with a \`fieldName\` after its column's display name.

\`Form.Ribbon\` takes an \`onSave\` of its own, which its **Save** calls in place of saving. The events before and after every save are on [**Talking to the form**](?path=/docs/controls-form-talking-to-the-form--overview).

## Save as you go

With \`enableAutoSave\`, the form saves each change as soon as it reaches the record; a text field hands its value over as the user leaves it. Values set together are saved once, a change made while a save runs is saved after it, and each save checks the fields as **Save** does. \`enableAutoSave\` is read at mount.

{{story: Save as you go}}

## Edit a record you already have

A record of a grid, or of any other data provider, goes to \`onLoad\` as it is and saves through that provider. \`onLoad\` runs only at mount and on \`reload()\`, so to show another record, give the form a new \`key\` to mount it anew.

{{story: Switch records}}

## Reference

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`onLoad\` | \`() => Promise<{ record }>\` | Required | At mount | Resolves the record the form edits; runs again on \`reload()\`. |
| \`enableAutoSave\` | \`boolean\` | \`false\` | At mount | Saves each change as it reaches the record. |
| \`onFormReady\` | \`(api: IFormApi) => void\` | None | At mount | Gets the api after each load: see [**Talking to the form**](?path=/docs/controls-form-talking-to-the-form--overview). |
| \`children\` | \`ReactNode\` | None | Live | The parts the form draws. |

The events of \`Form.Root\` are on [**Talking to the form**](?path=/docs/controls-form-talking-to-the-form--overview).

## Where next

{{block: explore}}
`

const LIFECYCLE: ILifecycleStep[] = [
    { title: 'The record loads', hook: 'onLoad', text: 'A placeholder stands in for the form while `onLoad` resolves `{ record }`; when it throws, `onError` gets its message and the placeholder stays.' },
    { title: 'The form is ready', hook: 'onFormReady', text: 'The parts draw over the record, and `onFormReady` gets an `IFormApi` for your code.' },
    { title: 'The user edits and saves', hook: 'onAfterSave', text: 'Every change is made on the record itself, and each save goes through the record\'s provider.' },
    { title: 'The record loads again', hook: 'reload()', text: '`reload()` runs `onLoad` again behind the placeholder and draws the record it returns anew, unsaved changes included, with a new api for `onFormReady`.' },
    { title: 'The form unmounts', text: 'The form stops following the record and leaves it as it is, unsaved changes included.' },
]

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
            page: gridDocsPage(DESCRIPTION, { lifecycle: () => <Lifecycle steps={LIFECYCLE} />, explore: () => <ExploreCards cards={EXPLORE} /> }),
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
                story: `Three accounts of one provider, one at a time in the form, each keeping its unsaved changes. Try: rename Contoso, switch to Fabrikam and back.`,
            },
        },
    },
}
