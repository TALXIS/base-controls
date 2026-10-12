import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `defaultModules` come from the sandbox. */
export const REMOTE_SYNC_CODE = `//saving one of these is what makes the server recalculate something else
const SYNCED_COLUMNS = ['estimatedeffort']

//which cells are waiting on the server, by record id
const loadingCells = new Map<string, Set<string>>()

const sumSubtree = (provider: ITaskDataProvider, recordId: string): number => {
    //the complete hierarchy: a subtree total should not change because a filter hid a row
    const children = provider.getRecordTree().structure.getChildren(recordId)
    if (children.length === 0) {
        return Number(provider.getRecordsMap()[recordId]?.getValue('estimatedeffort') ?? 0)
    }
    return children.reduce((sum, child) => sum + sumSubtree(provider, child.getRecordId()), 0)
}

/** Stands in for the server: returns the recalculated estimate for each record asked about. */
const fetchRecalculatedRows = async (provider: ITaskDataProvider, recordIds: string[]) => {
    await new Promise(resolve => setTimeout(resolve, 900))
    const primaryId = provider.getMetadata().PrimaryIdAttribute
    return recordIds.map(recordId => ({
        [primaryId]: recordId,
        estimatedeffort: sumSubtree(provider, recordId),
    }))
}

const remoteSync: IGridModule = {
    onRegister: runtime => {
        const provider = runtime.services.get('taskGrid').get('taskDataProvider')
        const cells = runtime.services.get('cells')

        //a parent's estimate is the rollup the server computes, so it is not something to type into
        runtime.services.find('editing')?.locks.registerLock((result, { record, columnName }) => {
            if (record && columnName === 'estimatedeffort' && provider.getRecordTree().view.hasChildren(record.getRecordId())) {
                result.isLocked = true
            }
        })
        //and while the server is recalculating it, that one cell says so
        cells.registerCellLoading((result, { record, columnName }) => {
            result.isLoading = loadingCells.get(record.getRecordId())?.has(columnName) ?? false
        })

        const onAfterRecordSaved = async (result: IRecordSaveOperationResult) => {
            if (!result.success || !result.fields.some(field => SYNCED_COLUMNS.includes(field))) {
                return
            }
            //the server rolls the change up the hierarchy, so every ancestor is now stale
            const ancestorIds = provider.getRecordTree().structure.getAncestorIds(result.recordId).slice(0, -1)
            if (ancestorIds.length === 0) {
                return
            }
            for (const recordId of ancestorIds) {
                loadingCells.set(recordId, new Set(SYNCED_COLUMNS))
            }
            cells.render()
            try {
                const rows = await fetchRecalculatedRows(provider, ancestorIds)
                const primaryId = provider.getMetadata().PrimaryIdAttribute
                //updateTaskData replaces a record's raw data, so merge what the server sent over what the grid holds
                provider.updateTaskData(rows
                    .filter(row => provider.getRecordsMap()[row[primaryId]])
                    .map(row => ({ ...provider.getRecordsMap()[row[primaryId]].getRawData(), ...row })))
            }
            finally {
                loadingCells.clear()
                cells.render()
            }
        }

        provider.addEventListener('onAfterRecordSaved', onAfterRecordSaved)
        //the provider outlives the grid
        runtime.events.addEventListener('onDestroyed', () => provider.removeEventListener('onAfterRecordSaved', onAfterRecordSaved))
    },
}

const TaskGridExample = () => <TaskGrid
    descriptor={descriptor}
    modules={{ ...defaultModules, custom: [remoteSync] }} />
`

export const RemoteSyncExample = () => <TaskGridExampleRunner seedCode={REMOTE_SYNC_CODE} />
