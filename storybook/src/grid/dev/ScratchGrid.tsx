import React from 'react'
import { createCellSelectionModule, createClientSideRowModelModule, createClipboardModule, createSelectionModule, createFilteringModule, createSortingModule, createAggregationModule, createGroupingModule, createClientSideGroupingStrategy, createServerSideGroupingStrategy, createServerSideRowModelModule, CellUi, DateTime, Decimal, Duration, Grid, IGridCellParams, IGridCellRenderer, IGridModule, IGridModules, IGridServiceLocator, MultiSelectOptionSet, OptionSet, TextField, TwoOptions, useGridService } from '@talxis/base-controls'
import { IRecord, MemoryDataProvider } from '@talxis/client-libraries'
import { BILLABLE_OPTIONS, COLUMNS, DEFAULT_ROW_COUNT, getDataSource, PRIMARY_ID, STATUS_OPTIONS, TAG_OPTIONS } from './scratchGridData'

/**
 * What a base control needs of a host, and no more.
 *
 * Every surface a control reaches for degrades on its own — no `fluentDesignLanguage` means the default
 * Fluent theme, `-1` means the control sizes itself — so a story can hand one control a context without
 * standing up a PCF runtime around it.
 */
const getPreviewContext = (isDisabled: boolean) => ({
    mode: { allocatedWidth: -1, allocatedHeight: -1, isControlDisabled: isDisabled },
    userSettings: { languageId: 1033 },
} as any)

/** One `OptionSet`, so a choice can be seen as a field beside the same choice as a tag in the grid. */
const OptionSetPreview = (props: {
    label: string
    options: ComponentFramework.PropertyHelper.OptionMetadata[]
    initialValue: number | null
    enableColors: boolean
    disabled?: boolean
}) => {
    const [value, setValue] = React.useState<number | null>(props.initialValue)
    const context = React.useMemo(() => getPreviewContext(!!props.disabled), [props.disabled])
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 190 }}>
        <span style={{ fontSize: 12, opacity: 0.7 }}>{props.label}</span>
        <OptionSet
            context={context}
            parameters={{
                value: {
                    raw: value,
                    attributes: { Options: props.options },
                },
                EnableOptionSetColors: { raw: props.enableColors },
            }}
            onNotifyOutputChanged={(outputs: { value?: number }) => setValue(outputs.value ?? null)} />
    </div>
}

/** One `MultiSelectOptionSet` in its colourful variant, so a set of tags can be seen as a field beside the
 * same set as tags in the grid. */
const MultiSelectOptionSetPreview = (props: {
    label: string
    options: ComponentFramework.PropertyHelper.OptionMetadata[]
    initialValue: number[]
    disabled?: boolean
}) => {
    const [value, setValue] = React.useState<number[]>(props.initialValue)
    const context = React.useMemo(() => getPreviewContext(!!props.disabled), [props.disabled])
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 190 }}>
        <span style={{ fontSize: 12, opacity: 0.7 }}>{props.label}</span>
        <MultiSelectOptionSet
            context={context}
            parameters={{
                value: {
                    raw: value,
                    attributes: { Options: props.options },
                },
                EnableOptionSetColors: { raw: true },
            }}
            onNotifyOutputChanged={(outputs: { value?: number[] }) => setValue(outputs.value ?? [])} />
    </div>
}

/** The columns whose control takes input in the cell itself, with no editor to open. */
const ONE_CLICK_EDIT_COLUMNS = COLUMNS.map(column => column.name)

/**
 * The wash a row takes from the state it is in, by status value.
 *
 * Pale on purpose: this is the background of every cell in the row, and what is drawn on it - the values,
 * the option set's own colours - still has to read.
 */
const STATUS_TINTS: { [status: number]: string } = {
    1: '#fdf3f3',
    2: '#fdf8e7',
    3: '#eff8ef',
    4: '#fdf0f0',
    5: '#eff6fd',
    6: '#f4f4f4',
}

/** The column of the grid's own that the story hangs its loading and its commands off. */
const UNBOUND_DECIMAL_COLUMN = 'unboundDecimal'

/** What the story's own columns hold, since no record has a field for any of them. */
const unboundValues = {
    values: new Map<string, any>(),
    listeners: new Set<() => void>(),
    get(key: string, seed: () => any) {
        if (!this.values.has(key)) {
            this.values.set(key, seed())
        }
        return this.values.get(key)
    },
    set(key: string, value: any) {
        this.values.set(key, value)
        this.listeners.forEach(listener => listener())
    },
    subscribe(listener: () => void) {
        this.listeners.add(listener)
        return () => { this.listeners.delete(listener) }
    },
}

/** Which of the story's values a cell holds: one per row, per column of its own. */
const getUnboundKey = (rowId: string, colId: string) => `${rowId}_${colId}`

/** One column of the grid's own: no record has a field for it, and a base control draws it. */
interface IUnboundColumn {
    colId: string
    headerName: string
    width: number
    /** What the cell starts with, worked out from the row it is in. */
    seed: (rowNumber: number) => any
    onRenderControl: (props: IGridCellRenderer, value: any, setValue: (value: any) => void) => JSX.Element
    /** What the cell says about a value the story will not take. */
    getError?: (value: any) => string | undefined
}

/** Every field base control but the lookup, each in a column the provider knows nothing about. */
const UNBOUND_COLUMNS: IUnboundColumn[] = [
    {
        colId: 'unboundText', headerName: 'Text, unbound', width: 180,
        seed: rowNumber => `Note ${rowNumber}`,
        onRenderControl: ({ context, parameters }, value, setValue) => <TextField
            context={context}
            parameters={{ ...parameters, value: { raw: value } }}
            onNotifyOutputChanged={outputs => setValue(outputs.value ?? '')} />,
    },
    {
        colId: UNBOUND_DECIMAL_COLUMN, headerName: 'Decimal, unbound', width: 220,
        seed: rowNumber => rowNumber,
        //the story's own rule, so a cell of its own can be seen refusing a value
        getError: value => value > 5 ? `${value} is more than the 5 this story takes.` : undefined,
        onRenderControl: ({ context, parameters }, value, setValue) => <Decimal
            context={context}
            parameters={{ ...parameters, value: { raw: value, type: 'Decimal' }, EnableSpinButton: { raw: true } }}
            onNotifyOutputChanged={outputs => setValue(outputs.value ?? 0)} />,
    },
    {
        colId: 'unboundDateTime', headerName: 'Date, unbound', width: 180,
        seed: rowNumber => new Date(2026, rowNumber % 12, (rowNumber % 27) + 1),
        onRenderControl: ({ context, parameters }, value, setValue) => <DateTime
            context={context}
            parameters={{ ...parameters, value: { raw: value, attributes: { Behavior: 1, Format: 'DateAndTime.DateOnly' } } }}
            onNotifyOutputChanged={outputs => setValue(outputs.value ?? null)} />,
    },
    {
        colId: 'unboundDuration', headerName: 'Duration, unbound', width: 160,
        seed: rowNumber => (rowNumber % 6) * 30 + 15,
        onRenderControl: ({ context, parameters }, value, setValue) => <Duration
            context={context}
            parameters={{ ...parameters, value: { raw: value } }}
            onNotifyOutputChanged={outputs => setValue(outputs.value ?? 0)} />,
    },
    {
        colId: 'unboundOptionSet', headerName: 'Choice, unbound', width: 180,
        seed: rowNumber => STATUS_OPTIONS[rowNumber % STATUS_OPTIONS.length].Value,
        onRenderControl: ({ context, parameters }, value, setValue) => <OptionSet
            context={context}
            parameters={{ ...parameters, value: { raw: value, attributes: { Options: STATUS_OPTIONS } } }}
            onNotifyOutputChanged={outputs => setValue(outputs.value ?? null)} />,
    },
    {
        colId: 'unboundMultiSelect', headerName: 'Choices, unbound', width: 220,
        seed: rowNumber => TAG_OPTIONS.slice(rowNumber % 4, (rowNumber % 4) + (rowNumber % 3) + 1).map(option => option.Value),
        onRenderControl: ({ context, parameters }, value, setValue) => <MultiSelectOptionSet
            context={context}
            parameters={{ ...parameters, value: { raw: value, attributes: { Options: TAG_OPTIONS } } }}
            onNotifyOutputChanged={outputs => setValue(outputs.value ?? [])} />,
    },
    {
        colId: 'unboundTwoOptions', headerName: 'Yes or no, unbound', width: 160,
        seed: rowNumber => rowNumber % 2 === 0,
        onRenderControl: ({ context, parameters }, value, setValue) => <TwoOptions
            context={context}
            parameters={{ ...parameters, value: { raw: value, attributes: { Options: BILLABLE_OPTIONS as any } } }}
            onNotifyOutputChanged={outputs => setValue(outputs.value ?? false)} />,
    },
]

/** Every sixth row, by the id it was made with: the story's own reason for a cell to wait. */
const isWaitingRow = (record: IRecord) => Number(record.getRecordId().split('-')[1]) % 6 === 0

/** The value this cell holds, which changes under it when anything else writes one. */
const useUnboundValue = (key: string, seed: () => any): [any, (value: any) => void] => {
    const read = () => unboundValues.get(key, seed)
    const [value, setValue] = React.useState(read)
    React.useEffect(() => unboundValues.subscribe(() => setValue(read())), [key])
    return [value, next => unboundValues.set(key, next)]
}

/** A cell of a column the provider has no field for: the same pieces a bound cell is drawn from. */
const UnboundCell = (props: { column: IUnboundColumn, rowId: string, rowNumber: number }) => {
    const { column, rowId, rowNumber } = props
    const gridTheme = useGridService('theme')
    const [value, setValue] = useUnboundValue(getUnboundKey(rowId, column.colId), () => column.seed(rowNumber))
    const error = column.getError?.(value)

    return <>
        {error && <CellUi.FieldError message={error} surfaceTheme={gridTheme} />}
        <Grid.Control components={{
            //a base control, handed the cell's own parameters and a value the story keeps itself
            onRenderControl: controlProps => column.onRenderControl(controlProps, value, setValue)
        }} />
    </>
}

//the renderers are made once: AG Grid rebuilds every cell of a column whose renderer is a new component
const UNBOUND_COLUMN_DEFINITIONS = UNBOUND_COLUMNS.map(column => ({
    colId: column.colId,
    headerName: column.headerName,
    width: column.width,
    valueGetter: () => null,
    valueFormatter: () => '',
    cellRenderer: (props: IGridCellParams) => {
        //a pinned row stands for no record, and a record is what tells one row's values from another's
        if (!props.data) {
            return null
        }
        //the pieces rather than `Grid.CellRenderer`: the error is the story's own, and no field's
        return <Grid.CellRoot {...props}>
            <Grid.RowResizeGrip>
                <Grid.CellContainer>
                    <Grid.CellLoading>
                        <UnboundCell column={column} rowId={props.data.getRecordId()} rowNumber={(props.node.rowIndex ?? 0) + 1} />
                        <Grid.CellCommands />
                    </Grid.CellLoading>
                </Grid.CellContainer>
            </Grid.RowResizeGrip>
        </Grid.CellRoot>
    },
}))

/** What the story adds through the services, wired onto whichever module it is given. */
const withCellHooks = (module: IGridModule): IGridModule => ({
    ...module,
    onRegister: (services: IGridServiceLocator) => {
        module.onRegister?.(services)
        //columns of the grid's own, which no record has a field for: `Grid.Control` draws them unbound
        services.get('columns').registerColumnDefinitionsHook(
            columnDefs => columnDefs.splice(1, 0, ...UNBOUND_COLUMN_DEFINITIONS))
        //a value the story is still working out: a cell of the grid's own waits like any other
        services.get('cells').registerCellLoadingHook((result, params) => {
            if (params.columnName === UNBOUND_DECIMAL_COLUMN && isWaitingRow(params.record)) {
                result.isLoading = true
            }
        })

        //commands on a cell with no field, which is the other half of what a column of the grid's own has
        services.get('cells').registerCellCommandsHook((result, params) => {
            if (params.columnName !== UNBOUND_DECIMAL_COLUMN || isWaitingRow(params.record)) {
                return
            }
            const key = getUnboundKey(params.record.getRecordId(), UNBOUND_DECIMAL_COLUMN)
            const value = () => Number(unboundValues.values.get(key) ?? 0)
            result.items.push({
                key: 'Double',
                iconOnly: true,
                iconProps: { iconName: 'Calculator' },
                title: 'Double the value',
                onClick: () => unboundValues.set(key, value() * 2),
            }, {
                key: 'Clear',
                text: 'Clear the value',
                iconProps: { iconName: 'Cancel' },
                onClick: () => unboundValues.set(key, 0),
            })
        })
        //a row of commands on the two text columns, some labelled and some not, so what a bar does with
        //both is part of what the story shows - and one of those columns edits on a click while the other
        //opens an editor, so what commands do beside an input is in the story too
        //the state a row is in, washed over every cell of it - the checkboxes included, which is what a
        //theme hook reaches and the record's own formatting expression cannot: that one is a field's, and
        //a column the grid added itself has no field
        services.get('cells').registerCellThemeHook((result, params) => {
            const background = STATUS_TINTS[Number(params.record.getValue('status') ?? 0)]
            if (background) {
                result.colors.background = background
            }
        })
        services.get('cells').registerCellCommandsHook((result, params) => {
            //two of them on the estimates, which change the value rather than log it: an estimate dragged
            //over what the team plans in is what makes the cell say the record refuses it
            if (params.columnName === 'estimate') {
                const step = (key: string, iconName: string, by: number) => ({
                    key: key,
                    iconOnly: true,
                    iconProps: { iconName: iconName },
                    title: key,
                    onClick: () => params.record.setValue('estimate', Math.max(0, Number(params.record.getValue('estimate') ?? 0) + by)),
                })
                result.items.push(step('Longer', 'Add', 1), step('Shorter', 'Remove', -1))
                return
            }
            if (params.columnName !== 'name' && params.columnName !== 'owner') {
                return
            }
            const command = (key: string, iconName: string, options?: { text?: string, disabled?: boolean }) => ({
                key: key,
                text: options?.text,
                iconOnly: !options?.text,
                iconProps: { iconName: iconName },
                title: key,
                disabled: options?.disabled,
                onClick: () => console.log(key, params.record.getRecordId()),
            })
            //two of them open a menu of their own, which is the other surface a cell draws outside itself
            const submenu = (key: string, iconName: string, text: string, choices: string[]) => ({
                //the click opens the menu rather than doing anything of its own
                ...command(key, iconName, { text: text }),
                onClick: undefined,
                subMenuProps: {
                    items: choices.map(choice => ({
                        key: `${key}_${choice}`,
                        text: choice,
                        onClick: () => console.log(key, choice, params.record.getRecordId()),
                    })),
                },
            })
            result.items.push(
                command('Open', 'OpenInNewWindow', { text: 'Open' }),
                command('Edit', 'Edit', { text: 'Edit' }),
                submenu('Status', 'CheckMark', 'Set status', ['Not started', 'In progress', 'Done', 'Blocked']),
                submenu('Move', 'Move', 'Move to', ['Backlog', 'This sprint', 'Next sprint']),
                command('Assign', 'FollowUser', { text: 'Assign to me' }),
                command('Delete', 'Delete', { text: 'Delete', disabled: true }),
                command('Copy', 'Copy', { text: 'Copy' }),
                command('Share', 'Share', { text: 'Share' }),
                command('Flag', 'Flag', { text: 'Flag' }),
                command('Comment', 'Comment', { text: 'Comment' }),
                command('Download', 'Download', { text: 'Download' }),
                command('Archive', 'Archive', { text: 'Archive' }),
            )
        })
    },
})

export interface IScratchGridProps {
    rowModel: 'clientSide' | 'serverSide'
    clipboard: boolean
    cellSelection: boolean
    enableEditing: boolean
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
        provider.setColumns(COLUMNS.map(column => ONE_CLICK_EDIT_COLUMNS.includes(column.name) ? { ...column, oneClickEdit: true } : column))
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
        rowModel: withCellHooks(props.rowModel === 'clientSide'
            ? createClientSideRowModelModule()
            : createServerSideRowModelModule()),
        clipboard: props.clipboard ? createClipboardModule() : undefined,
        cellSelection: props.cellSelection ? createCellSelectionModule() : undefined,
        selection: props.selectableRows === 'none' ? undefined : createSelectionModule({ mode: props.selectableRows }),
        sorting: props.sorting ? createSortingModule() : undefined,
        filtering: props.filtering ? createFilteringModule() : undefined,
        aggregation: props.aggregation ? createAggregationModule() : undefined,
        //the strategy has to be the one for the row model above, which is what the module is refused for
        grouping: props.grouping
            ? createGroupingModule({
                strategy: props.rowModel === 'clientSide'
                    ? createClientSideGroupingStrategy()
                    : createServerSideGroupingStrategy(),
            })
            : undefined,
    }), [key])

    return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <OptionSetPreview label='Status' options={STATUS_OPTIONS} initialValue={2}
                enableColors={props.enableOptionSetColors} />
            <OptionSetPreview label='Status, disabled' options={STATUS_OPTIONS} initialValue={4}
                enableColors={props.enableOptionSetColors} disabled />
            <OptionSetPreview label='Tag, fluorescent' options={TAG_OPTIONS} initialValue={70}
                enableColors={props.enableOptionSetColors} />
            <OptionSetPreview label='Tag, washed out, disabled' options={TAG_OPTIONS} initialValue={100}
                enableColors={props.enableOptionSetColors} disabled />
            <OptionSetPreview label='Tag, no colour' options={TAG_OPTIONS} initialValue={130}
                enableColors={props.enableOptionSetColors} />
            <OptionSetPreview label='Nothing selected' options={STATUS_OPTIONS} initialValue={null}
                enableColors={props.enableOptionSetColors} />
            <OptionSetPreview label='Nothing selected, disabled' options={STATUS_OPTIONS} initialValue={null}
                enableColors={props.enableOptionSetColors} disabled />
            <MultiSelectOptionSetPreview label='Tags, a few' options={TAG_OPTIONS} initialValue={[10, 20, 30]} />
            <MultiSelectOptionSetPreview label='Tags, every one' options={TAG_OPTIONS}
                initialValue={TAG_OPTIONS.map(option => option.Value)} />
            <MultiSelectOptionSetPreview label='Tags, disabled' options={TAG_OPTIONS} initialValue={[50, 90]} disabled />
            {/* the same options with the feature off, which is the field every other control is */}
            <OptionSetPreview label='Colours off' options={STATUS_OPTIONS} initialValue={2}
                enableColors={false} />
        </div>
        <Grid.Root
            key={key}
            provider={provider}
            modules={modules}
            height='420px'
            rowHeight={42}
            enableEditing={props.enableEditing}
            enableAutoSave={props.enableAutoSave}
            enableNavigation={props.enableNavigation}
            enableZebra={props.enableZebra}
            enableOptionSetColors={props.enableOptionSetColors}
            onGridReady={(api) => { (window as any).__scratchGridApi = api }} />
    </div>
}
