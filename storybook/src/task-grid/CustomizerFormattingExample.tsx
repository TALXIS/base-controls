import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `pcfContext` come from the sandbox. */
export const CUSTOMIZER_FORMATTING_CODE = `const gridCustomizerStrategy: IGridCustomizerStrategy = {
    onInitialize: (customizer) => {
        const provider = customizer.getTaskDataProvider()

        provider.addEventListener('onRecordLoaded', (record) => {
            //a due date in the past turns the cell red, unless the task is already closed
            customizer.registerExpressionDecorator('scheduledend', () => {
                record.expressions.ui.setCustomFormattingExpression('scheduledend', (theme) => {
                    const value = record.getValue('scheduledend')
                    if (!record.isActive() || !value) {
                        return undefined
                    }
                    return new Date(value as string) < new Date()
                        ? { backgroundColor: theme.semanticColors.errorBackground }
                        : undefined
                })
            })

            //and a task that is done gets a green percentage, whatever the view shows
            customizer.registerExpressionDecorator('percentcomplete', () => {
                record.expressions.ui.setCustomFormattingExpression('percentcomplete', (theme) => {
                    return record.getValue('percentcomplete') === 100
                        ? { backgroundColor: theme.semanticColors.successBackground }
                        : undefined
                })
            })
        })
    },
}

const TaskGridExample = () => <TaskGrid
    pcfContext={pcfContext}
    taskGridDescriptor={descriptor} />
`

export const CustomizerFormattingExample = () => <TaskGridExampleRunner seedCode={CUSTOMIZER_FORMATTING_CODE} />
