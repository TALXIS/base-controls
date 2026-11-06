import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EditColumnsExample } from '../../../dataset-control/examples/partsExamples'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'

const DESCRIPTION = `
Edit columns lets the user choose the columns of a view: a button opens a panel where they add, reorder and remove columns, and saving reloads the control with them, each view keeping its own. You add it with \`DatasetControl.EditColumns\`. Try it below: switch to *Won deals* and add *Probability (%)* through *Edit columns*.

{{canvas: Choose the columns of a view}}

## How it behaves

- **Adding:** an added column goes first in the list; drag it to where it belongs.
- **Loading:** the pickers say *Loading...* while the columns load, and a failed load shows its error with **Try again**.
- **Hidden columns:** the editor does not list them, and saving keeps them as they are.
- **Disabled:** the button while the provider loads, and **Save** while no visible column is left.
- **Cancel:** pressing it, or closing the panel, drops the changes.
- **Saving:** writes the columns, clears the selection and remounts the control; the columns are kept per view (see [**State**](?path=/docs/controls-datasetcontrol-state--overview)).
- **Unsaved changes:** saving asks about them first: see [**Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview).
- **Compact header:** only the icon shows, with the label as its tooltip: see [**Layout**](?path=/docs/controls-datasetcontrol-layout--overview).

## Columns it offers

The provider supplies what the pickers list, fetched anew each time the editor opens; the example's \`views.ts\` sets \`onGetAvailableColumns\`.

| Provider hook | What it feeds |
|---|---|
| \`onGetAvailableColumns(options?)\` | The column picker: the records' own columns, or a related entity's when \`options.entityName\` is given. |
| \`onGetAvailableRelatedColumns()\` | The *Column source* picker: when it returns any entities, the user can add columns of related records too. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`components\` | \`IEditColumnsComponents\` | Defaults | See [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview). |

## From your code

\`control.parts.get('editColumns')\` returns the part once it is drawn: see [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview). Open the editor from a button of your own, as **Columns** in the example's footer does.

| Member | Does |
|---|---|
| \`open()\` | Opens the editor over the provider's columns. |
| \`close()\` | Closes the editor and drops what was not saved. |
| \`save()\` | Writes the columns, clears the selection, closes the editor and remounts the control, asking about unsaved changes first. |
| \`isOpen()\` | Whether the editor is open. |
| \`events\` | \`onOpenChanged\`, whenever the editor opens or closes. |
| \`getSession()\` | The edit in progress, while the editor is open. |
| \`addCommandsHook(hook, priority?)\` | Adds commands above the pickers. |
| \`addColumnCommandsHook(hook, priority?)\` | Adds commands to each chosen column. |

The session holds the edit until it is saved:

| Member | Does |
|---|---|
| \`getColumns()\` | The visible chosen columns, in order. |
| \`onGetAvailableColumns(query?)\` | Fetches the columns the picker offers, filtered by \`query\`. |
| \`addColumn(column)\` | Adds the column first. |
| \`removeColumn(name)\` | Removes the column. |
| \`moveColumn(name, targetName)\` | Moves the column to where \`targetName\` is. |
| \`setScope(scope)\` | Sets which entity the columns being added come from. |
| \`refreshColumns()\` | Gives the chosen columns the provider's current definitions, after they changed. |
| \`events\` | \`onColumnsChanged\`, whenever the chosen columns change. |

## Add your own commands

\`hook(commands, session)\` changes the commands above the pickers in place, and \`hook(commands, column, session)\` those of each chosen column, with Remove first. Both return their unregistration, and a higher \`priority\` runs later.

The example adds **Keep only the deal** above the pickers.

Dragging swallows clicks: give column commands \`onMouseUp\`, not \`onClick\`.

**Strings:** \`EDIT_COLUMNS_LABELS\`, keys \`editColumns.*\`. See [**Localization**](?path=/docs/concepts-localization--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Paging', iconName: 'PageList', href: '?path=/docs/controls-datasetcontrol-parts-paging--overview', text: 'The next part: the page size and the pages.' },
    { title: 'State', iconName: 'History', href: '?path=/docs/controls-datasetcontrol-state--overview', text: 'How each view keeps the columns the user chose.' },
    { title: 'Views', iconName: 'ViewList', href: '?path=/docs/controls-datasetcontrol-views--overview', text: 'The columns each view starts with.' },
]

const meta = {
    title: 'Controls/DatasetControl/Parts/Edit columns',
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

export const ChooseTheColumns: Story = {
    name: 'Choose the columns of a view',
    render: () => renderStory(<EditColumnsExample />),
}
