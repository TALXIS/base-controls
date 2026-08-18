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
The lowest level of customization the grid offers. Return an \`IGridCustomizerStrategy\` from your descriptor's \`onCreateGridCustomizerStrategy\` and you hold the AG Grid instance itself, plus the records behind it — so everything the grid does is reachable from here, cell renderers included, since a renderer is only \`colDef.cellRenderer\` on a column definition.

[**Custom Components**](?path=/story/task-grid-customizations-custom-components--overview) is a convenience over exactly this: it swaps a renderer or an editor without a strategy, without you finding the right column definition, and while handing you the grid's own component to fall back on. Reach for the customizer when that is not enough — when you want a record's *behaviour* rather than its looks, or an ag-grid option TaskGrid never surfaces.

The strategy gets three hooks:

| Hook | When | What you get |
|---|---|---|
| \`onInitialize(customizer)\` | once, after the grid is ready | the \`IGridCustomizer\` — see below |
| \`onGetColumnDefinitions?(columnDefs)\` | every time the columns are computed | the finished ag-grid \`ColDef[]\`, to return changed |
| \`onGetRowClassRules?(rules)\` | when the grid sets up its rows | the grid's own row class rules, to extend |

\`IGridCustomizer\` is the way in: \`getGridApi()\` for the raw ag-grid api, \`getTaskDataProvider()\` for the records and provider events, \`getDatasetControl()\` for the runtime control, and \`registerExpressionDecorator(columnName, registrator)\` which runs your registrator only when that column is part of the active view — a saved view need not contain the column you are targeting.

## What it is for

- **Per-record behaviour through expressions** — validation, formatting, disabled state, notifications, all set per record as it loads and re-evaluated on every read. Nothing else in the grid can express these.
- **AG Grid itself** — options, column definitions and row classes TaskGrid does not surface as parameters.
- **Rendering, if you want it here** — assigning \`colDef.cellRenderer\` in \`onGetColumnDefinitions\` is what the \`components\` hooks ultimately do for you.

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
Flags an **Est. Effort (h)** over 500 with a message of its own — the rows above 500 carry it, the rest do not. Double-click one and change the number to watch the message come and go.

- \`setValidationExpression\` is per record and per column, and runs on every read — so it validates what the user just typed, not only what was loaded
- registered through \`registerExpressionDecorator\`, which skips views that do not show the column: point the same snippet at a column your view has hidden and it simply does nothing
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
Colours from the record's own data: an overdue **Due Date** turns red while the task is still open, and a finished task tints its whole row green. It also keeps the two status columns honest — set a **Status** to *Completed* and the percentage jumps to 100, which tints the row.

- \`ui.setCustomFormattingExpression\` receives the cell's theme, so the colours come from the palette rather than hardcoded hexes
- returning \`undefined\` leaves the cell exactly as the grid drew it — that is how "only overdue rows" is expressed
- re-evaluated on every read, so editing a due date recolours the cell immediately
- the record is also where behaviour goes: \`record.addEventListener('onFieldValueChanged', …)\` reacts to the option set changing and writes the percentage, so a business rule lives next to the record rather than in a cell renderer
- a state that belongs to the whole task goes on the row, not a cell: \`onGetRowClassRules\` is ag-grid's own mechanism, and spreading the incoming rules keeps the grid's drag-and-drop and inactive-row styling
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
