import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `pcfContext` come from the sandbox. */
export const CUSTOMIZER_VALIDATION_CODE = `const MAX_ESTIMATE_HOURS = 40

const gridCustomizerStrategy: IGridCustomizerStrategy = {
    onInitialize: (customizer) => {
        const provider = customizer.getTaskDataProvider()

        //every record gets its expressions as it loads - the decorator only registers the ones whose
        //column is in the active view, so a view without the column is not a problem
        provider.addEventListener('onRecordLoaded', (record) => {
            customizer.registerExpressionDecorator('estimatedeffort', () => {
                record.expressions.setValidationExpression('estimatedeffort', () => {
                    const value = record.getValue('estimatedeffort')
                    if (typeof value === 'number' && value > MAX_ESTIMATE_HOURS) {
                        return { error: true, errorMessage: 'Estimates over ' + MAX_ESTIMATE_HOURS + 'h need to be split into subtasks.' }
                    }
                    return { error: false, errorMessage: '' }
                })
            })
        })
    },
}

const TaskGridExample = () => <TaskGrid
    pcfContext={pcfContext}
    taskGridDescriptor={descriptor} />
`

export const CustomizerValidationExample = () => <TaskGridExampleRunner seedCode={CUSTOMIZER_VALIDATION_CODE} />
