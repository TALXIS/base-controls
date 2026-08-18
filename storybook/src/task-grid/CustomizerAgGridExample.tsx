import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `pcfContext` come from the sandbox. */
export const CUSTOMIZER_AG_GRID_CODE = `const gridCustomizerStrategy: IGridCustomizerStrategy = {
    onInitialize: (customizer) => {
        //the raw ag-grid api, so anything the grid does not surface is still yours to set
        customizer.getGridApi().setGridOption('animateRows', true)
    },

    //the computed column definitions, straight from ag-grid - return them changed
    onGetColumnDefinitions: (columnDefs) => {
        for (const colDef of columnDefs) {
            if (colDef.field === 'percentcomplete') {
                colDef.pinned = 'right'
                colDef.width = 160
            }
            if (colDef.field === 'description') {
                colDef.wrapText = true
                colDef.autoHeight = true
            }
        }
        return columnDefs
    },

    //ag-grid row classes, evaluated per row - the grid's own rules are passed in
    onGetRowClassRules: (rules) => ({
        ...rules,
        //option-set values arrive as numbers, but coerce anyway - a raw value is whatever the strategy stored
        'demo-row--critical': (params) => Number(params.data?.getValue('priority')) === 3,
    }),
}

//the same overlay the grid uses for its own row states: ::after rather than a cell background, so it
//covers cells that draw their own content, and above ag-grid's ::before hover and selection overlay
//The drag-over states are excluded the same way the grid excludes them from its inactive overlay: they
//share this one ::after, so a tint that did not stand aside would hide the drop indicator.
const ROW_TINT_CSS = \`
    .demo-row--critical:not(.talxis_task-grid_row--drag-over-top):not(.talxis_task-grid_row--drag-over-bottom):not(.talxis_task-grid_row--drag-over-middle)::after {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        pointer-events: none;
        background-color: #d13438;
        opacity: 0.08;
    }
\`

const TaskGridExample = () => <>
    <style>{ROW_TINT_CSS}</style>
    <TaskGrid
        pcfContext={pcfContext}
        taskGridDescriptor={descriptor} />
</>
`

export const CustomizerAgGridExample = () => <TaskGridExampleRunner seedCode={CUSTOMIZER_AG_GRID_CODE} />
