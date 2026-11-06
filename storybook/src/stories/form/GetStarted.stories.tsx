import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from './storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { AccountFormExample } from '../../form/react-form/getStartedExamples'

const DESCRIPTION = `
A form edits one record, laid out in tabs, columns and sections, with each field drawn by the Base Controls field for its data type. It keeps track of unsaved changes, checks every field before it saves, and shows what stopped a save. Try it below: clear *Account name* and press **Save**.

{{canvas: Overview}}

## The parts

A form is built from parts that nest in JSX, outermost first. \`Form.Root\` holds all the others; leave out any the screen does not need, such as the tabs.

| Part | Does | More on |
|---|---|---|
| \`Form.Root\` | Loads the record through \`onLoad\` and saves it. | [**Loading and saving**](?path=/docs/controls-form-loading-and-saving--overview) |
| \`Form.Ribbon\` | Draws **Save**, and *Unsaved changes* while there are any. | [**Your own UI**](?path=/docs/controls-form-your-own-ui--overview) |
| \`Form.Notifications\` | Shows your messages, then what stopped the last save. | [**Fields and validation**](?path=/docs/controls-form-fields-and-validation--overview) |
| \`Form.Tabs\`, \`Form.Tab\` | Draw a header for each tab and show the open one. | [**Layout**](?path=/docs/controls-form-layout--overview) |
| \`Form.Column\`, \`Form.Section\` | Lay the fields out in columns and titled boxes. | [**Layout**](?path=/docs/controls-form-layout--overview) |
| \`Form.Field\` | Binds what is inside it to one column of the record, and says whether it is required and valid. | [**Fields and validation**](?path=/docs/controls-form-fields-and-validation--overview) |
| \`Form.Cell\` | Draws the label, the required mark and the control. | [**Layout**](?path=/docs/controls-form-layout--overview) |
| \`Form.Control\` | Draws the Base Controls field for the column's data type. | [**Your own UI**](?path=/docs/controls-form-your-own-ui--overview) |

## Set it up

The form needs the root providers every control needs: see [**Quick start**](?path=/docs/concepts-quick-start--overview). Your code follows the form, and reads, sets and saves its values, through \`onFormReady\`, the events of \`Form.Root\` and \`useForm()\`: see [**Talking to the form**](?path=/docs/controls-form-talking-to-the-form--overview).

## Draw it from FormXml

\`XrmForm\` draws a Dataverse form's FormXml with these same parts, and runs your form scripts against \`formContext\`: see [**Xrm**](?path=/docs/controls-form-xrm-overview--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Loading and saving', iconName: 'Save', href: '?path=/docs/controls-form-loading-and-saving--overview', text: 'Load your own record, send each save to your API, save as the user goes and switch records.' },
    { title: 'Layout', iconName: 'ResponsiveDesign', href: '?path=/docs/controls-form-layout--overview', text: 'Tabs, columns, sections and cells that take as many columns as their width allows.' },
    { title: 'Fields and validation', iconName: 'CheckList', href: '?path=/docs/controls-form-fields-and-validation--overview', text: 'Make fields required, check their values and show what stops a save.' },
]

const meta = {
    title: 'Controls/Form/Get started',
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

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<AccountFormExample />),
}
