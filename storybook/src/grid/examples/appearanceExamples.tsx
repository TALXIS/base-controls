import React from 'react'
import { IColumn } from '@talxis/client-libraries'
import { GridExampleRunner } from '../GridExampleRunner'
import { createTimesheetsProvider } from '../data'

export const BREACH_DEADLINES_CODE = `const RESOLVED = 4
const AT_RISK_HOURS = 24
const OVERDUE = { background: '#fde7e9', text: '#a4262c' }
const AT_RISK = { background: '#fff4ce', text: '#8a5300' }

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

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        sorting: createSortingModule(),
    }}
    colDefs={{
        duedate: {
            context: {
                cell: {
                    onGetTheme: (theme, { record }) => {
                        const urgency = getUrgency(record)
                        if (urgency) {
                            theme.colors.background = urgency.background
                            theme.colors.text = urgency.text
                        }
                    },
                },
            },
        },
    }}
    enableOptionSetColors
    height='440px' />
`

export const ESCALATED_TICKETS_CODE = `const ESCALATED = '#fde7e9'

const escalatedTicketsModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('cells').registerCellTheme((theme, { record }) => {
            //a two-options value reads as '1' or '0'
            if (record.getValue('escalated') !== '1') {
                return
            }
            theme.colors.background = ESCALATED
            //exported by @talxis/base-controls
            theme.colors.text = getTextColorForBackground(ESCALATED)
        }, GRID_MODULE_PRIORITY.grouping + 1)
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        editing: createEditingModule(),
        grouping: createGroupingModule(),
        custom: [escalatedTicketsModule],
    }}
    colDefs={{
        escalated: { context: { cell: { oneClickEdit: true } } },
    }}
    height='440px' />
`

export const THEME_EDIT_CODE = `const MONOSPACE = 'Consolas, "Courier New", monospace'

const toMonospace = (theme: ITheme) => {
    theme.fonts.medium = { ...theme.fonts.medium, fontFamily: MONOSPACE }
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule() }}
    colDefs={{
        ticketnumber: { context: { cell: { onGetTheme: theme => theme.edit('monospace', toMonospace) } } },
    }}
    height='420px' />
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
        <Grid.Root
            key={[rowHeight, isZebra, hasOptionSetColors].join('|')}
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            rowHeight={rowHeight}
            enableZebra={isZebra}
            enableOptionSetColors={hasOptionSetColors}
            height='440px' />
    </Stack>
}
`

export const COLUMN_LINES_CODE = `//lines between the columns and a frame round the grid
const columnLinesModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('gridTheme').registerTheme((result, fluentTheme) => {
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

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        custom: [columnLinesModule],
    }}
    height='360px' />
`

export const HEADER_COLOURS_CODE = `const CHANGED = '#fff4ce'
const INVALID = '#fde7e9'

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
    onRegister: runtime => {
        const headers = runtime.services.get('columns').headers
        headers.registerColumnHeaderTheme((theme, header) => {
            const column = header.getColumn()
            const background = column && getHeaderColour(column.name)
            if (!background) {
                return
            }
            theme.colors.background = background
            //exported by @talxis/base-controls
            theme.colors.text = getTextColorForBackground(background)
        })
        //a header draws again after a load, not when a value changes
        const redraw = () => headers.render()
        provider.addEventListener('onRecordColumnValueChanged', redraw)
        provider.addEventListener('onAfterSaved', redraw)
        runtime.events.addEventListener('onDestroyed', () => {
            provider.removeEventListener('onRecordColumnValueChanged', redraw)
            provider.removeEventListener('onAfterSaved', redraw)
        })
    },
}

const GridExample = () => {
    const runtime = React.useRef<IGridRuntime>()

    const discard = () => {
        provider.clearChanges()
        runtime.current?.services.get('columns').headers.render()
    }

    const commands: ICommandBarItemProps[] = [
        { key: 'save', text: 'Save', iconProps: { iconName: 'Save' }, onClick: () => { provider.save() } },
        { key: 'discard', text: 'Discard', iconProps: { iconName: 'Undo' }, onClick: discard },
    ]

    return <Stack tokens={{ childrenGap: 8 }}>
        <CommandBar items={commands} />
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule(), custom: [reviewModule] }}
            colDefs={{ hours: { context: { cell: { onGetValidation: validateHours } } } }}
            onGridReady={gridRuntime => runtime.current = gridRuntime}
            height='420px' />
    </Stack>
}
`

export const CZECH_LABELS_CODE = `const APPROVED = 3

const CZECH_LABELS: IGridLabels = {
    noRecordsFound: 'Nenašli jsme žádné záznamy.',
    valueLocked: 'Tuto hodnotu nelze upravit.',
    recordLocked: 'Tento záznam nelze upravit.',
    columnLocked: 'Tento sloupec nelze upravit.',
    recordSaveErrorTitle: 'Změny se nepodařilo uložit',
    recordSaveErrorDismiss: 'Zavřít',
}

const czechSorting = createSortingModule({
    labels: {
        sortTextAscending: 'Seřadit od A do Z',
        sortTextDescending: 'Seřadit od Z do A',
        sortDateAscending: 'Seřadit od nejstarších',
        sortDateDescending: 'Seřadit od nejnovějších',
        sortNumberAscending: 'Seřadit od nejmenších',
        sortNumberDescending: 'Seřadit od největších',
        sortTwoOptionsJoint: 'až',
        clear: 'Zrušit řazení',
        menuSection: 'Řazení',
    },
})

const czechFiltering = createFilteringModule({
    labels: {
        filterMenuFilterBy: 'Filtrovat podle',
        clear: 'Zrušit filtr',
        menuSection: 'Filtrování',
    },
})

const czechGrouping = createGroupingModule({
    labels: {
        group: 'Seskupit',
        ungroup: 'Zrušit seskupení',
        maximumGroupChildrenLimitReached: 'Bylo dosaženo limitu {{maxGroupChildren}} podřízených záznamů. Záznamy nad tento limit se nenačtou.',
        headerTitle: 'Seskupeno',
        menuSection: 'Seskupení',
        expandLevel: 'Rozbalit o úroveň',
        collapseLevel: 'Sbalit o úroveň',
        groupSelectionLimitMessage: 'Tento výběr by načetl záznamy víc než {{maxGroupLoads}} skupin. Vyberte méně skupin, nebo je rozbalte a vyberte jejich záznamy.',
        groupSelectionLimitConfirm: 'OK',
    },
})

const czechTotals = createAggregationModule({
    labels: {
        totalNone: 'Žádný',
        totalAverage: 'Průměr',
        totalMaximum: 'Maximum',
        totalMinimum: 'Minimum',
        totalSum: 'Součet',
        totalCount: 'Počet (včetně prázdných)',
        totalCountColumn: 'Počet',
        menuSection: 'Součty',
    },
})

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        editing: createEditingModule(),
        sorting: czechSorting,
        filtering: czechFiltering,
        grouping: czechGrouping,
        aggregation: czechTotals,
    }}
    labels={CZECH_LABELS}
    colDefs={{
        employee: { context: { isLocked: true } },
    }}
    rowSettings={{
        onGetLock: (result, { record }) => {
            if (Number(record.getValue('status')) === APPROVED) {
                result.isLocked = true
            }
        },
    }}
    height='460px' />
`

export const SpotBreachesExample = () => <GridExampleRunner seedCode={BREACH_DEADLINES_CODE} dataset='tickets' />

export const EscalatedTicketsExample = () => <GridExampleRunner seedCode={ESCALATED_TICKETS_CODE} dataset='tickets' />

export const ThemeEditExample = () => <GridExampleRunner seedCode={THEME_EDIT_CODE} dataset='tickets' />

export const DensityExample = () => <GridExampleRunner seedCode={DENSITY_CODE} dataset='products' />

export const ColumnLinesExample = () => <GridExampleRunner seedCode={COLUMN_LINES_CODE} dataset='products' />

export const HeaderColoursExample = () => <GridExampleRunner seedCode={HEADER_COLOURS_CODE} dataset='timesheets' />


const CZECH_COLUMN_NAMES: { [columnName: string]: string } = {
    description: 'Popis práce',
    employee: 'Zaměstnanec',
    project: 'Projekt',
    date: 'Datum',
    hours: 'Hodiny',
    billable: 'Fakturovat',
    rate: 'Hodinová sazba',
    status: 'Stav',
    comment: 'Komentář',
}

const CZECH_OPTION_LABELS: { [columnName: string]: { [value: number]: string } } = {
    project: { 4: 'Interní' },
    billable: { 0: 'Ne', 1: 'Ano' },
    status: { 1: 'Koncept', 2: 'Odesláno', 3: 'Schváleno', 4: 'Zamítnuto' },
}

const toCzech = (column: IColumn): IColumn => ({
    ...column,
    displayName: CZECH_COLUMN_NAMES[column.name] ?? column.displayName,
    metadata: {
        ...column.metadata,
        OptionSet: column.metadata?.OptionSet?.map(option => ({ ...option, Label: CZECH_OPTION_LABELS[column.name]?.[option.Value] ?? option.Label })),
    },
})

//a Czech user's provider names its columns and options in Czech
const createCzechTimesheetsProvider = () => {
    const provider = createTimesheetsProvider()
    provider.setColumns(provider.getColumns().map(toCzech))
    provider.aggregation.addAggregation({ columnName: 'hours', alias: 'hours_sum', aggregationFunction: 'sum' })
    provider.refresh()
    return provider
}

export const CzechLabelsExample = () => <GridExampleRunner seedCode={CZECH_LABELS_CODE} onCreateProvider={createCzechTimesheetsProvider} />
