import React from 'react'
import { GridExampleRunner } from '../../GridExampleRunner'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, withDealGrid } from '../dealGridFiles'

const GROUP_AND_TOTAL_CODE = `import { ClientSideGrid, createAggregationModule, createCellSelectionModule, createClipboardModule, createEditingModule, createFilteringModule, createGroupingModule, createLicenseModule, createRowSelectionModule, createSortingModule, DatasetControl } from '@talxis/base-controls'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

const AG_GRID_LICENSE_KEY = ''

//new: opens grouped by account manager, with the value totalled
const loadPipeline = async () => {
    const result = await loadDeals()
    result.provider.grouping.addGroupBy({ columnName: 'owner', alias: 'owner_group' })
    result.provider.aggregation.addAggregation({ columnName: 'value', alias: 'value_sum', aggregationFunction: 'sum' })
    return result
}

const GridExample = () => <DatasetControl onLoad={loadPipeline} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DealsRibbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid modules={[
            ...(AG_GRID_LICENSE_KEY ? [createLicenseModule({ key: AG_GRID_LICENSE_KEY })] : []),
            createEditingModule(), createSortingModule(), createFilteringModule(),
            createRowSelectionModule({ mode: 'multiple' }), createCellSelectionModule(), createClipboardModule(),
            //new: group rows, and totals per group and overall
            createGroupingModule({ defaultExpandedLevel: 0 }),
            createAggregationModule(),
        ]} />
    </DatasetControl.Body>
</DatasetControl>
`

export const GroupAndTotalExample = () => <GridExampleRunner seedCode={withDealGrid(GROUP_AND_TOTAL_CODE, DEALS_RIBBON_FILE)} tabs={DEAL_LIST_TABS} />
