import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `pcfContext` come from the sandbox. */
export const CUSTOMIZER_REMOTE_SYNC_CODE = `//saving one of these is what makes the server recalculate something else
const SYNCED_COLUMNS = ['estimatedeffort']

//which cells are waiting on the server, by record id. The loading expression below reads it, so only
//those cells show a spinner - the rest of the grid stays usable
const loadingCells = new Map<string, Set<string>>()

const sumSubtree = (provider, recordId: string): number => {
    const children = provider.getRecordTree().getNode(recordId).directChildren
    if (children.length === 0) {
        return Number(provider.getRecordsMap()[recordId]?.getValue('estimatedeffort') ?? 0)
    }
    return children.reduce((sum, child) => sum + sumSubtree(provider, child.getRecordId()), 0)
}

/**
 * Stands in for the server: returns the recalculated estimate for each record asked about. A real
 * strategy calls the Web API here - or \`provider.fetchRawRecords(recordIds)\`, which re-reads exactly
 * these rows through the strategy that loaded them.
 */
const fetchRecalculatedRows = async (provider, recordIds: string[]) => {
    await new Promise(resolve => setTimeout(resolve, 900))

    const primaryId = provider.getMetadata().PrimaryIdAttribute
    return recordIds.map(recordId => ({
        [primaryId]: recordId,
        estimatedeffort: sumSubtree(provider, recordId),
    }))
}

const gridCustomizerStrategy: IGridCustomizerStrategy = {
    onInitialize: (customizer) => {
        const provider = customizer.getTaskDataProvider()

        provider.addEventListener('onRecordLoaded', (record) => {
            customizer.registerExpressionDecorator('estimatedeffort', () => {
                //a parent's estimate is the rollup the server computes, so it is not something to type into
                record.expressions.setDisabledExpression('estimatedeffort', () => {
                    return provider.getRecordTree().hasChildren(record.getRecordId())
                })
                //and while the server is recalculating it, that one cell says so
                record.expressions.ui.setLoadingExpression('estimatedeffort', () => {
                    return loadingCells.get(record.getRecordId())?.has('estimatedeffort') ?? false
                })
            })
        })

        provider.addEventListener('onAfterRecordSaved', async (result) => {
            if (!result.success || !result.fields.some((field) => SYNCED_COLUMNS.includes(field))) {
                return
            }
            //the server rolls the change up the hierarchy, so every ancestor is now stale
            const ancestorIds = provider.getRecordTree().getNode(result.recordId).pathIds.slice(0, -1)
            if (ancestorIds.length === 0) {
                return
            }

            for (const recordId of ancestorIds) {
                loadingCells.set(recordId, new Set(SYNCED_COLUMNS))
            }
            provider.requestRender()

            try {
                const rows = await fetchRecalculatedRows(provider, ancestorIds)
                const primaryId = provider.getMetadata().PrimaryIdAttribute
                //updateTaskData replaces a record's raw data, so merge the returned columns over what the
                //grid already holds - the server only sent back what it recalculated
                const merged = rows
                    .filter((row) => provider.getRecordsMap()[row[primaryId]])
                    .map((row) => ({ ...provider.getRecordsMap()[row[primaryId]].getRawData(), ...row }))
                provider.updateTaskData(merged)
            }
            finally {
                loadingCells.clear()
                provider.requestRender()
            }
        })
    },
}

const TaskGridExample = () => <TaskGrid
    pcfContext={pcfContext}
    taskGridDescriptor={descriptor} />
`

export const CustomizerRemoteSyncExample = () => <TaskGridExampleRunner seedCode={CUSTOMIZER_REMOTE_SYNC_CODE} />
