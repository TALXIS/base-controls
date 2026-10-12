import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` comes from the sandbox. */
export const CUSTOMIZER_FORMATTING_CODE = `const COMPLETED_STATUS = 5

class GridCustomizerStrategy implements IGridCustomizerStrategy {
    constructor({ services }: ITaskGridFactoryParams) {
        //registered with the modules, so it is already there when a strategy is built
        const customizer = services.get('gridCustomizer')

        //the provider is built after the modules are, so it is waited for rather than resolved here
        services.whenAvailable('taskDataProvider', (provider) => {
            provider.addEventListener('onRecordLoaded', (record) => {
                //a rule of the record's own: completing a task means it is 100% done, so the two columns
                //cannot disagree. The formatting below then turns that cell green on its own
                record.addEventListener('onFieldValueChanged', (columnName) => {
                    if (columnName !== 'statuscode' || Number(record.getValue('statuscode')) !== COMPLETED_STATUS) {
                        return
                    }
                    if (Number(record.getValue('percentcomplete')) === 100) {
                        return
                    }
                    //no save needed - the grid is already saving the change that triggered this
                    record.setValue('percentcomplete', 100)
                })

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
            })
        })
    }

    //"this task is done" belongs to the whole row, not one cell - and a row class is how ag-grid says it
    onGetRowClassRules(rules) {
        return {
            ...rules,
            'demo-row--done': (params) => Number(params.data?.getValue('percentcomplete')) === 100,
        }
    }
}

//the grid tints a row with an overlay rather than a cell background, so it also covers cells that draw
//their own content - the % Complete progress bar among them. It goes on ::after, the way the grid's own
//drag-over and inactive states do, because ::before is ag-grid's hover and selection overlay; the
//z-index puts it above that one and pointer-events keeps the row clickable
//The drag-over states are excluded the same way the grid excludes them from its inactive overlay: they
//share this one ::after, so a tint that did not stand aside would hide the drop indicator.
const ROW_TINT_CSS = \`
    .demo-row--done:not(.talxis_task-grid_row--drag-over-top):not(.talxis_task-grid_row--drag-over-bottom):not(.talxis_task-grid_row--drag-over-middle)::after {
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
        descriptor={descriptor} />
</>
`

export const CustomizerFormattingExample = () => <TaskGridExampleRunner seedCode={CUSTOMIZER_FORMATTING_CODE} />
