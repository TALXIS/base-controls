import { useEffect, useState } from 'react'
import type { IDataProviderEventListeners, IDataset } from '@talxis/client-libraries'

export interface IRecordTableProps {
    dataset: IDataset
    columns: string[]
    /** Rows shown, from the end of the dataset. Defaults to six. */
    limit?: number
}

/** Shows what the records actually hold, which is the only way to watch a write-back land. */
export const RecordTable = ({ dataset, columns, limit = 6 }: IRecordTableProps) => {
    const [, setVersion] = useState(0)
    useEffect(() => {
        const rerender = () => setVersion((current) => current + 1)
        //a create or an edit reports itself as a saved record, not as newly loaded data
        const events = ['onNewDataLoaded', 'onAfterSaved', 'onAfterRecordSaved'] as const
        events.forEach((event) => dataset.addEventListener(event, rerender as IDataProviderEventListeners[typeof event]))
        //the first load may already have finished by the time this runs, so read once rather than wait
        rerender()
        return () => events.forEach((event) =>
            dataset.removeEventListener(event, rerender as IDataProviderEventListeners[typeof event]))
    }, [dataset])

    const records = dataset.getRecords()
    return (
        <table style={{ fontFamily: 'monospace', fontSize: 11, borderCollapse: 'collapse', width: '100%' }}>
            <thead>
                <tr>{columns.map((column) => (
                    <th key={column} style={{ textAlign: 'left', padding: '2px 8px 2px 0', opacity: 0.6 }}>{column}</th>
                ))}</tr>
            </thead>
            <tbody>
                {records.slice(-limit).map((record) => (
                    <tr key={record.getRecordId()}>
                        {columns.map((column) => (
                            <td key={column} style={{ padding: '2px 8px 2px 0' }}>
                                {`${record.getValue(column) ?? ''}`.slice(0, 28) || '—'}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
