import React from 'react'
import { CheckListExampleRunner } from './CheckListExampleRunner'

/** Seed snippet of the events example. Every event it subscribes to is logged in the list's own state. */
export const EVENTS_CHECK_LIST_CODE = `const CheckListExample = () => {
    const [log, setLog] = React.useState([])
    const add = (line) => setLog(log => [...log, line])

    return <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
            height: 140,
            overflowY: 'auto',
            padding: 8,
            border: '1px solid #e1dfdd',
            background: '#faf9f8',
            fontFamily: 'monospace',
            fontSize: 12,
        }}>
            {log.length === 0 ? 'Rename an item, tick one, drag one, add one, delete one…' : log.map((line, index) => (
                <div key={index}>{line}</div>
            ))}
        </div>
        <CheckList
            onInitialize={() => ({ data: rows, columns: columns, fieldMapping: fieldMapping })}
            onReady={api => add('onReady · ' + api.getData().length + ' items')}
            onItemCreated={item => add('onItemCreated · ' + item[fieldMapping.name])}
            onItemDeleted={itemId => add('onItemDeleted · ' + itemId)}
            onItemMoved={itemId => add('onItemMoved · ' + itemId)}
            onItemCompletionChanged={(itemId, isCompleted) => add('onItemCompletionChanged · ' + itemId + ' · ' + isCompleted)}
            onItemSaved={result => add('onItemSaved · ' + result.recordId)}
            onDataChanged={items => add('onDataChanged · ' + items.length + ' items')}
            onError={(error, message) => add('onError · ' + message)} />
    </div>
}
`

/** The same list with every event prop wired to a log above it. Editable like every example. */
export const EventsCheckListExample = () => <CheckListExampleRunner seedCode={EVENTS_CHECK_LIST_CODE} />
