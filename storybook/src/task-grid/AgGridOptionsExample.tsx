import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `defaultModules` come from the sandbox. */
export const AG_GRID_OPTIONS_CODE = `const criticalRows: IGridModule = {
    onRegister: runtime => {
        //any AG Grid option the grid does not set itself
        runtime.registerAgGridOptions(result => {
            result.options.animateRows = true
        })
        runtime.services.get('rows').registerRowClass('demo-row--critical', ({ record }) => Number(record.getValue('priority')) === 3)
    },
}

//the same overlay the grid uses for its own row states
const ROW_TINT_CSS = \`
    .demo-row--critical::after {
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
        descriptor={descriptor}
        modules={{ ...defaultModules, custom: [criticalRows] }}
        colDefs={{
            percentcomplete: { pinned: 'right', width: 160 },
            description: { wrapText: true, autoHeight: true },
        }} />
</>
`

export const AgGridOptionsExample = () => <TaskGridExampleRunner seedCode={AG_GRID_OPTIONS_CODE} />
