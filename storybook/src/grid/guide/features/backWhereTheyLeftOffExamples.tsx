import React from 'react'
import { GridExampleRunner } from '../../GridExampleRunner'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, withDealGrid } from '../dealGridFiles'

const BACK_WHERE_THEY_LEFT_OFF_CODE = `import { ClientSideGrid, createAggregationModule, createCellSelectionModule, createClipboardModule, createEditingModule, createFilteringModule, createGroupingModule, createLicenseModule, createRowSelectionModule, createSortingModule, DatasetControl, IGrid } from '@talxis/base-controls'
import { IRecord } from '@talxis/client-libraries'
import { Toggle } from '@fluentui/react'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

const AG_GRID_LICENSE_KEY = ''

const loadPipeline = async () => {
    const result = await loadDeals()
    result.provider.grouping.addGroupBy({ columnName: 'owner', alias: 'owner_group' })
    result.provider.aggregation.addAggregation({ columnName: 'value', alias: 'value_sum', aggregationFunction: 'sum' })
    return result
}

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

const GridExample = () => {
    //new: stands in for leaving the page and coming back
    const [isShown, setIsShown] = React.useState(true)

    return <DatasetControl onLoad={loadPipeline} height='480px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                {/* new: hides the grid and shows it again */}
                <Toggle label='Show the deals' inlineLabel checked={isShown} onChange={(_, checked) => setIsShown(!!checked)} />
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <DealsRibbon />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            {/* new: the key the grid keeps its place under */}
            {isShown && <ClientSideGrid stateKey='guide.back' onSetup={lockClosedDeals} modules={[
                ...(AG_GRID_LICENSE_KEY ? [createLicenseModule({ key: AG_GRID_LICENSE_KEY })] : []),
                createEditingModule(), createSortingModule(), createFilteringModule(),
                createRowSelectionModule({ mode: 'multiple' }), createCellSelectionModule(), createClipboardModule(),
                createGroupingModule({ defaultExpandedLevel: 0 }), createAggregationModule(),
            ]} />}
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const BackWhereTheyLeftOffExample = () => <GridExampleRunner seedCode={withDealGrid(BACK_WHERE_THEY_LEFT_OFF_CODE, DEALS_RIBBON_FILE)} tabs={DEAL_LIST_TABS} />
