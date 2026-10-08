import React from 'react'
import { CheckList, ICheckListFieldMapping, IGridRuntime } from '@talxis/base-controls'
import { PcfContextProvider } from '@talxis/base-controls'
import { Link, Stack, Text } from '@fluentui/react'
import { COMPLETED_COL, createScratchCheckListProvider, NAME_COL, STACK_RANK_COL } from './scratchCheckListData'

const FIELD_MAPPING: ICheckListFieldMapping = {
    name: NAME_COL,
    stackRank: STACK_RANK_COL,
    completed: COMPLETED_COL,
}

interface IEventLogEntry {
    event: string
    detail: string
}

/**
 * The scratch harness for the `CheckList` control over an in-memory provider, with every change it makes
 * logged above it. Edit this file to try things against the control.
 */
export const ScratchCheckList = () => {
    const [entries, setEntries] = React.useState<IEventLogEntry[]>([])
    const consoleRef = React.useRef<HTMLDivElement>(null)

    const log = React.useCallback((event: string, detail: string = '') => {
        setEntries(entries => [...entries, { event, detail }])
    }, [])

    const provider = React.useMemo(() => {
        const provider = createScratchCheckListProvider()
        provider.onDeleted = recordIds => log('onRecordsDelete', recordIds.join(', '))
        return provider
    }, [])

    //oldest first, so the newest line is the one worth keeping in view
    React.useEffect(() => {
        const element = consoleRef.current
        if (element) {
            element.scrollTop = element.scrollHeight
        }
    }, [entries])

    //parked on window so the provider and the runtime can be poked at from the browser console
    const onGridReady = React.useCallback((runtime: IGridRuntime) => {
        Object.assign(window, { checkListProvider: provider, checkListRuntime: runtime })
        log('onGridReady', `${provider.getRecords().length} items`)
    }, [])

    return (
        <PcfContextProvider>
            <Stack tokens={{ childrenGap: 8 }}>
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                    <Text variant="small">Every change the checklist makes</Text>
                    <Link onClick={() => setEntries([])}>Clear</Link>
                </Stack>
                <div
                    ref={consoleRef}
                    style={{
                        height: 160,
                        overflowY: 'auto',
                        padding: 8,
                        border: '1px solid #e1dfdd',
                        background: '#faf9f8',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        fontSize: 12,
                        lineHeight: '18px',
                    }}>
                    {entries.length === 0 &&
                        <div style={{ color: '#605e5c' }}>waiting for events…</div>
                    }
                    {entries.map((entry, index) => (
                        <div key={index}>
                            <span style={{ color: '#605e5c' }}>{`${index + 1}`.padStart(3, '0')} </span>
                            <span style={{ color: '#0f6cbd' }}>{entry.event}</span>
                            {entry.detail && <span>{` ${entry.detail}`}</span>}
                        </div>
                    ))}
                </div>
                <CheckList
                    provider={provider}
                    fieldMapping={FIELD_MAPPING}
                    onGridReady={onGridReady}
                    onRecordValueChanged={(record, columnName, newValue) => log('onRecordValueChanged', `${record.getRecordId()} · ${columnName} = ${newValue}`)}
                    onAfterRecordSaved={result => log('onAfterRecordSaved', `${result.recordId} · ${result.success ? 'success' : 'failed'}`)}
                    onError={message => log('onError', message)} />
            </Stack>
        </PcfContextProvider>
    )
}
