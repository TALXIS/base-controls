import React from 'react'
import { createCellSelectionModule, createClientSideRowModelModule, createClipboardModule, createSelectionModule, createFilteringModule, createSortingModule, createAggregationModule, createGroupingModule, createClientSideGroupingStrategy, createServerSideGroupingStrategy, createServerSideRowModelModule, Grid, IGridModule, IGridModules, IGridServiceLocator, OptionSet } from '@talxis/base-controls'
import { DataProvider, MemoryDataProvider } from '@talxis/client-libraries'
import { COLUMNS, DATA_SOURCE, PRIMARY_ID, STATUS_OPTIONS, TAG_OPTIONS } from './scratchGridData'

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

/** The status a row's colour is taken from, and what each one paints. */
const STATUS_COLOURS: Record<number, { background: string; text: string }> = {
    1: { background: '#fde7e9', text: '#7a1015' },
    3: { background: '#dff6dd', text: '#0b5a0b' },
    4: { background: '#4b1113', text: '#ffd9dc' },
    5: { background: '#deecf9', text: '#004578' },
}

/**
 * A cell theme hook, wired onto whichever module the story is given, so the theming can be seen.
 *
 * Colours the whole row from its status and then gives `estimate` a theme of its own on top, which is
 * what proves a later hook gets the later word - and that a cell theme is per cell rather than per row.
 */
const withCellThemeHook = (module: IGridModule): IGridModule => ({
    ...module,
    onRegister: (services: IGridServiceLocator) => {
        module.onRegister?.(services)
        const cells = services.get('cells')
        cells.registerCellThemeHook((theme, params) => {
            const colours = STATUS_COLOURS[params.record.getValue('status') as number]
            if (!colours) {
                return
            }
            return {
                ...theme,
                id: `scratch-status-${params.record.getValue('status')}`,
                semanticColors: {
                    ...theme.semanticColors,
                    bodyBackground: colours.background,
                    bodyText: colours.text,
                },
            }
        })
        //later, so it wins on the one column it cares about
        cells.registerCellThemeHook((theme, params) => {
            if (params.columnName !== 'estimate') {
                return
            }
            return {
                ...theme,
                id: 'scratch-estimate',
                semanticColors: {
                    ...theme.semanticColors,
                    bodyBackground: '#fff4ce',
                    bodyText: '#4a3800',
                },
            }
        }, 10)
        //the checkbox column, in colours nothing would ship: it is a cell like any other, and a hook can
        //say so
        cells.registerCellThemeHook((theme, params) => {
            if (params.columnName !== DataProvider.CONST.CHECKBOX_COLUMN_KEY) {
                return
            }
            const isOddRow = (params.record.getValue('priority') as number) % 2 === 1
            return {
                ...theme,
                id: `scratch-checkbox-${isOddRow}`,
                semanticColors: {
                    ...theme.semanticColors,
                    bodyBackground: isOddRow ? '#ff00ff' : '#00ffc8',
                    bodyText: isOddRow ? '#00ff00' : '#7a0033',
                    inputBorder: '#ff8c00',
                    inputBackgroundChecked: '#ff1493',
                    inputBackgroundCheckedHovered: '#00bfff',
                },
            }
        }, 20)
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
    const provider = React.useMemo(() => {
        const provider = new MemoryDataProvider({
            dataSource: DATA_SOURCE,
            metadata: {
                PrimaryIdAttribute: PRIMARY_ID,
                PrimaryNameAttribute: 'name',
                LogicalName: 'mem_task',
                EntitySetName: 'mem_tasks',
            },
        })
        provider.setColumns(COLUMNS)
        return provider
    }, [])

    React.useEffect(() => {
        provider.refresh()
    }, [provider])

    //remounted on every change: modules are read once, which is the contract this story holds to
    const key = `${props.rowModel}-${props.clipboard}-${props.cellSelection}-${props.selectableRows}-${props.sorting}-${props.filtering}-${props.grouping}-${props.aggregation}`
    const modules = React.useMemo<IGridModules>(() => ({
        rowModel: withCellThemeHook(props.rowModel === 'clientSide'
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
            {/* the same options with the feature off, which is the field every other control is */}
            <OptionSetPreview label='Colours off' options={STATUS_OPTIONS} initialValue={2}
                enableColors={false} />
        </div>
        <Grid
            key={key}
            provider={provider}
            modules={modules}
            height='420px'
            enableEditing={props.enableEditing}
            enableAutoSave={props.enableAutoSave}
            enableNavigation={props.enableNavigation}
            enableZebra={props.enableZebra}
            enableOptionSetColors={props.enableOptionSetColors}
            onGridReady={(api) => { (window as any).__scratchGridApi = api }} />
    </div>
}
