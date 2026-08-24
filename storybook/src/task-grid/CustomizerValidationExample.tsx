import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` comes from the sandbox. */
export const CUSTOMIZER_VALIDATION_CODE = `const MAX_ESTIMATE_HOURS = 500

const gridCustomizerStrategy: IGridCustomizerStrategy = {
    onInitialize: (customizer) => {
        const provider = customizer.getTaskDataProvider()

        //every record gets its expressions as it loads - the decorator only registers the ones whose
        //column is in the active view, so a view without that column is not a problem
        provider.addEventListener('onRecordLoaded', (record) => {
            customizer.registerExpressionDecorator('estimatedeffort', () => {
                record.expressions.setValidationExpression('estimatedeffort', () => {
                    const hours = Number(record.getValue('estimatedeffort') ?? 0)
                    if (hours > MAX_ESTIMATE_HOURS) {
                        return {
                            error: true,
                            errorMessage: 'Over ' + MAX_ESTIMATE_HOURS + 'h - split this into smaller tasks.',
                        }
                    }
                    return { error: false, errorMessage: '' }
                })
            })
        })
    },
}

const TaskGridExample = () => <TaskGrid
    taskGridDescriptor={descriptor} />
`

export const CustomizerValidationExample = () => <TaskGridExampleRunner seedCode={CUSTOMIZER_VALIDATION_CODE} />
