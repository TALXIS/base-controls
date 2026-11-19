import React from 'react'
import { GridExampleRunner } from '../../GridExampleRunner'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, withDealGrid } from '../dealGridFiles'

const LOCK_CLOSED_DEALS_CODE = `import { ClientSideGrid, createAggregationModule, createCellSelectionModule, createClipboardModule, createEditingModule, createFilteringModule, createGroupingModule, createLicenseModule, createRowSelectionModule, createSortingModule, DatasetControl, IGrid } from '@talxis/base-controls'
import { IRecord } from '@talxis/client-libraries'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

const AG_GRID_LICENSE_KEY = ''

const loadPipeline = async () => {
    const result = await loadDeals()
    result.provider.grouping.addGroupBy({ columnName: 'owner', alias: 'owner_group' })
    result.provider.aggregation.addAggregation({ columnName: 'value', alias: 'value_sum', aggregationFunction: 'sum' })
    return result
}

//new: the stages of a closed deal
const WON = 4
const LOST = 5

//new: a won or lost stage reads '4' or '5'
const isClosed = (deal: IRecord) => [WON, LOST].includes(Number(deal.getValue('stage')))

//new: called with each new grid before it loads
const lockClosedDeals = (grid: IGrid) => {
    //new: the locks are the editing module's
    grid.modules.observe('editing', editing => {
        //new: a closed deal is locked as a whole
        editing.locks.hooks.row.add((result, { record }) => {
            if (isClosed(record)) {
                result.isLocked = true
            }
        })
        //new: but its stage stays open, so it can be reopened
        editing.locks.hooks.cell.add((result, { record, columnName }) => {
            if (columnName === 'stage' && isClosed(record)) {
                result.isLocked = false
            }
        })
    })
}

const GridExample = () => <DatasetControl onLoad={loadPipeline} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DealsRibbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* new: the hooks go on each grid as it is set up */}
        <ClientSideGrid onSetup={lockClosedDeals} modules={[
            ...(AG_GRID_LICENSE_KEY ? [createLicenseModule({ key: AG_GRID_LICENSE_KEY })] : []),
            createEditingModule(), createSortingModule(), createFilteringModule(),
            createRowSelectionModule({ mode: 'multiple' }), createCellSelectionModule(), createClipboardModule(),
            createGroupingModule({ defaultExpandedLevel: 0 }), createAggregationModule(),
        ]} />
    </DatasetControl.Body>
</DatasetControl>
`

export const LockClosedDealsExample = () => <GridExampleRunner seedCode={withDealGrid(LOCK_CLOSED_DEALS_CODE, DEALS_RIBBON_FILE)} tabs={DEAL_LIST_TABS} />
