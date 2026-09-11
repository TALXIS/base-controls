import React from 'react'
import { createCellSelectionModule, createClientSideRowModelModule, createClipboardModule, createSelectionModule, createFilteringModule, createSortingModule, createAggregationModule, createGroupingModule, createClientSideGroupingStrategy, createServerSideGroupingStrategy, createServerSideRowModelModule, Grid, IGridCellThemeColors, IGridModule, IGridModules, IGridServiceLocator, OptionSet } from '@talxis/base-controls'
import { IRecord, MemoryDataProvider } from '@talxis/client-libraries'
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

/**
 * A spread of palettes, deliberately uneven: pastels next to near-black, a neon, a barely-there grey, a
 * couple with a primary that fights the background. If a cell looks right in all of them it looks right.
 */
const PALETTES: IGridCellThemeColors[] = [
    //cool slate
    { background: '#eef1f6', text: '#2b3a4b', primary: '#4a6785' },
    //warm sand
    { background: '#fdf3e3', text: '#5c4318', primary: '#b7791f' },
    //sage
    { background: '#e8f4ec', text: '#1c4a2c', primary: '#2e7d4f' },
    //deep plum, light text
    { background: '#3a2231', text: '#f6e3ef', primary: '#e79ac8' },
    //near black, the darkest surface here
    { background: '#121214', text: '#e8e8ec', primary: '#7f9cf5' },
    //midnight blue with a warm accent, a primary that fights its background
    { background: '#10233f', text: '#d8e4f5', primary: '#ffb347' },
    //neon on dark, fully saturated
    { background: '#0d1f17', text: '#c9ffe5', primary: '#00ff9c' },
    //hot magenta, a light surface that is anything but neutral
    { background: '#ffe6f4', text: '#5c0f3a', primary: '#d6007f' },
    //flat grey, almost no contrast between surface and text
    { background: '#d9d9dd', text: '#4a4a52', primary: '#6e6e78' },
    //paper white with a red accent
    { background: '#ffffff', text: '#1b1b1f', primary: '#d13438' },
    //teal, mid-lightness surface
    { background: '#bfe3e0', text: '#0b3b38', primary: '#0f766e' },
    //mustard, a surface bright enough to need dark everything
    { background: '#f3d06b', text: '#3d2f00', primary: '#7a5c00' },
    //one colour for all three, checkbox cell included: nothing to read the text against, which is what
    //the generator has to make something of rather than crash on
    { background: '#0078d4', text: '#0078d4', primary: '#0078d4' },
]

/** A cell, by what it is: the same cell answers the same whichever render is asking. */
const getCellKey = (record: IRecord, columnName: string) => `${record.getRecordId()}_${columnName}`

/** Which row this is, near enough: the records are keyed `1`, `2`, … by the memory provider. */
const getRowIndex = (record: IRecord) => Number.parseInt(record.getRecordId().replace(/\D/g, ''), 10) || 0

/** Scattered, but the same scattering every render - `Math.random()` here would shimmer a different cell each time. */
const isScatteredCell = (key: string, everyNth: number) =>
    [...key].reduce((hash, character) => hash + character.charCodeAt(0), 0) % everyNth === 0

/**
 * The cell hooks, wired onto whichever module the story is given, so what they do can be seen.
 *
 * Colours the whole row - every column of it, the checkbox included - and then gives `estimate` an accent
 * of its own on top, which is what proves a later hook gets the later word. The last one leaves a
 * scattering of cells shimmering.
 */
const withCellHooks = (module: IGridModule): IGridModule => ({
    ...module,
    onRegister: (services: IGridServiceLocator) => {
        module.onRegister?.(services)
        const cells = services.get('cells')
        //every row gets a palette of its own, cycling through the whole spread rather than the handful a
        //status column happens to hold
        cells.registerCellThemeHook((result, params) => {
            result.colors = { ...PALETTES[getRowIndex(params.record) % PALETTES.length] }
        })
        //later, so it wins on the one column it cares about
        cells.registerCellThemeHook((result, params) => {
            if (params.columnName !== 'estimate') {
                return
            }
            //only the accent: the surface and the text stay whatever the row decided, which is what a
            //column-level hook over a row-level one should be able to do
            result.colors.primary = '#c77800'
        }, 10)
        //a scattering of cells that never stop waiting, which is what a module fetching something of its
        //own would look like until it arrives
        cells.registerCellLoadingHook((result, params) => {
            result.isLoading = isScatteredCell(getCellKey(params.record, params.columnName), 9)
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
            {/* the same options with the feature off, which is the field every other control is */}
            <OptionSetPreview label='Colours off' options={STATUS_OPTIONS} initialValue={2}
                enableColors={false} />
        </div>
        <Grid.Root
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
