import React from 'react'
import { GridExampleRunner } from '../../GridExampleRunner'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, withDealGrid } from '../dealGridFiles'

const CELLS_OF_YOUR_OWN_CODE = `import { ClientSideGrid, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl, Grid, IGrid, IGridCellParams, useGridCell, useGridField, usePcfContext } from '@talxis/base-controls'
import { IRecord } from '@talxis/client-libraries'
import { mergeStyleSets, Slider } from '@fluentui/react'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

//as in Lock closed deals
const WON = 4
const LOST = 5

//a won or lost stage reads '4' or '5'
const isClosed = (deal: IRecord) => [WON, LOST].includes(Number(deal.getValue('stage')))

//new: an open deal whose close date has passed
const isOverdue = (deal: IRecord) => !isClosed(deal) && !!deal.getValue('closedate') && dayjs(deal.getValue('closedate')).isBefore(dayjs(), 'day')

//new: a deal's value, weighed by its chance of closing
const getWeightedValue = (deal: IRecord) => Number(deal.getValue('value') ?? 0) * Number(deal.getValue('probability') ?? 0) / 100

//new: the ring's size
const RADIUS = 9
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

//new: 9 px off the edge, as the grid's own values are
const styles = mergeStyleSets({
    chance: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '0 9px' },
    ring: { flexShrink: 0, transform: 'rotate(-90deg)' },
    slider: { alignSelf: 'center', padding: '0 9px' },
    weightedValue: { alignSelf: 'center', padding: '0 9px', textAlign: 'right' },
})

//new: a ring filled to the deal's probability
const ChanceRing = () => {
    const { palette } = useGridCell().getTheme().get()
    const chance = Number(useGridField()!.getValue() ?? 0)
    return <div className={styles.chance}>
        <svg className={styles.ring} width={20} height={20} viewBox='0 0 24 24'>
            <circle cx={12} cy={12} r={RADIUS} fill='none' strokeWidth={3} stroke={palette.neutralLighter} />
            <circle cx={12} cy={12} r={RADIUS} fill='none' strokeWidth={3} stroke={palette.themePrimary} strokeDasharray={\`\${chance / 100 * CIRCUMFERENCE} \${CIRCUMFERENCE}\`} />
        </svg>
        <span>{chance}%</span>
    </div>
}

//new: a slider that writes each move to the deal
const ChanceSlider = () => {
    const field = useGridField()!
    return <Slider className={styles.slider} min={0} max={100} step={5} defaultValue={Number(field.getValue() ?? 0)} onChange={value => field.setValue(value)} />
}

//new: drawn again whenever the deal changes
const WeightedValue = () => {
    const deal = useGridCell().getRecord()
    const { formatting } = usePcfContext()
    return <span className={styles.weightedValue}>{formatting.formatCurrency(getWeightedValue(deal))}</span>
}

//new: the cell of a column of your own, built from the grid's parts
const WeightedValueCell = (props: IGridCellParams) => <Grid.Cell.Root {...props}>
    <Grid.Cell.Theme>
        <Grid.Cell.Container>
            <Grid.Cell.Control>
                <WeightedValue />
            </Grid.Cell.Control>
        </Grid.Cell.Container>
    </Grid.Cell.Theme>
</Grid.Cell.Root>

//new: called with each new grid before it loads
const drawCells = (grid: IGrid) => {
    const columns = grid.services.get('columns')
    columns.hooks.columnDefinitions.add(columnDefs => {
        const probability = columnDefs.find(colDef => colDef.colId === 'probability')!
        //new: the ring in each cell, and the slider while the cell is edited
        probability.cellRendererParams = { components: { columnControl: { onRender: () => <ChanceRing /> } } }
        probability.cellEditorParams = { components: { columnControl: { onRender: () => <ChanceSlider /> } } }
        //new: room for the slider
        probability.initialWidth = 200
        //new: a column of your own, bound to no provider column, after Probability (%)
        columnDefs.splice(columnDefs.indexOf(probability) + 1, 0, columns.createUnboundColDef({
            colId: 'weightedvalue',
            headerName: 'Weighted value',
            initialWidth: 140,
            cellRenderer: WeightedValueCell,
            context: { alignment: 'right' },
        }))
    })
    //new: runs for every cell
    grid.services.get('cells').hooks.commands.add((result, { record, columnName }) => {
        if (columnName !== 'closedate' || !isOverdue(record)) {
            return
        }
        //new: a week from today, unsaved until Save
        result.items.push({ key: 'pushAWeek', text: 'Push a week', iconOnly: true, iconProps: { iconName: 'Forward' }, onClick: () => { grid.services.get('fields').get(record, 'closedate').setValue(dayjs().add(7, 'day').startOf('day').toDate()) } })
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
            onSetup={drawCells} />
    </DatasetControl.Body>
</DatasetControl>
`

const HEADERS_OF_YOUR_OWN_CODE = `import { ClientSideGrid, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl, GRID_MODULE_PRIORITY, IGrid, IGridSortingComponents, useDataProvider, usePcfContext } from '@talxis/base-controls'
import { Operators, Type } from '@talxis/client-libraries'
import { Icon, ITextProps, mergeStyleSets, Stack, Text } from '@fluentui/react'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

//new: a dimmer total and a blue arrow
const styles = mergeStyleSets({
    total: { opacity: 0.75 },
    sortArrow: { color: '#0078d4' },
})

//new: the name, and under it the value of the deals the grid shows
const NameAndTotal = (props: ITextProps) => {
    const deals = useDataProvider().getRecords()
    const { formatting } = usePcfContext()
    const total = deals.reduce((sum, deal) => sum + Number(deal.getValue('value') ?? 0), 0)
    return <Stack horizontalAlign='end'>
        <Text {...props} />
        <Text variant='small' className={styles.total}>{formatting.formatCurrency(total)}</Text>
    </Stack>
}

//new: the sorting module's arrow, in blue
const SORTING_COMPONENTS: IGridSortingComponents = {
    sortIcon: { onRenderIcon: ({ descending, ...props }) => <Icon {...props} className={styles.sortArrow} /> },
}

//new: open deals that were due to close before today
const OVERDUE_DEALS = {
    filterOperator: Type.And.Value,
    conditions: [
        { attributeName: 'closedate', conditionOperator: Operators.OnOrBefore.Value, value: dayjs().subtract(1, 'day').format('YYYY-MM-DD') },
        { attributeName: 'stage', conditionOperator: Operators.NotIn.Value, value: ['4', '5'] },
    ],
}

//new: called with each new grid before it loads
const extendHeaders = (grid: IGrid) => {
    const provider = grid.services.get('provider')
    const headers = grid.services.get('columns').headers
    grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
        //new: a slot of Value's header
        columnDefs.find(colDef => colDef.colId === 'value')!.headerComponentParams = { components: { label: { onRender: props => <NameAndTotal {...props} /> } } }
    })
    //new: runs for every header
    headers.hooks.adornments.add((adornments, header) => {
        if (header.getColDef().colId === 'discount') {
            adornments.push({ key: 'discountLimit', placement: 'suffix', title: 'The CRM refuses a discount over 20%.', onRender: () => <Icon iconName='Info' /> })
        }
    })
    //new: after the modules' own sections
    headers.hooks.menuSections.add((sections, header) => {
        if (header.getColDef().colId !== 'closedate') {
            return
        }
        sections.push({
            key: 'quickFilters',
            title: 'Quick filters',
            items: [
                { key: 'overdue', text: 'Overdue', iconProps: { iconName: 'Warning' }, onClick: () => { provider.setFiltering(OVERDUE_DEALS); provider.refresh() } },
                { key: 'showAll', text: 'Show all deals', iconProps: { iconName: 'ClearFilter' }, onClick: () => { provider.setFiltering(null); provider.refresh() } },
            ],
        })
    }, GRID_MODULE_PRIORITY.aggregation + 1)
}

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DealsRibbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule({ components: SORTING_COMPONENTS }), createFilteringModule()]}
            onSetup={extendHeaders} />
    </DatasetControl.Body>
</DatasetControl>
`

export const CellsOfYourOwnExample = () => <GridExampleRunner seedCode={withDealGrid(CELLS_OF_YOUR_OWN_CODE, DEALS_RIBBON_FILE)} tabs={DEAL_LIST_TABS} />

export const HeadersOfYourOwnExample = () => <GridExampleRunner seedCode={withDealGrid(HEADERS_OF_YOUR_OWN_CODE, DEALS_RIBBON_FILE)} tabs={DEAL_LIST_TABS} />
