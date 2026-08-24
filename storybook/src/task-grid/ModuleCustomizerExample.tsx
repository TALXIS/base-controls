import React from 'react'
import { TaskGrid } from '@talxis/base-controls'
import type { IGridCustomizerStrategy } from '@talxis/base-controls'
import type { IRecord } from '@talxis/client-libraries'
import type { ITheme } from '@fluentui/react'
import { usePcfContext } from '@talxis/base-controls/utils'
import { createMemoryTaskGridDescriptor } from './memoryDescriptor'

const HIGH_PRIORITY = '2'

/**
 * The `gridCustomizer` module on its own: no other module is registered, so the only thing this grid has
 * beyond the basics is the strategy below.
 *
 * It paints the subject cell of every high-priority task, which is enough to see the module is live
 * without touching the grid.
 */
const gridCustomizerStrategy: IGridCustomizerStrategy = {
    onInitialize: (customizer) => {
        customizer.getTaskDataProvider().addEventListener('onRecordLoaded', (record: IRecord) => {
            customizer.registerExpressionDecorator('subject', () => {
                record.expressions.ui.setCustomFormattingExpression('subject', (theme: ITheme) => (
                    record.getValue('priority') == HIGH_PRIORITY
                        ? { backgroundColor: theme.semanticColors.severeWarningBackground }
                        : undefined
                ))
            })
        })
    },
}

/** A grid running the `gridCustomizer` module and nothing else. */
export const ModuleCustomizerExample = () => {
    const pcfContext = usePcfContext()
    const descriptor = React.useMemo(() => createMemoryTaskGridDescriptor({
        modules: [],
        onGetGridCustomizerStrategy: () => gridCustomizerStrategy,
    }), [])
    return <TaskGrid pcfContext={pcfContext} taskGridDescriptor={descriptor} />
}
