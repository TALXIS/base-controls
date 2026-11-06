import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from './storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { XrmOverviewExample } from '../../form/xrm-form/examples/overviewExamples'

const DESCRIPTION = `
A model-driven app in Dataverse keeps each form's layout as FormXml, and runs form scripts against the form's \`formContext\`. \`XrmForm\` draws a form from that FormXml with the parts of \`Form\` and hands your code the same \`formContext\`, so a Dataverse form and its scripts can move into a React application or a PCF control. Try it below: open \`formXml.ts\` in **Code** and move *Phone* into the *Status* section.

{{canvas: Overview}}

## The FormXml

Take a form's FormXml as Dataverse stores it, in the \`formxml\` of its \`systemform\` record or in an exported solution. \`XrmForm\` draws its tabs, their columns and sections, and the cells in them. Each cell's \`control\` binds the column named in its \`datafieldname\` and is drawn for that column's data type, so \`classid\` and the like can stay as they are. A label shows in the user's language, by \`languagecode\`, or else in English (1033).

| Element | What XrmForm reads |
|---|---|
| \`tab\` | \`name\`, \`visible\`, \`showlabel\`, \`expanded\` |
| \`column\` | \`width\` |
| \`section\` | \`name\`, \`columns\` (one column per digit: \`11\` is two), \`visible\`, \`showlabel\`, \`celllabelposition\`, \`labelwidth\` |
| \`cell\` | \`colspan\`, \`rowspan\`, \`visible\`, \`showlabel\` |
| \`control\` | \`id\`, \`datafieldname\`, \`disabled\` |

\`XrmForm\` does not draw the header, the footer or the navigation, and a control with no \`datafieldname\`, such as a subgrid or a web resource, shows an error in its place. It does not load form libraries either: run their code in \`onFormReady\`, as [**Form context**](?path=/docs/controls-form-xrm-form-context--overview) shows.

## The record

\`onLoad\` resolves the record together with the FormXml. The record has a column for every \`datafieldname\`, and its data is shaped as the Dataverse Web API returns it. \`createMemoryRecord\` holds one in memory, as \`account.ts\` does; loading, saving and the lifecycle are on [**Loading and saving**](?path=/docs/controls-form-loading-and-saving--overview), and work the same here.

## Props

| Prop | Description |
|---|---|
| \`onLoad\` | Resolves \`{ record, formXml }\`, at mount and on refresh. |
| \`onFormReady\` | Called with \`{ formContext, api }\` after each load: see [**Form context**](?path=/docs/controls-form-xrm-form-context--overview). |
| \`autoSave\` | Saves each change as it reaches the record. At mount. |
| \`components\` | Draws the controls, the tabs, the ribbon or the notifications your own way: see [**Your own UI**](?path=/docs/controls-form-xrm-your-own-ui--overview). |
| \`onFieldValueChanged\`, \`onDirtyStateChanged\`, \`onValidationSummaryChanged\`, \`onBeforeSave\`, \`onAfterSave\`, \`onError\` | The events of \`Form.Root\`: see [**Talking to the form**](?path=/docs/controls-form-talking-to-the-form--overview). |

Like every control, \`XrmForm\` needs the root providers above it: see [**Quick start**](?path=/docs/concepts-quick-start--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Form context', iconName: 'Code', href: '?path=/docs/controls-form-xrm-form-context--overview', text: 'Read and change values, show and hide parts of the form, and check a save from your scripts.' },
    { title: 'Your own UI', iconName: 'GridViewSmall', href: '?path=/docs/controls-form-xrm-your-own-ui--overview', text: 'Draw the controls, the tabs, the ribbon or the notifications your own way.' },
    { title: 'Loading and saving', iconName: 'Save', href: '?path=/docs/controls-form-loading-and-saving--overview', text: 'Hand the form a record from memory or from a data provider, and save it where it belongs.' },
]

const meta = {
    title: 'Controls/Form/Xrm/Overview',
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
    render: () => renderStory(<XrmOverviewExample />),
}
