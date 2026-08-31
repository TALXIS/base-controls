import React from 'react'
import { CheckList, ICheckListApi, ICheckListFieldMapping, ICheckListInitializeResult } from '@talxis/base-controls'
import { PcfContextProvider } from '@talxis/base-controls/utils/adapters/pcf-context/PcfContextProvider'
import { Link, Stack, Text } from '@fluentui/react'
import { COLUMNS, COMPLETED_COL, DATA_SOURCE, NAME_COL, PRIMARY_ID, STACK_RANK_COL } from './scratchCheckListData'

const FIELD_MAPPING: ICheckListFieldMapping = {
    id: PRIMARY_ID,
    name: NAME_COL,
    stackRank: STACK_RANK_COL,
    completed: COMPLETED_COL,
}

//long enough to actually see the skeleton the checklist shows while this is pending
const INITIALIZE_DELAY_MS = 1000

interface IEventLogEntry {
    event: string
    detail: string
}

/**
 * The scratch harness for the `CheckList` control: the rows, their columns and the field mapping over
 * them, with every event a consumer can subscribe to logged above it. Edit this file to try things
 * against the control.
 */
export const ScratchCheckList = () => {
    const [entries, setEntries] = React.useState<IEventLogEntry[]>([])
    const consoleRef = React.useRef<HTMLDivElement>(null)

    const log = React.useCallback((event: string, detail: string = '') => {
        setEntries(entries => [...entries, { event, detail }])
    }, [])

    //oldest first, so the newest line is the one worth keeping in view
    React.useEffect(() => {
        const element = consoleRef.current
        if (element) {
            element.scrollTop = element.scrollHeight
        }
    }, [entries])

    const onInitialize = React.useCallback(async (): Promise<ICheckListInitializeResult> => {
        await new Promise(resolve => setTimeout(resolve, INITIALIZE_DELAY_MS))
        return {
            data: DATA_SOURCE,
            columns: COLUMNS,
            fieldMapping: FIELD_MAPPING,
        }
    }, [])

    //parked on window so the api can be poked at from the browser console while using the list
    const onReady = React.useCallback((api: ICheckListApi) => {
        (window as any).checkListApi = api
        log('onReady', `${api.getData().length} items`)
    }, [])

    return (
        <PcfContextProvider>
            <Stack tokens={{ childrenGap: 8 }}>
                <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
                    <Text variant="small">Every event a consumer can subscribe to</Text>
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
                    onInitialize={onInitialize}
                    onReady={onReady}
                    onItemCreated={item => log('onItemCreated', `${item[NAME_COL]} · ${item[PRIMARY_ID]}`)}
                    onItemDeleted={itemId => log('onItemDeleted', itemId)}
                    onItemMoved={itemId => log('onItemMoved', itemId)}
                    onItemCompletionChanged={(itemId, isCompleted) => log('onItemCompletionChanged', `${itemId} · ${isCompleted}`)}
                    onItemSaved={result => log('onItemSaved', `${result.recordId} · ${result.success ? 'success' : 'failed'}`)}
                    onDataChanged={items => log('onDataChanged', `${items.length} items`)}
                    onError={(error, message) => log('onError', message)} />
            </Stack>
        </PcfContextProvider>
    )
}
