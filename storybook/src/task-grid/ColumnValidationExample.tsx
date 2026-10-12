import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `defaultModules` come from the sandbox. */
export const COLUMN_VALIDATION_CODE = `const MAX_ESTIMATE_HOURS = 500

const TaskGridExample = () => <TaskGrid
    descriptor={descriptor}
    colDefs={{
        estimatedeffort: {
            context: {
                cell: {
                    //runs on every read, so it checks what the user just typed
                    onGetValidation: (result, { record }) => {
                        if (Number(record.getValue('estimatedeffort') ?? 0) > MAX_ESTIMATE_HOURS) {
                            result.error = true
                            result.errorMessage = 'Over ' + MAX_ESTIMATE_HOURS + 'h - split this into smaller tasks.'
                        }
                    },
                },
            },
        },
    }} />
`

export const ColumnValidationExample = () => <TaskGridExampleRunner seedCode={COLUMN_VALIDATION_CODE} />
