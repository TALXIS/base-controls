import React from 'react'
import { GridExampleRunner } from '../../GridExampleRunner'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, withDealGrid } from '../dealGridFiles'

const COLOURS_AND_DENSITY_CODE = `import { ClientSideGrid, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl, IGrid } from '@talxis/base-controls'
import { IRecord } from '@talxis/client-libraries'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

//as in Lock closed deals
const WON = 4
const LOST = 5

//a won or lost stage reads '4' or '5'
const isClosed = (deal: IRecord) => [WON, LOST].includes(Number(deal.getValue('stage')))

//new: the hues a tint mixes into a cell or a header
const OVERDUE = '#d13438'
const DUE_SOON = '#c19c00'
const MONEY = '#107c10'

//new: the hue of an open deal's close date, by how near it is
const getCloseDateHue = (deal: IRecord) => {
    const closeDate = deal.getValue('closedate')
    if (!closeDate || isClosed(deal)) {
        return undefined
    }
    const daysLeft = dayjs(closeDate).diff(dayjs().startOf('day'), 'day')
    if (daysLeft < 0) {
        return OVERDUE
    }
    return daysLeft <= 7 ? DUE_SOON : undefined
}

//new: called with each new grid before it loads
const colourByData = (grid: IGrid) => {
    //new: runs for every cell
    grid.services.get('cells').hooks.theme.add((builder, { record, columnName }) => {
        const hue = columnName === 'closedate' ? getCloseDateHue(record) : undefined
        if (hue) {
            builder.tint(hue)
        }
    })
    //new: runs for every header
    grid.services.get('columns').headers.hooks.theme.add((builder, header) => {
        if (['value', 'discount'].includes(header.getColDef().colId!)) {
            builder.tint(MONEY)
        }
    })
    //new: lines between the columns and round the grid
    grid.services.get('gridTheme').hooks.theme.add((result, fluentTheme) => {
        const line = { color: fluentTheme.semanticColors.bodyDivider }
        result.theme = result.theme.withParams({ columnBorder: line, headerColumnBorder: line, wrapperBorder: line })
    })
}

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DealsRibbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule(), createFilteringModule()]}
            //new: compact rows
            rowHeight={36}
            //new: option sets as tags in their options' colours
            enableOptionSetColors
            onSetup={colourByData} />
    </DatasetControl.Body>
</DatasetControl>
`

const SIZE_THE_GRID_CODE = `import { ClientSideGrid, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl } from '@talxis/base-controls'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

//new: a DatasetControl without a height leaves the grid's height to the grid
const GridExample = () => <DatasetControl onLoad={loadDeals}>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DealsRibbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule(), createFilteringModule()]}
            //new: grows with its rows, up to eight
            maxVisibleRows={8} />
    </DatasetControl.Body>
</DatasetControl>
`

export const ColoursAndDensityExample = () => <GridExampleRunner seedCode={withDealGrid(COLOURS_AND_DENSITY_CODE, DEALS_RIBBON_FILE)} tabs={DEAL_LIST_TABS} />

export const SizeTheGridExample = () => <GridExampleRunner seedCode={withDealGrid(SIZE_THE_GRID_CODE, DEALS_RIBBON_FILE)} tabs={DEAL_LIST_TABS} />
