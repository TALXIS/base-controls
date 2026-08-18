import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { CustomizerValidationExample } from '../../../task-grid/CustomizerValidationExample'
import { CustomizerFormattingExample } from '../../../task-grid/CustomizerFormattingExample'
import { CustomizerAgGridExample } from '../../../task-grid/CustomizerAgGridExample'

const meta = {
    title: 'Task Grid/Customizations/Customizer',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            story: {
                inline: true,
            },
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                component: `
Reach past the grid's own decisions and into the records and the AG Grid instance behind it, without replacing any UI.

Return an \`IGridCustomizerStrategy\` from your descriptor's \`onCreateGridCustomizerStrategy\` and the grid hands it three hooks:

| Hook | When | What you get |
|---|---|---|
| \`onInitialize(customizer)\` | once, after the grid is ready | the \`IGridCustomizer\` — see below |
| \`onGetColumnDefinitions?(columnDefs)\` | every time the columns are computed | the finished ag-grid \`ColDef[]\`, to return changed |
| \`onGetRowClassRules?(rules)\` | when the grid sets up its rows | the grid's own row class rules, to extend |

\`IGridCustomizer\` is the way in: \`getGridApi()\` for the raw ag-grid api, \`getTaskDataProvider()\` for the records and provider events, \`getDatasetControl()\` for the runtime control, and \`registerExpressionDecorator(columnName, registrator)\` which runs your registrator only when that column is part of the active view — a saved view need not contain the column you are targeting.

## What it is for

- **Per-record behaviour through expressions** — validation, formatting, disabled state, notifications, all set per record as it loads and re-evaluated on every read.
- **AG Grid itself** — options, column definitions and row classes the grid does not surface as parameters.

The strategy never touches rendering. Swapping components is the other page: [**Custom Components**](?path=/story/task-grid-customizations-custom-components--replace-cell-renderer).

> Flip the **Code** toggle on any story to read its snippet, and edit it: the grid recompiles as you type. A snippet here defines a \`gridCustomizerStrategy\` and the example feeds it to the descriptor.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const CustomValidation: Story = {
    name: 'Custom validation',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `
Rejects an **Est. Effort (h)** over 40 with a message of its own. Double-click a cell in that column, type \`60\`, and the cell reports the error instead of saving it.

- \`setValidationExpression\` is per record and per column, and runs on every read — so it validates what the user just typed, not what was loaded
- registered through \`registerExpressionDecorator\`, which skips views that do not show the column
- the grid keeps its own validation as well; this one is additional
                `.trim(),
            },
        },
    },
    render: () => renderStory(<CustomizerValidationExample />),
}

export const ConditionalFormatting: Story = {
    name: 'Conditional formatting',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `
Colours cells from the record's own data: an overdue **Due Date** turns red while the task is still open, and a **% Complete** of 100 turns green.

- \`ui.setCustomFormattingExpression\` receives the cell's theme, so the colours come from the palette rather than hardcoded hexes
- returning \`undefined\` leaves the cell exactly as the grid drew it — that is how "only overdue rows" is expressed
- re-evaluated on every read, so editing a due date recolours the cell immediately
                `.trim(),
            },
        },
    },
    render: () => renderStory(<CustomizerFormattingExample />),
}

export const AgGridBehaviour: Story = {
    name: 'AG Grid behaviour',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `
Changes the grid itself: row animation on, **% Complete** pinned right, **Description** wrapping to as many lines as it needs, and critical rows tinted through a row class rule.

- \`getGridApi()\` is the unmodified ag-grid \`GridApi\`, so any grid option is reachable — including ones TaskGrid does not expose
- \`onGetColumnDefinitions\` runs after the grid has computed everything, so you are amending finished definitions rather than building them
- \`onGetRowClassRules\` receives the grid's own rules; spread them unless you mean to drop the drag-and-drop and inactive-row styling
                `.trim(),
            },
        },
    },
    render: () => renderStory(<CustomizerAgGridExample />),
}
