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
        'demo-row--critical': (params) => params.data?.getValue('priority') === 3,
    }),
}

const TaskGridExample = () => <>
    <style>{'.demo-row--critical { background-color: #fff4f4; }'}</style>
    <TaskGrid
        pcfContext={pcfContext}
        taskGridDescriptor={descriptor} />
</>
`

export const CustomizerAgGridExample = () => <TaskGridExampleRunner seedCode={CUSTOMIZER_AG_GRID_CODE} />
