import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from './storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { AccountFormExample } from '../../form/react-form/getStartedExamples'

const DESCRIPTION = `
A form edits one record, laid out in tabs, columns and sections, with each field drawn by the Base Controls field for its data type. It tracks unsaved changes, checks required fields before it saves, and shows what stopped a save. Try it below: clear *Account name* and press **Save**.

{{canvas: Overview}}

## The parts

The parts nest in JSX, outermost first:

- \`Form.Root\` loads the record through \`onLoad\` and holds every other part: see [**Loading and saving**](?path=/docs/controls-form-loading-and-saving--overview).
- \`Form.Ribbon\` saves the record, and shows *Unsaved changes* while there are any.
- \`Form.Notifications\` shows your messages and what stopped the last save.
- \`Form.Tabs\` and \`Form.Tab\` draw the tabs; your state holds the open one.
- \`Form.Column\` and \`Form.Section\` lay the fields out in columns and titled boxes: see [**Layout**](?path=/docs/controls-form-layout--overview).
- \`Form.Field\` binds what is inside it to one column of the record, and holds whether it is required and valid: see [**Fields and validation**](?path=/docs/controls-form-fields-and-validation--overview).
- \`Form.Cell\` draws the label, the required mark and the control.
- \`Form.Control\` draws the Base Controls field for the column's data type.

The form needs the root providers every control needs: see [**Quick start**](?path=/docs/concepts-quick-start--overview). Each part draws through slots of its own: see [**Your own UI**](?path=/docs/controls-form-your-own-ui--overview). Your code reads, changes and saves the form through \`onFormReady\`, the events of \`Form.Root\` and \`useForm\`: see [**Talking to the form**](?path=/docs/controls-form-talking-to-the-form--overview).

## Lay it out in FormXml

\`XrmForm\` draws a FormXml layout over the same form, and runs your scripts against an Xrm \`formContext\` as a model-driven app does: see [**Xrm**](?path=/docs/controls-form-xrm-overview--overview).

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
