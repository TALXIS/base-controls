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

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <Grid
            modules={[
                createClientSideRowModelModule(),
                createSortingModule(),
            ]}
            colDefs={{
                duedate: {
                    context: {
                        cell: {
                            onGetTheme: (builder, { record }) => {
                                const urgency = getUrgency(record)
                                if (urgency) {
                                    //tint keeps the hue readable in light and dark themes
                                    builder.tint(urgency)
                                }
                            },
                        },
                    },
                },
            }}
            enableOptionSetColors
            height='440px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const ESCALATED_TICKETS_CODE = `const ESCALATED = '#d13438'

const escalatedTicketsModule: IGridModule = {
    name: 'escalatedTickets',
    onLoad: grid => {
        grid.services.get('cells').registerCellTheme((builder, { record }) => {
            //a two-options value reads as '1' or '0'
            if (record.getValue('escalated') === '1') {
                builder.tint(ESCALATED)
            }
        }, GRID_MODULE_PRIORITY.grouping + 1)
    },
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <Grid
            modules={[
                createClientSideRowModelModule(),
                createEditingModule(),
                createGroupingModule(),
                escalatedTicketsModule,
            ]}
            colDefs={{
                escalated: { context: { cell: { oneClickEdit: true } } },
            }}
            height='440px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const THEME_EDIT_CODE = `const MONOSPACE = 'Consolas, "Courier New", monospace'

const toMonospace = (theme: ITheme) => {
    theme.fonts.medium = { ...theme.fonts.medium, fontFamily: MONOSPACE }
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <Grid
            modules={[createClientSideRowModelModule(), createEditingModule()]}
            colDefs={{
                ticketnumber: { context: { cell: { onGetTheme: builder => builder.edit('monospace', toMonospace) } } },
            }}
            height='420px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const DENSITY_CODE = `const DENSITIES = [
    { key: '32', text: 'Compact' },
    { key: '42', text: 'Standard' },
    { key: '52', text: 'Comfortable' },
]

const styles = mergeStyleSets({
    densities: { display: 'flex', columnGap: 16 },
})

const GridExample = () => {
    const [rowHeight, setRowHeight] = React.useState(42)
    const [isZebra, setIsZebra] = React.useState(true)
    const [hasOptionSetColors, setHasOptionSetColors] = React.useState(true)

    return <Stack tokens={{ childrenGap: 12 }}>
        <Stack horizontal wrap verticalAlign='end' tokens={{ childrenGap: 32 }}>
            <ChoiceGroup label='Density' selectedKey={String(rowHeight)} options={DENSITIES} onChange={(_, option) => option && setRowHeight(Number(option.key))} styles={{ flexContainer: styles.densities }} />
            <Toggle inlineLabel label='Zebra rows' checked={isZebra} onChange={(_, checked) => setIsZebra(!!checked)} />
            <Toggle inlineLabel label='Option set colours' checked={hasOptionSetColors} onChange={(_, checked) => setHasOptionSetColors(!!checked)} />
        </Stack>
        {/* the grid reads these at mount */}
        <DatasetControl onLoad={async () => ({ provider: provider })}>
            <DatasetControl.Body>
                <Grid
                    key={[rowHeight, isZebra, hasOptionSetColors].join('|')}
                    modules={[createClientSideRowModelModule()]}
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
        grid.services.get('gridTheme').registerTheme((result, fluentTheme) => {
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
        <Grid
            modules={[
                createClientSideRowModelModule(),
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

const validateHours = (result: IFieldValidationResult, { record }: { record: IRecord }) => {
    const hours = Number(record.getValue('hours') ?? 0)
    if (hours < 0.25 || hours > 12) {
        result.error = true
        result.errorMessage = 'Log between 0.25 and 12 hours.'
    }
}

const reviewModule: IGridModule = {
    name: 'review',
    onLoad: grid => {
        const headers = grid.services.get('columns').headers
        headers.registerColumnHeaderTheme((builder, header) => {
            const column = header.getColumn()
            const hue = column && getHeaderColour(column.name)
            if (hue) {
                builder.tint(hue)
            }
        })
        //a header draws again after a load, not when a value changes
        const redraw = () => headers.render()
        const unsubscribes = [
            provider.addEventListener('onRecordColumnValueChanged', redraw),
            provider.addEventListener('onAfterSaved', redraw),
        ]
        grid.events.addEventListener('onDestroyed', () => unsubscribes.forEach(unsubscribe => unsubscribe()))
    },
}

const GridExample = () => {
    const gridRef = React.useRef<IGrid>()

    const discard = () => {
        provider.clearChanges()
        gridRef.current?.services.get('columns').headers.render()
    }

    const loadCommands = async (): Promise<IRibbonCommand[]> => [
        { id: 'discard', label: 'Discard', iconName: 'Undo', onExecute: discard },
    ]

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.Ribbon enableSave onLoad={loadCommands} />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid
                modules={[createClientSideRowModelModule(), createEditingModule(), reviewModule]}
                colDefs={{ hours: { context: { cell: { onGetValidation: validateHours } } } }}
                onReady={grid => gridRef.current = grid}
                height='420px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const INVOICE_LINES_CODE = `const CATALOGUE = [
    { item: 'Standing desk', unitprice: 640 },
    { item: 'Ergonomic chair', unitprice: 410 },
    { item: 'Monitor arm', unitprice: 85 },
    { item: 'Desk lamp', unitprice: 45 },
    { item: 'Filing cabinet', unitprice: 230 },
    { item: 'Footrest', unitprice: 35 },
    { item: 'Whiteboard', unitprice: 140 },
    { item: 'Cable tray', unitprice: 25 },
]

const toLine = (index: number): IRawRecord => ({ lineid: 'line-' + (index + 1), ...CATALOGUE[index % CATALOGUE.length], quantity: (index % 3) + 1 })

const createInvoiceLines = () => new MemoryDataProvider({
    dataSource: [0, 1, 2].map(toLine),
    metadata: { PrimaryIdAttribute: 'lineid', PrimaryNameAttribute: 'item', LogicalName: 'invoiceline' },
    columns: [
        { name: 'item', displayName: 'Item', dataType: DataTypes.SingleLineText, visualSizeFactor: 280 },
        { name: 'quantity', displayName: 'Quantity', dataType: DataTypes.WholeNone, visualSizeFactor: 100 },
        { name: 'unitprice', displayName: 'Unit price', dataType: DataTypes.Currency, visualSizeFactor: 120 },
    ],
})

const GridExample = () => {
    const lines = React.useMemo(createInvoiceLines, [])
    const lineCount = React.useRef(3)
    const control = React.useRef<IDatasetControl>()
    const [maxVisibleRows, setMaxVisibleRows] = React.useState(6)

    const showLines = async (count: number) => {
        lines.setDataSource(Array.from({ length: count }, (_, index) => toLine(index)))
        lineCount.current = count
        await lines.refresh()
        //the ribbon reloads on its own only when the selection changes
        control.current?.parts.find('ribbon')?.reload()
    }

    const loadCommands = async (): Promise<IRibbonCommand[]> => [
        { id: 'add', label: 'Add line', iconName: 'Add', onExecute: () => showLines(lineCount.current + 1) },
        { id: 'remove', label: 'Remove last line', iconName: 'Remove', isDisabled: lineCount.current === 0, onExecute: () => showLines(lineCount.current - 1) },
    ]

    return <DatasetControl onLoad={async () => ({ provider: lines })} onMounted={datasetControl => control.current = datasetControl}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.Ribbon onLoad={loadCommands} />
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 12 }}>
                    <Text>Rows before it scrolls</Text>
                    <Slider min={3} max={15} value={maxVisibleRows} onChange={setMaxVisibleRows} showValue styles={{ root: { width: 200 } }} />
                </Stack>
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid modules={[createClientSideRowModelModule()]} maxVisibleRows={maxVisibleRows} />
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
                    <Grid modules={[createClientSideRowModelModule()]} />
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
