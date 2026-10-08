import React from 'react'
import { CommandBarButton, Icon, keyframes, mergeStyleSets, PrimaryButton, Text } from '@fluentui/react'
import { getTextColorForBackground, GRID_MODULE_PRIORITY, IGridModule, createCellSelectionModule, createClientSideRowModelModule, createClipboardModule, createEditingModule, createRowSelectionModule, createFilteringModule, createSortingModule, createAggregationModule, createGroupingModule, createLegacyClientApiCompatibilityModule, createServerSideRowModelModule, Callout, Grid, IColumnHeaderRendererProps, IGridCellParams, IGrid, IGridModules } from '@talxis/base-controls'
import { DataTypes, IAddControlNotificationOptions, IFieldValidationResult, IRecord, MemoryDataProvider } from '@talxis/client-libraries'
import { COLUMNS, DEFAULT_ROW_COUNT, getDataSource, PRIMARY_ID } from './scratchGridData'

const PAYLOAD_COLUMN = 'payload'

const NUMBER_TYPES = new Set<string>([DataTypes.WholeNone, DataTypes.Decimal, DataTypes.Currency, DataTypes.WholeDuration])

/** A colour from hue (0-360), saturation and lightness (0-100), as hex. */
const hslToHex = (hue: number, saturation: number, lightness: number): string => {
    const s = saturation / 100
    const l = lightness / 100
    const channel = (n: number) => {
        const k = (n + hue / 30) % 12
        const value = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1))
        return Math.round(value * 255).toString(16).padStart(2, '0')
    }
    return `#${channel(0)}${channel(8)}${channel(4)}`
}

const hashText = (text: string): number => [...text].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) | 0, 0)

/** Every data column takes input where its cell stands, with no editor to open. */
const oneClickEditModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('columns').registerColumnDefinitions(columnDefs => {
            const columnsMap = runtime.services.get('provider').getColumnsMap()
            for (const colDef of columnDefs.filter(colDef => !!columnsMap[colDef.colId!])) {
                colDef.context = { ...colDef.context, cell: { ...colDef.context?.cell, oneClickEdit: true } }
            }
        })
    },
}

/** Tints every record cell: numbers from green to red across their column's range, any other value by what it is. */
const heatmapModule: IGridModule = {
    onRegister: runtime => {
        const provider = runtime.services.get('provider')
        const cells = runtime.services.get('cells')
        let ranges = new Map<string, { min: number; max: number }>()

        const getRange = (columnName: string) => {
            let range = ranges.get(columnName)
            if (!range) {
                const values = provider.getRecords().map(record => Number(record.getValue(columnName))).filter(Number.isFinite)
                range = { min: Math.min(...values), max: Math.max(...values) }
                ranges.set(columnName, range)
            }
            return range
        }

        const getColor = (record: IRecord, columnName: string, dataType: string | undefined): string => {
            //a column the grid adds, such as the checkbox column, holds no value of its own
            if (!dataType) {
                return hslToHex(210, 25, 92)
            }
            const value = record.getValue(columnName)
            if (NUMBER_TYPES.has(dataType)) {
                const { min, max } = getRange(columnName)
                const number = Number(value)
                if (value === null || value === undefined || !Number.isFinite(number)) {
                    return hslToHex(0, 0, 94)
                }
                const ratio = max > min ? (number - min) / (max - min) : 0.5
                return hslToHex(120 - 120 * ratio, 70, 80)
            }
            //not every data type formats to a string
            const text = String(record.getFormattedValue(columnName) ?? '')
            return text ? hslToHex(Math.abs(hashText(text)) % 360, 65, 90) : hslToHex(0, 0, 94)
        }

        //an edited number can move its column's range
        const onValueChanged = () => {
            ranges = new Map()
            cells.render()
        }
        const onDataLoaded = () => {
            ranges = new Map()
        }
        provider.addEventListener('onRecordColumnValueChanged', onValueChanged)
        provider.addEventListener('onNewDataLoaded', onDataLoaded)
        runtime.events.addEventListener('onDestroyed', () => {
            provider.removeEventListener('onRecordColumnValueChanged', onValueChanged)
            provider.removeEventListener('onNewDataLoaded', onDataLoaded)
        })

        //after the grouping and totals hooks, which reset backgrounds
        cells.registerCellTheme((theme, { record, columnName }) => {
            const dataType = provider.getColumnsMap()[columnName]?.dataType
            if (record.getSummarizationType() !== 'none') {
                return
            }
            const color = getColor(record, columnName, dataType)
            theme.colors.background = color
            theme.colors.text = getTextColorForBackground(color)
        }, GRID_MODULE_PRIORITY.aggregation + 1)
    },
}

/** What a JSON value is drawn in, by what it is. */
const JSON_COLORS: { [type: string]: string } = {
    string: '#0b6a0b',
    number: '#0050c8',
    boolean: '#8764b8',
    null: '#8a8886',
}

const getJsonColor = (value: unknown) => JSON_COLORS[value === null ? 'null' : typeof value] ?? '#323130'

/** One JSON value: a pill per entry of an object, and the value itself in the colour of its type. */
const JsonValue = (props: { value: unknown }) => {
    const { value } = props
    if (Array.isArray(value)) {
        return <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 4 }}>
            {value.map((entry, index) => <JsonValue key={index} value={entry} />)}
        </span>
    }
    if (value && typeof value === 'object') {
        return <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 4, minWidth: 0 }}>
            {Object.entries(value).map(([key, entry]) => <span
                key={key}
                style={{ display: 'inline-flex', gap: 4, alignItems: 'center', padding: '1px 6px', borderRadius: 10, border: '1px solid #00000014', background: '#0000000a', whiteSpace: 'nowrap' }}>
                <span style={{ color: '#605e5c' }}>{key}</span>
                <JsonValue value={entry} />
            </span>)}
        </span>
    }
    return <span style={{ color: getJsonColor(value), fontFamily: 'Consolas, monospace' }}>{JSON.stringify(value)}</span>
}

/** A payload drawn as what it holds rather than as the string it arrived in. */
const PayloadCell = (props: IGridCellParams) => <Grid.Cell.Field record={props.data} name={props.colDef!.colId!}>
    <Grid.Cell.Renderer {...props} components={{
        columnControl: {
            onRenderControl: controlProps => {
                const payload = controlProps.parameters.Record.raw.getValue(PAYLOAD_COLUMN)
                if (typeof payload !== 'string') {
                    return null
                }
                return <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 4, padding: '6px 9px', fontSize: 12, overflow: 'hidden' }}>
                    {parseJson(payload)}
                </span>
            },
        },
    }} />
</Grid.Cell.Field>

/** What the payload holds, or the string as it stands where it is no JSON. */
const parseJson = (payload: string): JSX.Element => {
    try {
        return <JsonValue value={JSON.parse(payload)} />
    }
    catch {
        return <span>{payload}</span>
    }
}

const SUMMARY_COLUMN = 'aiSummary'

/**
 * Stands in for a model: the same shape of answer, worked out from what the record already holds.
 *
 * Swap the body for the call you want summarizing - the cell only asks for a promise of a sentence.
 */
const summarize = async (record: IRecord): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 700))
    const say = (columnName: string) => record.getFormattedValue(columnName) ?? '---'
    return `${say('name')} is ${say('status').toLowerCase()} with ${say('owner')}, estimated at ${say('estimate')} days and due ${say('due')}. It is tagged ${say('tags')}, and the team has it down as ${say('kind').toLowerCase()} work.`
}

//the sweep that says a model is working, the beat of the sparkle beside it, and how an answer arrives
const shimmerKeyframes = keyframes({ from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } })
const pulseKeyframes = keyframes({ '0%, 100%': { transform: 'scale(1)', opacity: 0.65 }, '50%': { transform: 'scale(1.2)', opacity: 1 } })
const riseKeyframes = keyframes({ from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'none' } })
const blinkKeyframes = keyframes({ '0%, 100%': { opacity: 1 }, '50%': { opacity: 0 } })

const summaryStyles = mergeStyleSets({
    thinking: {
        backgroundImage: 'linear-gradient(90deg, #605e5c 0%, #8764b8 25%, #0078d4 50%, #8764b8 75%, #605e5c 100%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        animation: `${shimmerKeyframes} 2s linear infinite`,
    },
    sparkle: {
        color: '#8764b8',
        animation: `${pulseKeyframes} 1.2s ease-in-out infinite`,
    },
    answer: {
        animation: `${riseKeyframes} 250ms ease-out`,
    },
    caret: {
        animation: `${blinkKeyframes} 900ms steps(1) infinite`,
    },
})

/** An answer arriving a word at a time, the way a model hands one over. */
const useStreamedText = (text: string | undefined) => {
    const [shown, setShown] = React.useState('')

    React.useEffect(() => {
        setShown('')
        if (!text) {
            return
        }
        const words = text.split(' ')
        let spoken = 0
        const timer = setInterval(() => {
            spoken++
            setShown(words.slice(0, spoken).join(' '))
            if (spoken === words.length) {
                clearInterval(timer)
            }
        }, 35)
        return () => clearInterval(timer)
    }, [text])

    return shown
}

/** The button a record is summarized from, and the callout the answer arrives in. */
const RecordSummary = (props: { record: IRecord }) => {
    const { record } = props
    const [isOpen, setIsOpen] = React.useState(false)
    const [summary, setSummary] = React.useState<string>()
    const target = React.useRef<HTMLDivElement>(null)
    const shown = useStreamedText(summary)
    const isThinking = isOpen && !summary
    const isStreaming = !!summary && shown.length < summary.length

    const onSummarize = async () => {
        setSummary(undefined)
        setIsOpen(true)
        setSummary(await summarize(record))
    }

    return <div ref={target} style={{ display: 'flex', padding: '0 9px' }}>
        <PrimaryButton
            iconProps={{ iconName: 'Robot' }}
            text='Summarize'
            disabled={isThinking}
            onClick={onSummarize} />
        {isOpen && <Callout
            target={target}
            gapSpace={4}
            onDismiss={() => setIsOpen(false)}
            styles={{ root: { maxWidth: 320 } }}>
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Text variant='smallPlus' style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon iconName='Sparkle' className={isThinking || isStreaming ? summaryStyles.sparkle : undefined} />
                    <span className={isThinking ? summaryStyles.thinking : undefined}>
                        {isThinking ? 'Reading the record' : 'What this record says'}
                    </span>
                </Text>
                {!isThinking && <Text variant='medium' className={summaryStyles.answer}>
                    {shown}
                    {isStreaming && <span className={summaryStyles.caret}>▍</span>}
                </Text>}
            </div>
        </Callout>}
    </div>
}

/** A record's summary, drawn in the column the story adds. */
const SummaryCell = (props: IGridCellParams) => {
    //a pinned row stands for no record, and a summary is a record's
    if (!props.data) {
        return <Grid.Cell.EmptyRenderer {...props} />
    }
    return <Grid.Cell.Root {...props}>
        <Grid.Cell.Theme>
            <Grid.Cell.Container>
                <Grid.Cell.Control>
                    <RecordSummary record={props.data} />
                </Grid.Cell.Control>
            </Grid.Cell.Container>
        </Grid.Cell.Theme>
    </Grid.Cell.Root>
}

const payloadHeaderStyles = mergeStyleSets({
    container: {
        background: 'linear-gradient(90deg, #0050c80f, #8764b80f)',
        borderBottom: '2px solid #0050c8',
    },
    braces: {
        fontFamily: 'Consolas, monospace',
        fontWeight: 600,
        color: '#0050c8',
        flexShrink: 0,
    },
    badge: {
        padding: '0 6px',
        borderRadius: 8,
        fontSize: 10,
        lineHeight: '16px',
        color: '#fff',
        background: '#0050c8',
        flexShrink: 0,
    },
})

/** The payload column's header, laid out its own way from the grid's parts, so its icons and menu still work. */
const PayloadHeader = (props: IColumnHeaderRendererProps) => <Grid.ColumnHeader.Root {...props}>
    <Grid.ColumnHeader.Theme>
        <Grid.ColumnHeader.Container components={{
            onRenderButton: buttonProps => <CommandBarButton {...buttonProps} className={payloadHeaderStyles.container} />,
        }}>
            <Grid.ColumnHeader.Prefix />
            <span className={payloadHeaderStyles.braces}>{'{ }'}</span>
            <Grid.ColumnHeader.Content>
                <Grid.ColumnHeader.Label />
                <Grid.ColumnHeader.RequiredMarker />
            </Grid.ColumnHeader.Content>
            <span className={payloadHeaderStyles.badge}>JSON</span>
            <Grid.ColumnHeader.Suffix />
        </Grid.ColumnHeader.Container>
        <Grid.ColumnHeader.Menu />
    </Grid.ColumnHeader.Theme>
</Grid.ColumnHeader.Root>

/** The summary column's header: its name, marked as what a model writes. */
const SummaryHeader = (props: IColumnHeaderRendererProps) => <Grid.ColumnHeader.Renderer {...props} components={{
    label: {
        onRenderText: textProps => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <Icon iconName='Sparkle' style={{ color: '#8764b8' }} />
            <Text {...textProps} />
        </span>,
    },
}} />

const SUMMARY_COLUMN_DEFINITION = {
    colId: SUMMARY_COLUMN,
    headerName: 'Summary',
    initialWidth: 160,
    valueGetter: () => null,
    valueFormatter: () => '',
}
const validateEstimate = (result: IFieldValidationResult, { record }: { record: IRecord }) => {
    const estimate = Number(record.getValue('estimate') ?? 0)
    if (estimate > 5) {
        result.error = true
        result.errorMessage = `An estimate of ${estimate} days is more than the 5 this team plans a task in.`
    }
}

/** The columns the story adds or changes, beyond what the provider holds. */
const SCRATCH_COL_DEFS: NonNullable<IGrid['colDefs']> = {
    //a grouped status stays where grouping pins it
    status: colDef => ({ pinned: colDef?.pinned ?? 'right', context: { ...colDef?.context, alignment: 'right' } }),
    //a value the record refuses, so a cell can be seen saying so: an estimate this team would not plan in
    estimate: { context: { cell: { onGetValidation: validateEstimate } } },
    [PAYLOAD_COLUMN]: { cellRenderer: PayloadCell, headerComponent: PayloadHeader },
    [SUMMARY_COLUMN]: { ...SUMMARY_COLUMN_DEFINITION, cellRenderer: SummaryCell, headerComponent: SummaryHeader },
}

export interface IScratchGridProps {
    rowModel: 'clientSide' | 'serverSide'
    clipboard: boolean
    cellSelection: boolean
    enableEditing: boolean
    /** How tall a row is, in pixels. */
    rowHeight?: number
    enableAutoSave: boolean
    enableNavigation: boolean
    enableZebra: boolean
    enableOptionSetColors: boolean
    sorting: boolean
    filtering: boolean
    grouping: boolean
    aggregation: boolean
    selectableRows: 'none' | 'single' | 'multiple'
    /** How many rows the in-memory provider holds. */
    rowCount?: number
    /** Tints every record cell by its value through the cell theme hook. */
    heatmap?: boolean
}

/** Notifications a legacy script would set on the Name cell. */
const getNotifications = (record: IRecord): IAddControlNotificationOptions[] => {
    const name = record.getValue('name')
    const getActions = (count: number) => Array.from({ length: count }, (_, index) => ({
        message: `Action ${index + 1}`,
        actions: [() => alert(`${name}: action ${index + 1}`)],
    }))
    return [{
        uniqueId: 'single',
        notificationLevel: 'RECOMMENDATION',
        text: 'Single Action',
        iconName: 'LightningBolt',
        messages: [],
        actions: getActions(1),
    }, {
        uniqueId: 'two',
        notificationLevel: 'RECOMMENDATION',
        text: 'Two Actions',
        iconName: 'LightningBolt',
        messages: ['Choose one of the following actions:'],
        actions: getActions(2),
    }, {
        uniqueId: 'multiple',
        notificationLevel: 'RECOMMENDATION',
        text: 'Multiple Actions',
        iconName: 'LightningBolt',
        messages: ['Choose one of the following actions:'],
        actions: getActions(4),
    }, {
        uniqueId: 'history',
        notificationLevel: 'RECOMMENDATION',
        text: 'History',
        iconName: 'History',
        messages: [`Last touched by ${record.getValue('owner')}`],
        buttonProps: { renderedInOverflow: true },
    }]
}

/**
 * The scratch harness for the shared `Grid`: an in-memory provider, and the grid rendered directly rather
 * than through a dataset control. Edit this file to try things against the grid.
 *
 * Every module is a toggle, which is the point: what a grid can do is what it was given, so turning one
 * off is how you see what the grid is without it. `owner` and `status` are the columns that say they can
 * be grouped, and `estimate` the one that says what it can total.
 */
export const ScratchGrid = (props: IScratchGridProps) => {
    const rowCount = props.rowCount ?? DEFAULT_ROW_COUNT
    const provider = React.useMemo(() => {
        const provider = new MemoryDataProvider({
            dataSource: getDataSource(rowCount),
            metadata: {
                PrimaryIdAttribute: PRIMARY_ID,
                PrimaryNameAttribute: 'name',
                LogicalName: 'mem_task',
                EntitySetName: 'mem_tasks',
            },
        })
        provider.setColumns(COLUMNS)
        //the row models hand the grid whatever the provider holds, and what it holds is one page: a story
        //asking for ten thousand rows wants them all in play rather than the first fifty
        provider.getPaging().setPageSize(rowCount)
        provider.addEventListener('onRecordLoaded', record => record.expressions.ui.setNotificationsExpression('name', () => getNotifications(record)))
        return provider
    }, [rowCount])

    React.useEffect(() => {
        provider.refresh()
    }, [provider])

    //remounted on every change: modules are read once, which is the contract this story holds to
    const key = `${props.rowModel}-${props.enableEditing}-${props.enableAutoSave}-${props.clipboard}-${props.cellSelection}-${props.selectableRows}-${props.sorting}-${props.filtering}-${props.grouping}-${props.aggregation}-${props.heatmap}`
    const modules = React.useMemo<IGridModules>(() => ({
        rowModel: props.rowModel === 'clientSide'
            ? createClientSideRowModelModule()
            : createServerSideRowModelModule(),
        editing: props.enableEditing ? createEditingModule({ autoSave: props.enableAutoSave }) : undefined,
        clipboard: props.clipboard ? createClipboardModule() : undefined,
        legacyClientApiCompatibility: createLegacyClientApiCompatibilityModule(),
        cellSelection: props.cellSelection ? createCellSelectionModule() : undefined,
        rowSelection: props.selectableRows === 'none' ? undefined : createRowSelectionModule({ mode: props.selectableRows }),
        sorting: props.sorting ? createSortingModule() : undefined,
        filtering: props.filtering ? createFilteringModule() : undefined,
        aggregation: props.aggregation ? createAggregationModule() : undefined,
        grouping: props.grouping ? createGroupingModule({ type: 'nested' }) : undefined,
        custom: [oneClickEditModule, ...(props.heatmap ? [heatmapModule] : [])],
    }), [key])

    return <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <Grid.Root
            key={key}
            provider={provider}
            modules={modules}
            colDefs={SCRATCH_COL_DEFS}
            height='100%'
            enableNavigation={props.enableNavigation}
            enableZebra={props.enableZebra}
            enableOptionSetColors={props.enableOptionSetColors}
            rowHeight={props.rowHeight}
            onGridReady={runtime => { (window as any).__scratchGridApi = runtime.services.get('gridApi') }} />
    </div>
}
