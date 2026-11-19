import React from 'react'
import { GridExampleRunner } from '../../GridExampleRunner'
import type { IGridExampleFile } from '../../GridLivePreview'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, withDealGrid } from '../dealGridFiles'

const OPEN_GROUPS_ON_DEMAND_CODE = `import { createAggregationModule, createCellSelectionModule, createClipboardModule, createEditingModule, createFilteringModule, createGroupingModule, createLicenseModule, createRowSelectionModule, createSortingModule, DatasetControl, IGrid, ServerSideGrid } from '@talxis/base-controls'
import { IRecord } from '@talxis/client-libraries'
import { DealsRibbon } from './DealsRibbon'
//new: the deals of a CRM that fetches a group's deals as it opens
import { loadRemoteDeals } from './remoteDeals'

const AG_GRID_LICENSE_KEY = ''

const WON = 4
const LOST = 5
const isClosed = (deal: IRecord) => [WON, LOST].includes(Number(deal.getValue('stage')))

const lockClosedDeals = (grid: IGrid) => {
    grid.modules.observe('editing', editing => {
        editing.locks.hooks.row.add((result, { record }) => {
            if (isClosed(record)) {
                result.isLocked = true
            }
        })
        editing.locks.hooks.cell.add((result, { record, columnName }) => {
            if (columnName === 'stage' && isClosed(record)) {
                result.isLocked = false
            }
        })
    })
}

const GridExample = () => <DatasetControl onLoad={loadRemoteDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DealsRibbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* new: fetches a group's deals as it opens */}
        <ServerSideGrid stateKey='guide.back' onSetup={lockClosedDeals} modules={[
            ...(AG_GRID_LICENSE_KEY ? [createLicenseModule({ key: AG_GRID_LICENSE_KEY })] : []),
            createEditingModule(), createSortingModule(), createFilteringModule(),
            createRowSelectionModule({ mode: 'multiple' }), createCellSelectionModule(), createClipboardModule(),
            //new: no defaultExpandedLevel, so every group starts closed
            createGroupingModule(),
            createAggregationModule(),
        ]} />
    </DatasetControl.Body>
</DatasetControl>
`

const REMOTE_DEALS_FILE: IGridExampleFile = {
    name: 'remoteDeals.ts',
    code: `import { IDatasetControlLoadResult } from '@talxis/base-controls'
import { dealColumns, deals, DealsProvider, metadata } from './deals'

let hasFailed = false

//stands in for a CRM that fetches an account manager's deals as the group opens
class RemoteDeals extends DealsProvider {
    public async getDataAsync(...parameters: Parameters<DealsProvider['getDataAsync']>) {
        //a group's deals are fetched by a provider of the group's own
        if (this.getParentDataProvider()) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            //the CRM does not answer the first time it is asked for a group
            if (!hasFailed) {
                hasFailed = true
                throw new Error('The CRM did not answer.')
            }
        }
        return super.getDataAsync(...parameters)
    }
}

//grouped by account manager, with the value totalled
export const loadRemoteDeals = async (): Promise<IDatasetControlLoadResult> => {
    const provider = new RemoteDeals({ dataSource: deals, metadata, columns: dealColumns })
    provider.grouping.addGroupBy({ columnName: 'owner', alias: 'owner_group' })
    provider.aggregation.addAggregation({ columnName: 'value', alias: 'value_sum', aggregationFunction: 'sum' })
    return { provider }
}
`,
}

export const OpenGroupsOnDemandExample = () => <GridExampleRunner seedCode={withDealGrid(OPEN_GROUPS_ON_DEMAND_CODE, DEALS_RIBBON_FILE, REMOTE_DEALS_FILE)} tabs={DEAL_LIST_TABS} />
