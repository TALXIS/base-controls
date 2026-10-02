import React from 'react'
import { Dropdown, IDropdownOption, Stack, Text } from '@fluentui/react'
import { createCellSelectionModule, createClientSideRowModelModule, createClipboardModule, Grid, IGrid, IGridCellParams, IGridModules, PcfContextProvider } from '@talxis/base-controls'
import { getFormatting, getLocaleFromLanguageId, IRecord, MemoryDataProvider } from '@talxis/client-libraries'
import { COLUMNS, DATE_COLUMN_NAMES, getDataSource, PRIMARY_ID } from './parsingScratchData'
import { mockTimeZone } from './mockTimeZone'

const LOCALES: { key: string, lcid: number }[] = [
    { key: 'en-US', lcid: 1033 },
    { key: 'cs-CZ', lcid: 1029 },
    { key: 'de-DE', lcid: 1031 },
    { key: 'sv-SE', lcid: 1053 },
    { key: 'pl-PL', lcid: 1045 },
    { key: 'fr-FR', lcid: 1036 },
    { key: 'ja-JP', lcid: 1041 },
]

const BROWSER_ZONE = 'browser'

const TIME_ZONES = [
    BROWSER_ZONE,
    'UTC',
    'Europe/Prague',
    'Europe/London',
    'America/Los_Angeles',
    'America/New_York',
    'America/St_Johns',
    'Asia/Kolkata',
    'Asia/Tokyo',
    'Australia/Lord_Howe',
    'Pacific/Kiritimati',
    'Pacific/Pago_Pago',
]

const STORED_COLUMN = 'stored'

//dates are held as the user sees them and stored as Dataverse writes them
const getStoredValues = (record: IRecord) => {
    const rawData = record.toRawData()
    return Object.fromEntries(COLUMNS.filter(column => column.name !== 'name').map(column => [column.name, DATE_COLUMN_NAMES.includes(column.name) ? rawData[column.name] : record.getValue(column.name)]))
}

/** Each key with its value as JSON, so a string and a date written as one can be told apart. */
const ValuePills = (props: { values: { [name: string]: unknown }, highlight?: string }) => <span style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '4px 9px', fontSize: 11, fontFamily: 'Consolas, monospace', overflow: 'hidden' }}>
    {Object.entries(props.values).map(([name, value]) => <span key={name} style={{ padding: '0 6px', borderRadius: 8, whiteSpace: 'nowrap', background: name === props.highlight ? '#0078d42e' : '#0000000a' }}>
        <span style={{ color: '#605e5c' }}>{name}</span> {JSON.stringify(value)}
    </span>)}
</span>

interface ILastChange {
    caseName: string
    columnName?: string
    newValue?: unknown
    stored: { [name: string]: unknown }
    raw?: { [name: string]: unknown }
    savedAt?: string
}

/** The last value written, what its record holds now, and the provider's raw record. */
const LastChange = (props: { change?: ILastChange }) => {
    const { change } = props
    const label = (text: string) => <Text variant='small' style={{ color: '#605e5c', minWidth: 110, paddingTop: 5 }}>{text}</Text>
    return <div style={{ margin: '0 8px', padding: 4, border: '1px solid #edebe9', borderRadius: 4, background: '#faf9f8' }}>
        {!change && <Text variant='small' style={{ padding: 6, display: 'block', color: '#605e5c' }}>Change a cell to see what its record holds.</Text>}
        {change && <>
            <div style={{ display: 'flex' }}>
                {label('Changed')}
                <Text variant='small' style={{ paddingTop: 5 }}>
                    {change.caseName}{change.columnName && <> · <b>{change.columnName}</b> = <code>{JSON.stringify(change.newValue)}</code></>}{change.savedAt && <> · saved {change.savedAt}</>}
                </Text>
            </div>
            <div style={{ display: 'flex' }}>{label('Saves as')}<ValuePills values={change.stored} highlight={change.columnName} /></div>
            {change.raw && <div style={{ display: 'flex' }}>{label('Raw data')}<ValuePills values={change.raw} highlight={change.columnName} /></div>}
        </>}
    </div>
}

/** What the record holds for each column, which is what a save sends. */
const StoredCell = (props: IGridCellParams) => {
    if (!props.data) {
        return <Grid.Cell.EmptyRenderer {...props} />
    }
    return <Grid.Cell.Root {...props}>
        <Grid.Cell.Theme>
            <Grid.Cell.Container>
                <ValuePills values={getStoredValues(props.data)} />
            </Grid.Cell.Container>
        </Grid.Cell.Theme>
    </Grid.Cell.Root>
}

const COL_DEFS: NonNullable<IGrid['colDefs']> = {
    name: { pinned: 'left' },
    [STORED_COLUMN]: {
        colId: STORED_COLUMN,
        headerName: 'Stored (what a save sends)',
        initialWidth: 900,
        autoHeight: true,
        valueGetter: params => params.data ? JSON.stringify(getStoredValues(params.data as IRecord)) : null,
        cellRenderer: StoredCell,
    },
}

const MODULES: IGridModules = {
    rowModel: createClientSideRowModelModule(),
    clipboard: createClipboardModule(),
    cellSelection: createCellSelectionModule(),
}

export interface IParsingScratchGridProps {
    enableAutoSave: boolean
}

const useTimeZone = (timeZone: string) => {
    const [applied, setApplied] = React.useState<string>()
    React.useLayoutEffect(() => {
        const restore = timeZone === BROWSER_ZONE ? undefined : mockTimeZone(timeZone)
        setApplied(timeZone)
        return () => restore?.()
    }, [timeZone])
    return applied === timeZone
}

const ParsingGrid = (props: IParsingScratchGridProps & { culture: string, languageId: number }) => {
    const provider = React.useMemo(() => {
        const formatting = getFormatting({ formatInfoCultureName: props.culture, locale: getLocaleFromLanguageId(props.languageId) })
        return new MemoryDataProvider({
            dataSource: getDataSource(formatting),
            metadata: { PrimaryIdAttribute: PRIMARY_ID, PrimaryNameAttribute: 'name', LogicalName: 'mem_parse', EntitySetName: 'mem_parses' },
            columns: COLUMNS,
            formatting,
        })
    }, [])

    const [change, setChange] = React.useState<ILastChange>()

    React.useEffect(() => {
        const describe = (record: IRecord, columnName?: string, newValue?: unknown, savedAt?: string): ILastChange => ({
            caseName: `${record.getValue('name')}`,
            columnName,
            newValue,
            stored: getStoredValues(record),
            raw: provider.getRawRecord(record.getRecordId()),
            savedAt,
        })
        const onValueChanged = (record: IRecord, columnName: string, newValue: unknown) => setChange(describe(record, columnName, newValue))
        const onSaved = (result: { recordId: string }) => {
            const record = provider.getRecordsMap()[result.recordId]
            if (record) {
                setChange(previous => describe(record, previous?.columnName, previous?.newValue, new Date().toLocaleTimeString()))
            }
        }
        provider.addEventListener('onRecordColumnValueChanged', onValueChanged)
        provider.addEventListener('onAfterRecordSaved', onSaved)
        provider.refresh()
        return () => {
            provider.removeEventListener('onRecordColumnValueChanged', onValueChanged)
            provider.removeEventListener('onAfterRecordSaved', onSaved)
        }
    }, [provider])

    return <PcfContextProvider userSettings={{ formatInfoCultureName: props.culture, lcid: props.languageId }}>
        <LastChange change={change} />
        <Grid.Root
            provider={provider}
            modules={MODULES}
            colDefs={COL_DEFS}
            height='100%'
            enableEditing
            enableNavigation
            enableAutoSave={props.enableAutoSave} />
    </PcfContextProvider>
}

/**
 * A grid of everything values are parsed into, to check reading, typing, pasting and saving by hand.
 *
 * Each row is one tricky moment, held the way Dataverse writes it in every date column. Switch the
 * formatting, the language and the time zone above it; the grid and its records are rebuilt on every switch.
 */
export const ParsingScratchGrid = (props: IParsingScratchGridProps) => {
    const [culture, setCulture] = React.useState('en-US')
    const [languageId, setLanguageId] = React.useState(1033)
    const [timeZone, setTimeZone] = React.useState(BROWSER_ZONE)
    const isReady = useTimeZone(timeZone)

    const cultureOptions: IDropdownOption[] = LOCALES.map(entry => ({ key: entry.key, text: entry.key }))
    const languageOptions: IDropdownOption[] = LOCALES.map(entry => ({ key: entry.lcid, text: `${entry.key} (${entry.lcid})` }))
    const timeZoneOptions: IDropdownOption[] = TIME_ZONES.map(zone => ({ key: zone, text: zone === BROWSER_ZONE ? 'Browser' : zone }))

    return <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: 8 }}>
        <Stack horizontal verticalAlign='end' tokens={{ childrenGap: 16, padding: 8 }} wrap>
            <Dropdown label='Formatting' selectedKey={culture} options={cultureOptions} onChange={(_, option) => setCulture(`${option!.key}`)} styles={{ root: { width: 140 } }} />
            <Dropdown label='Language' selectedKey={languageId} options={languageOptions} onChange={(_, option) => setLanguageId(Number(option!.key))} styles={{ root: { width: 160 } }} />
            <Dropdown label='Time zone' selectedKey={timeZone} options={timeZoneOptions} onChange={(_, option) => setTimeZone(`${option!.key}`)} styles={{ root: { width: 220 } }} />
            {isReady && <Text variant='small' style={{ paddingBottom: 6, color: '#605e5c' }}>
                Now: {new Date().toString()} · Intl zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </Text>}
        </Stack>
        <Text variant='small' style={{ padding: '0 8px', color: '#605e5c' }}>
            Type or paste into cells (for example a date in the selected formatting, "2 hours", "1,234.50", "Yes", "Email; Web", "Contoso"),
            or pick from the editors. The last column shows what each record holds.
        </Text>
        {isReady && <ParsingGrid key={JSON.stringify({ culture, languageId, timeZone, ...props })} culture={culture} languageId={languageId} {...props} />}
    </div>
}
