import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `defaultModules` come from the sandbox. */
export const CONDITIONAL_FORMATTING_CODE = `const COMPLETED_STATUS = 5
const OVERDUE_BACKGROUND = '#fde7e9'

//a finished task tints its whole row
const doneRows: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('rows').registerRowClass('demo-row--done', ({ record }) => Number(record.getValue('percentcomplete')) === 100)
    },
}

//completing a task means it is 100% done, so the two columns cannot disagree
const onRecordValueChanged = (record: IRecord, columnName: string) => {
    if (columnName === 'statuscode' && Number(record.getValue('statuscode')) === COMPLETED_STATUS && Number(record.getValue('percentcomplete')) !== 100) {
        record.setValue('percentcomplete', 100)
    }
}

//an overlay rather than a cell background, so it also covers cells that draw their own content
const ROW_TINT_CSS = \`
    .demo-row--done::after {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
        pointer-events: none;
        background-color: #107c10;
        opacity: 0.12;
    }
\`

const TaskGridExample = () => <>
    <style>{ROW_TINT_CSS}</style>
    <TaskGrid
        descriptor={descriptor}
        modules={{ ...defaultModules, custom: [doneRows] }}
        onRecordValueChanged={onRecordValueChanged}
        colDefs={{
            scheduledend: {
                context: {
                    cell: {
                        //a due date in the past turns the cell red, unless the task is already closed
                        onGetTheme: (theme, { record }) => {
                            const value = record.getValue('scheduledend')
                            if (record.isActive() && value && new Date(value) < new Date()) {
                                theme.colors.background = OVERDUE_BACKGROUND
                            }
                        },
                    },
                },
            },
        }} />
</>
`

export const ConditionalFormattingExample = () => <TaskGridExampleRunner seedCode={CONDITIONAL_FORMATTING_CODE} />
