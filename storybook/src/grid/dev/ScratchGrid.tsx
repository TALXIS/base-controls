import React from 'react'
import { Icon, keyframes, mergeStyleSets, PrimaryButton, Text } from '@fluentui/react'
import { createCellSelectionModule, createClientSideRowModelModule, createClipboardModule, createRowSelectionModule, createFilteringModule, createSortingModule, createAggregationModule, createGroupingModule, createServerSideRowModelModule, Callout, Grid, IColumnHeaderRendererProps, IGridCellParams, IGridComponents, IGridModule, IGridModules } from '@talxis/base-controls'
import { IRecord, MemoryDataProvider } from '@talxis/client-libraries'
import { COLUMNS, DEFAULT_ROW_COUNT, getDataSource, PRIMARY_ID } from './scratchGridData'

const PAYLOAD_COLUMN = 'payload'

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
const PayloadCell = (props: IGridCellParams) => <Grid.Cell.Renderer {...props} components={{
    control: {
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
                <RecordSummary record={props.data} />
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
            onRenderContainer: containerProps => <Grid.ColumnHeader.Ui.Container {...containerProps} className={payloadHeaderStyles.container} />,
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
        onRenderLabel: labelProps => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <Icon iconName='Sparkle' style={{ color: '#8764b8' }} />
            <Grid.ColumnHeader.Ui.Label {...labelProps} />
        </span>,
    },
}} />

//no renderer: the grid draws it through `onRenderEmptyCellRenderer`
const SUMMARY_COLUMN_DEFINITION = {
    colId: SUMMARY_COLUMN,
    headerName: 'Summary',
    width: 160,
    valueGetter: () => null,
    valueFormatter: () => '',
}

/** The story's own cells, drawn through the grid's components. */
const SCRATCH_GRID_COMPONENTS: Partial<IGridComponents> = {
    onRenderColumnHeader: props => {
        switch (props.column.getColId()) {
            case PAYLOAD_COLUMN: return <PayloadHeader {...props} />
            case SUMMARY_COLUMN: return <SummaryHeader {...props} />
            default: return <Grid.ColumnHeader.Renderer {...props} />
        }
    },
    onRenderCellRenderer: props => props.colDef?.colId === PAYLOAD_COLUMN
        ? <PayloadCell {...props} />
        : <Grid.Cell.Renderer {...props} />,
    onRenderEmptyCellRenderer: props => props.colDef?.colId === SUMMARY_COLUMN
        ? <SummaryCell {...props} />
        : <Grid.Cell.EmptyRenderer {...props} />,
}

/** The columns the story adds or moves, as a module of its own. */
const STORY_COLUMNS_MODULE: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('columns').registerColumnDefinitionsHook(columnDefs => {
            const status = columnDefs.find(columnDef => columnDef.colId === 'status')
            if (status) {
                status.pinned = 'right'
            }
            columnDefs.push(SUMMARY_COLUMN_DEFINITION)
        })
    },
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
        //the alignment is the dataset column's, which is what the header, the cells and what they draw read
        provider.setColumns(COLUMNS.map(column => column.name === 'status' ? { ...column, alignment: 'right' as const } : column))
        //the row models hand the grid whatever the provider holds, and what it holds is one page: a story
        //asking for ten thousand rows wants them all in play rather than the first fifty
        provider.getPaging().setPageSize(rowCount)
        return provider
    }, [rowCount])

    React.useEffect(() => {
        provider.refresh()
    }, [provider])

    //a value the record refuses, so a cell can be seen saying so: an estimate this team would not plan in
    React.useEffect(() => {
        provider.addEventListener('onRecordLoaded', (record: IRecord) => {
            record.expressions.setValidationExpression('estimate', () => {
                const estimate = Number(record.getValue('estimate') ?? 0)
                return { error: estimate > 5, errorMessage: `An estimate of ${estimate} days is more than the 5 this team plans a task in.` }
            })
        })
    }, [provider])

    //remounted on every change: modules are read once, which is the contract this story holds to
    const key = `${props.rowModel}-${props.clipboard}-${props.cellSelection}-${props.selectableRows}-${props.sorting}-${props.filtering}-${props.grouping}-${props.aggregation}`
    const modules = React.useMemo<IGridModules>(() => ({
        rowModel: props.rowModel === 'clientSide'
            ? createClientSideRowModelModule()
            : createServerSideRowModelModule(),
        clipboard: props.clipboard ? createClipboardModule() : undefined,
        cellSelection: props.cellSelection ? createCellSelectionModule() : undefined,
        rowSelection: props.selectableRows === 'none' ? undefined : createRowSelectionModule({ mode: props.selectableRows }),
        sorting: props.sorting ? createSortingModule() : undefined,
        filtering: props.filtering ? createFilteringModule() : undefined,
        aggregation: props.aggregation ? createAggregationModule() : undefined,
        grouping: props.grouping ? createGroupingModule({ type: 'nested' }) : undefined,
        custom: [STORY_COLUMNS_MODULE],
    }), [key])

    return <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <Grid.Root
            key={key}
            provider={provider}
            modules={modules}
            components={SCRATCH_GRID_COMPONENTS}
            height='100%'
            enableEditing={props.enableEditing}
            enableAutoSave={props.enableAutoSave}
            enableNavigation={props.enableNavigation}
            enableZebra={props.enableZebra}
            enableOptionSetColors={props.enableOptionSetColors}
            rowHeight={props.rowHeight}
            onGridReady={runtime => { (window as any).__scratchGridApi = runtime.services.get('gridApi') }} />
    </div>
}
