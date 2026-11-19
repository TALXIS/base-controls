import React from 'react'
import { GridExampleRunner } from '../../GridExampleRunner'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, withDealGrid } from '../dealGridFiles'

const RULES_ON_CELLS_CODE = `import { ClientSideGrid, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl, IGrid } from '@talxis/base-controls'
import { IRecord } from '@talxis/client-libraries'
import { DefaultButton } from '@fluentui/react'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

//new: the stage a discount over 10% needs
const NEGOTIATE = 3
//as in Lock closed deals
const WON = 4
const LOST = 5

//a won or lost stage reads '4' or '5'
const isClosed = (deal: IRecord) => [WON, LOST].includes(Number(deal.getValue('stage')))

//new: the deals the CRM is forecasting
const forecasting = new Set<string>()

//new: stands in for a forecast from the CRM
const fetchForecast = async (deal: IRecord) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return Math.min(Number(deal.getValue('probability')) + 10, 95)
}

//new: called with each new grid before it loads
const addCellRules = (grid: IGrid) => {
    const cells = grid.services.get('cells')
    //new: runs for every column of every deal
    grid.services.get('validation').hooks.validation.add((result, { record, columnName }) => {
        if (columnName === 'discount' && Number(record.getValue('discount')) > 10 && Number(record.getValue('stage')) !== NEGOTIATE) {
            result.error = true
            result.errorMessage = 'A discount over 10% is for deals in negotiation.'
        }
    })
    //new: what the control drawing a cell is handed
    cells.hooks.controlParameters.add((parameters, { columnName }) => {
        if (columnName === 'closedate') {
            parameters.Placeholder = { raw: 'Not planned yet' }
        }
    })
    //new: a shimmer in place of the value
    cells.hooks.loading.add((result, { record, columnName }) => {
        if (columnName === 'probability' && forecasting.has(record.getRecordId())) {
            result.isLoading = true
        }
    })
}

const GridExample = () => {
    const gridRef = React.useRef<IGrid>()

    const onSetup = (grid: IGrid) => {
        gridRef.current = grid
        addCellRules(grid)
    }

    //new: asks the CRM for each open deal's probability, one at a time
    const forecast = async () => {
        const grid = gridRef.current!
        const openDeals = grid.services.get('provider').getRecords().filter(deal => !isClosed(deal))
        openDeals.forEach(deal => forecasting.add(deal.getRecordId()))
        //new: a change to the set does not draw the cells again by itself
        grid.services.get('cells').render({ columnNames: ['probability'] })
        for (const deal of openDeals) {
            const probability = await fetchForecast(deal)
            forecasting.delete(deal.getRecordId())
            //a new value draws the deal's cells again by itself
            deal.setValue('probability', probability)
        }
    }

    return <DatasetControl onLoad={loadDeals} height='480px'>
        <DatasetControl.Header>
            <DatasetControl.Header.End>
                <DealsRibbon />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule(), createFilteringModule()]} onSetup={onSetup} />
        </DatasetControl.Body>
        <DatasetControl.Footer>
            <DatasetControl.Footer.Start>
                {/* new: asks the CRM for a new probability of every open deal */}
                <DefaultButton text='Forecast' iconProps={{ iconName: 'Chart' }} onClick={forecast} />
            </DatasetControl.Footer.Start>
        </DatasetControl.Footer>
    </DatasetControl>
}
`

const RULES_ON_ROWS_CODE = `import { ClientSideGrid, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl, IGrid } from '@talxis/base-controls'
import { IRecord } from '@talxis/client-libraries'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

//as in Lock closed deals
const WON = 4
const LOST = 5
//new: a deal this big gets a taller row
const BIG_DEAL = 30000

//a won or lost stage reads '4' or '5'
const isClosed = (deal: IRecord) => [WON, LOST].includes(Number(deal.getValue('stage')))

//new: called with each new grid before it loads
const addRowRules = (grid: IGrid) => {
    //new: in pixels, in place of the grid's rowHeight
    grid.services.get('rows').hooks.height.add((result, { record }) => {
        if (Number(record.getValue('value')) >= BIG_DEAL) {
            result.height = 64
        }
    })
    //new: AG Grid asks for a row's height again only when it is told to
    grid.services.observe('gridApi', gridApi => grid.services.get('provider').addEventListener('onRecordColumnValueChanged', (_deal, columnName) => {
        if (columnName === 'value') {
            gridApi.resetRowHeights()
        }
    }))
    //new: runs before a selection is written to the provider
    grid.modules.observe('rowSelection', rowSelection => {
        rowSelection.hooks.selectRecords.add((selection, { provider }) => {
            selection.recordIds = selection.recordIds.filter(id => !isClosed(provider.getRecordsMap()[id]))
        })
    })
}

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DealsRibbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule(), createFilteringModule()]} onSetup={addRowRules} />
    </DatasetControl.Body>
</DatasetControl>
`

export const RulesOnCellsExample = () => <GridExampleRunner seedCode={withDealGrid(RULES_ON_CELLS_CODE, DEALS_RIBBON_FILE)} tabs={DEAL_LIST_TABS} />

export const RulesOnRowsExample = () => <GridExampleRunner seedCode={withDealGrid(RULES_ON_ROWS_CODE, DEALS_RIBBON_FILE)} tabs={DEAL_LIST_TABS} />
