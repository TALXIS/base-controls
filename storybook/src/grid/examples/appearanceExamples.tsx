import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const BREACH_DEADLINES_CODE = `const RESOLVED = 4
const AT_RISK_HOURS = 24
const OVERDUE = '#d13438'
const AT_RISK = '#c19c00'

const getUrgency = (ticket: IRecord) => {
    const respondBy = ticket.getValue('duedate')
    if (!respondBy || Number(ticket.getValue('status')) === RESOLVED) {
        return undefined
    }
    const hoursLeft = dayjs(respondBy).diff(dayjs(), 'hour', true)
    if (hoursLeft < 0) {
        return OVERDUE
    }
    return hoursLeft < AT_RISK_HOURS ? AT_RISK : undefined
}

const onSetup = (grid: IGrid) => {
    grid.services.get('cells').hooks.theme.add((builder, { record, columnName }) => {
        const urgency = columnName === 'duedate' ? getUrgency(record) : undefined
        if (urgency) {
            //tint keeps the hue readable in light and dark themes
            builder.tint(urgency)
        }
    })
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createSortingModule()]} onSetup={onSetup} height='440px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const ESCALATED_TICKETS_CODE = `const ESCALATED = '#d13438'

const escalatedTicketsModule: IGridModule = {
    name: 'escalatedTickets',
    onLoad: grid => {
        //after grouping, so the tint holds while the rows are grouped
        grid.services.get('cells').hooks.theme.add((builder, { record }) => {
            //a two-options value reads as '1' or '0'
            if (record.getValue('escalated') === '1') {
                builder.tint(ESCALATED)
            }
        }, GRID_MODULE_PRIORITY.grouping + 1)
    },
}

const onSetup = (grid: IGrid) => {
    grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
        const escalated = columnDefs.find(colDef => colDef.colId === 'escalated')!
        escalated.context = { ...escalated.context, cell: { ...escalated.context?.cell, enableOneClickEdit: true } }
    })
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createEditingModule(), escalatedTicketsModule]} onSetup={onSetup} height='440px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const THEME_EDIT_CODE = `const MONOSPACE = 'Consolas, "Courier New", monospace'

const toMonospace = (theme: ITheme) => {
    theme.fonts.medium = { ...theme.fonts.medium, fontFamily: MONOSPACE }
}

const onSetup = (grid: IGrid) => {
    grid.services.get('cells').hooks.theme.add((builder, { columnName }) => {
        if (columnName === 'ticketnumber') {
            builder.edit('monospace', toMonospace)
        }
    })
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createEditingModule()]}
            onSetup={onSetup}
            height='420px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const DENSITY_CODE = `const DENSITIES = [
    { key: '32', text: 'Compact' },
    { key: '42', text: 'Standard' },
    { key: '52', text: 'Comfortable' },
]

const GridExample = () => {
    const [rowHeight, setRowHeight] = React.useState(42)
    const [isZebra, setIsZebra] = React.useState(true)
    const [hasOptionSetColors, setHasOptionSetColors] = React.useState(true)

    return <Stack tokens={{ childrenGap: 12 }}>
        <Stack horizontal wrap verticalAlign='end' tokens={{ childrenGap: 32 }}>
            <ChoiceGroup label='Density' selectedKey={String(rowHeight)} options={DENSITIES} onChange={(_, option) => option && setRowHeight(Number(option.key))} />
            <Toggle inlineLabel label='Zebra rows' checked={isZebra} onChange={(_, checked) => setIsZebra(!!checked)} />
            <Toggle inlineLabel label='Option set colours' checked={hasOptionSetColors} onChange={(_, checked) => setHasOptionSetColors(!!checked)} />
        </Stack>
        {/* the grid reads these at mount */}
        <DatasetControl onLoad={async () => ({ provider: provider })}>
            <DatasetControl.Body>
                <ClientSideGrid
                    key={[rowHeight, isZebra, hasOptionSetColors].join('|')}
                    rowHeight={rowHeight}
                    enableZebra={isZebra}
                    enableOptionSetColors={hasOptionSetColors}
                    height='440px' />
            </DatasetControl.Body>
        </DatasetControl>
    </Stack>
}
`

export const COLUMN_LINES_CODE = `//lines between the columns and a frame round the grid
const columnLinesModule: IGridModule = {
    name: 'columnLines',
    onLoad: grid => {
        grid.services.get('gridTheme').hooks.theme.add((result, fluentTheme) => {
            const line = { color: fluentTheme.semanticColors.bodyDivider }
            result.theme = result.theme.withParams({
                columnBorder: line,
                headerColumnBorder: line,
                wrapperBorder: line,
                headerHeight: 48,
            })
        })
    },
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid
            modules={[
                columnLinesModule,
            ]}
            height='360px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const HEADER_COLOURS_CODE = `//hues mixed into the header's own background, so they read in a light theme and a dark one
const CHANGED = '#c19c00'
const INVALID = '#d13438'

const getHeaderColour = (columnName: string) => {
    const entries = provider.getRecords()
    if (entries.some(entry => entry.getColumnInfo(columnName).error)) {
        return INVALID
    }
    if (entries.some(entry => entry.isDirty(columnName))) {
        return CHANGED
    }
    return undefined
}

const reviewModule: IGridModule = {
    name: 'review',
    onLoad: grid => {
        grid.services.get('validation').hooks.validation.add((result, { record, columnName }) => {
            const hours = Number(record.getValue('hours') ?? 0)
            if (columnName === 'hours' && (hours < 0.25 || hours > 12)) {
                result.error = true
                result.errorMessage = 'Log between 0.25 and 12 hours.'
            }
        })
        const headers = grid.services.get('columns').headers
        headers.hooks.theme.add((builder, header) => {
            const column = header.getColumn()
            const hue = column && getHeaderColour(column.name)
            if (hue) {
                builder.tint(hue)
            }
        })
        //a header draws again after a load, not when a value changes
        const unsubscribe = provider.addEventListener('onRecordColumnValueChanged', () => headers.render())
        grid.lifecycle.events.addEventListener('onDestroyed', unsubscribe)
    },
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createEditingModule(), reviewModule]} height='420px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const INVOICE_LINES_CODE = `const CATALOGUE = [
    { item: 'Standing desk', unitprice: 640 },
    { item: 'Ergonomic chair', unitprice: 410 },
    { item: 'Monitor arm', unitprice: 85 },
    { item: 'Desk lamp', unitprice: 45 },
]

const toLine = (index: number): IRawRecord => ({ lineid: 'line-' + (index + 1), ...CATALOGUE[index % CATALOGUE.length], quantity: (index % 3) + 1 })

const createInvoiceLines = () => new MemoryDataProvider({
    dataSource: [0, 1, 2].map(toLine),
    metadata: { PrimaryIdAttribute: 'lineid', PrimaryNameAttribute: 'item', LogicalName: 'invoiceline' },
    columns: [
        { name: 'item', displayName: 'Item', dataType: DataTypes.SingleLineText },
        { name: 'quantity', displayName: 'Quantity', dataType: DataTypes.WholeNone },
        { name: 'unitprice', displayName: 'Unit price', dataType: DataTypes.Currency },
    ],
})

const GridExample = () => {
    const lines = React.useMemo(createInvoiceLines, [])

    const addLine = async () => {
        lines.setDataSource([...lines.getDataSource(), toLine(lines.getDataSource().length)])
        await lines.refresh()
    }

    const loadCommands = async (): Promise<IRibbonCommand[]> => [
        { id: 'add', label: 'Add line', iconName: 'Add', onExecute: addLine },
    ]

    return <DatasetControl onLoad={async () => ({ provider: lines })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.Ribbon onLoad={loadCommands} />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            {/* no height: the grid grows with its rows, up to six of them */}
            <ClientSideGrid maxVisibleRows={6} />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const FILL_CONTAINER_CODE = `const styles = mergeStyleSets({
    container: { border: '1px solid #edebe9', borderRadius: 4, overflow: 'hidden' },
})

const GridExample = () => {
    const [containerHeight, setContainerHeight] = React.useState(360)

    return <Stack tokens={{ childrenGap: 8 }}>
        <Slider label='Container height' min={220} max={700} step={20} value={containerHeight} onChange={setContainerHeight} showValue valueFormat={value => value + 'px'} styles={{ root: { width: 300 } }} />
        <div className={styles.container} style={{ height: containerHeight }}>
            <DatasetControl height='100%' onLoad={async () => ({ provider: provider })}>
                <DatasetControl.Body>
                    <ClientSideGrid />
                </DatasetControl.Body>
            </DatasetControl>
        </div>
    </Stack>
}
`

export const SpotBreachesExample = () => <GridExampleRunner seedCode={BREACH_DEADLINES_CODE} dataset='tickets' />

export const EscalatedTicketsExample = () => <GridExampleRunner seedCode={ESCALATED_TICKETS_CODE} dataset='tickets' />

export const ThemeEditExample = () => <GridExampleRunner seedCode={THEME_EDIT_CODE} dataset='tickets' />

export const DensityExample = () => <GridExampleRunner seedCode={DENSITY_CODE} dataset='products' />

export const ColumnLinesExample = () => <GridExampleRunner seedCode={COLUMN_LINES_CODE} dataset='products' />

export const HeaderColoursExample = () => <GridExampleRunner seedCode={HEADER_COLOURS_CODE} dataset='timesheets' />

export const InvoiceLinesExample = () => <GridExampleRunner seedCode={INVOICE_LINES_CODE} tabs={['preview', 'code']} />

export const FillContainerExample = () => <GridExampleRunner seedCode={FILL_CONTAINER_CODE} />
