import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ItemPanelExample, ReadOnlyExample, ReleaseBoardExample } from '../../check-list/checkListExamples'

const DESCRIPTION = `
Make the checklist read-only, change its wording, or configure its grid.

## Read-only

\`modules={{ editing: undefined }}\` makes the list read-only: no ticking, adding, deleting or dragging.

{{story: A finished launch}}

## Labels

| Key | Default | Shown |
|---|---|---|
| \`newItemPlaceholder\` | Add an item... | In the bottom row while it is empty. |
| \`markItemFinished\` | Mark as finished | As the checkbox's tooltip. |
| \`deleteItem\` | Delete | As the delete button's tooltip. |
| \`confirmDialog.deleteItem.text\` | Are you sure you want to delete this item? | In the dialog that confirms a delete. |

Pass any of them in \`labels\`, together with the grid's own strings. See [**Localization**](?path=/docs/grid-localization-overview--overview).

## Configure the grid

\`CheckList\` accepts every \`Grid.Root\` prop. Of the grid modules, it takes \`license\`, \`editing\`, \`rowSelection\`, \`clipboard\`, \`aggregation\`, \`legacyClientApiCompatibility\` and \`custom\`: sorting, filtering and grouping would break the order, and cell selection turns off dragging.

{{story: A release board}}

## Open an item

Make the name column primary and handle \`onOpenRecord\` to open an item, here in a panel with a form.

{{story: Item details in a panel}}
`

const meta = {
    title: 'Checklist/Customization',
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

export const AFinishedLaunch: Story = {
    name: 'A finished launch',
    render: () => renderStory(<ReadOnlyExample />),
    parameters: {
        docs: {
            description: {
                story: `The launch is over, and the plan is kept for reference.`,
            },
        },
    },
}

export const AReleaseBoard: Story = {
    name: 'A release board',
    render: () => renderStory(<ReleaseBoardExample />),
    parameters: {
        docs: {
            description: {
                story: `Overdue dates are highlighted, finished items are locked, unassigned items offer *Assign to me* on hover, and the estimates are totalled.`,
            },
        },
    },
}

export const ItemDetailsInAPanel: Story = {
    name: 'Item details in a panel',
    render: () => renderStory(<ItemPanelExample />),
    parameters: {
        docs: {
            description: {
                story: `Click an item's name. Changes in the form are saved into the item.`,
            },
        },
    },
}
