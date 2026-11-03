import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EditColumnsExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `
A view comes with the columns you gave it, but users often want to see something else, such as a deal's probability. Edit columns lets them change that themselves: a button opens a panel where they add, reorder and remove the view's columns, and saving reloads the control with them, each view keeping its own. You add it with \`DatasetControl.EditColumns\`.

{{story: Choose the columns of a view}}

## How it behaves

- **Adding:** an added column goes first in the list; drag it to where it belongs.
- **Loading:** the pickers say *Loading...* while the columns load, and a failed load shows its error with *Try again*.
- **Hidden columns:** the editor does not list them, and saving keeps them as they are.
- **Disabled:** the button while the provider loads, and *Save* while no visible column is left.
- **Cancel:** *Cancel*, or closing the panel, drops the changes.
- **Saving:** writes the columns, clears the selection and remounts the control; the columns are kept per view (see [**State**](?path=/docs/controls-datasetcontrol-state--overview)).
- **Unsaved changes:** saving asks about them first, and writes nothing if the user keeps them.
- **Compact header:** only the icon shows, with the label as its tooltip; see *Fit a narrow screen* on [**Layout**](?path=/docs/controls-datasetcontrol-layout--overview).

## Columns it offers

The provider supplies what the pickers list, fetched anew each time the editor opens; the example's *views.ts* sets \`onGetAvailableColumns\`.

| Provider hook | What it feeds |
|---|---|
| \`onGetAvailableColumns(options?)\` | The column picker: the records' own columns, or a related entity's when \`options.entityName\` is given. |
| \`onGetAvailableRelatedColumns()\` | The *Column source* picker: when it returns any entities, the user can add columns of related records too. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`components\` | \`IEditColumnsComponents\` | Defaults | See [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview). |

## From your code

\`control.parts.get('editColumns')\` returns the part once it is drawn (see *Reach the parts* on [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview)). Open the editor from a button of your own, as *Columns* in the example's footer does.

| Member | Does |
|---|---|
| \`open()\` | Opens the editor over the provider's columns. |
| \`close()\` | Closes the editor and drops what was not saved. |
| \`save()\` | Asks about unsaved changes, then writes the columns, clears the selection, closes the editor and remounts the control. |
| \`isOpen()\` | Whether the editor is open. |
| \`events\` | \`onOpenChanged\`, whenever the editor opens or closes. |
| \`getSession()\` | The edit in progress, while the editor is open. |
| \`registerCommands(hook, priority?)\` | Adds commands above the pickers; see *Add your own commands*. |
| \`registerColumnCommands(hook, priority?)\` | Adds commands to each chosen column; see *Add your own commands*. |

The session holds the edit until it is saved:

| Member | Does |
|---|---|
| \`getColumns()\` | The visible chosen columns, in order. |
| \`getAvailableColumns(query?)\` | Fetches the columns the picker offers, filtered by \`query\`. |
| \`addColumn(column)\` | Adds the column first. |
| \`removeColumn(name)\` | Removes the column. |
| \`moveColumn(name, targetName)\` | Moves the column to where \`targetName\` is. |
| \`setScope(scope)\` | Sets which entity the columns being added come from. |
| \`refreshColumns()\` | Gives the chosen columns the provider's current definitions, after they changed. |
| \`events\` | \`onColumnsChanged\`, whenever the chosen columns change. |

## Add your own commands

\`hook(commands, session)\` changes the commands above the pickers in place, and \`hook(commands, column, session)\` those of each chosen column, with Remove first. Both return their unregistration, and a higher \`priority\` runs later.

The example adds *Keep only the deal* above the pickers.

Dragging swallows clicks: give column commands \`onMouseUp\`, not \`onClick\`.

**Strings:** \`EDIT_COLUMNS_LABELS\`, keys \`editColumns.*\`. See [**Localization**](?path=/docs/concepts-localization--overview).
`

const meta = {
    title: 'Controls/DatasetControl/Parts/Edit columns',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ChooseTheColumns: Story = {
    name: 'Choose the columns of a view',
    render: () => renderStory(<EditColumnsExample />),
    parameters: {
        docs: {
            description: {
                story: `Each view keeps the columns the user chose. Try: switch to *Won deals*, add *Probability (%)* through *Columns* and save, switch to *All deals* and back, then reopen the editor and press *Keep only the deal*.`,
            },
        },
    },
}
