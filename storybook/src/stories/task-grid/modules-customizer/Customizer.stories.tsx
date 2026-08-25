import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { CustomizerValidationExample } from '../../../task-grid/CustomizerValidationExample'
import { CustomizerFormattingExample } from '../../../task-grid/CustomizerFormattingExample'
import { CustomizerAgGridExample } from '../../../task-grid/CustomizerAgGridExample'
import { CustomizerRemoteSyncExample } from '../../../task-grid/CustomizerRemoteSyncExample'

const meta = {
    title: 'Task Grid/Modules/Customizer',
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
The reference for the \`gridCustomizer\` module — the one module with no UI of its own. Register an \`IGridCustomizerStrategy\` through it and you hold the AG Grid instance itself, plus the records behind it, so everything the grid does is reachable from here: cell renderers included, since a renderer is only \`colDef.cellRenderer\` on a column definition.

The other four modules, and how registering one works: [**Modules**](?path=/story/task-grid-modules--overview).

[**Custom Components**](?path=/story/task-grid-customizations-custom-components--overview) is a convenience over exactly this: it swaps a renderer or an editor without a strategy, without you finding the right column definition, and while handing you the grid's own component to fall back on. Reach for the customizer when that is not enough — when you want a record's *behaviour* rather than its looks, or an ag-grid option TaskGrid never surfaces.

Register it with \`createGridCustomizerModule({ strategy, services })\`, so no subclass is involved — the strategy below is the same on memory and on Dataverse.

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
- **Staying in step with the server** — provider events give you the save lifecycle, so a change that makes the backend recalculate can be fetched back and merged in.

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

export const SyncWithRemote: Story = {
    name: 'Sync with remote',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `
Writing a value is often not the end of it. The server has rules of its own — rolling efforts up a hierarchy, shifting dependent dates, cascading a status to subtasks — so the moment a save lands, the grid may be showing stale numbers for records nobody touched. The job is to bring just those back, without reloading the grid and throwing away the user's scroll, expansion and selection.

Any action can be the trigger; a save is simply the most common one. Expand a task, change a leaf's **Est. Effort (h)**, and after a short round trip every parent above it arrives with a new estimate — summed remotely, not in the browser.

- \`onBeforeRecordSaved\` takes the watermark and \`onAfterRecordSaved\` does the fetch, so nothing modified *during* the save is missed
- the fetch is gated on the columns that matter: a save that touched nothing relevant costs no round trip
- only the affected rows are re-read — \`getRecordTree().structure.getAncestorIds(recordId)\` gives the ancestors the server would have touched
- \`updateTaskData\` **replaces** a record's raw data, so merge the returned columns over \`getRawData()\` first — a server that answers with three columns would otherwise blank the rest
- the wait is shown per cell, not per grid: \`ui.setLoadingExpression\` reads a map of the cells being refreshed, so the rest of the grid stays usable while the ancestors resolve — \`setLoading\` would have blocked everything
- \`requestRender\` after marking the cells and again once the data is in
- a value the server owns should not be typeable: \`setDisabledExpression\` locks **Est. Effort (h)** on any task that has children, so only leaves are edited and the rollup always comes from the remote

In a real strategy the stub is \`Xrm.WebApi.retrieveMultipleRecords\` with fetchxml filtered on \`modifiedon ge <savedAt>\`, selecting only the recalculated columns — the shape of the customizer around it does not change.
                `.trim(),
            },
        },
    },
    render: () => renderStory(<CustomizerRemoteSyncExample />),
}
