import React from 'react'
import { GridExampleRunner } from '../grid/GridExampleRunner'

export const SHARED_PROVIDER_CODE = `const createOrder = () => new MemoryDataProvider({
    dataSource: [
        { lineid: 'desk', product: 'Standing desk', quantity: 4, unitprice: 640 },
        { lineid: 'chair', product: 'Ergonomic chair', quantity: 4, unitprice: 410 },
        { lineid: 'lamp', product: 'Desk lamp', quantity: 6, unitprice: 85 },
        { lineid: 'monitor', product: 'Monitor arm', quantity: 8, unitprice: 120 },
        { lineid: 'cabinet', product: 'Filing cabinet', quantity: 2, unitprice: 230 },
        { lineid: 'whiteboard', product: 'Whiteboard 180 x 90 cm', quantity: 1, unitprice: 310 },
    ],
    metadata: { PrimaryIdAttribute: 'lineid', PrimaryNameAttribute: 'product', LogicalName: 'orderline', QuickFindColumns: ['product'] },
    columns: [
        { name: 'product', displayName: 'Product', dataType: DataTypes.SingleLineText, visualSizeFactor: 260 },
        { name: 'quantity', displayName: 'Quantity', dataType: DataTypes.WholeNone, visualSizeFactor: 110 },
        { name: 'unitprice', displayName: 'Unit price', dataType: DataTypes.Currency, visualSizeFactor: 130 },
    ],
})

const toCurrency = (amount: number) => amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' })

const OrderSummary = () => {
    const provider = useDataProviderEvents(['onNewDataLoaded', 'onRecordsSelected', 'onRecordColumnValueChanged', 'onAfterSaved'])
    const selected = provider.getSelectedRecordIds().map(id => provider.getRecordsMap()[id])
    const total = selected.reduce((sum, line) => sum + (line.getValue('quantity') ?? 0) * (line.getValue('unitprice') ?? 0), 0)
    const unsaved = provider.getDirtyRecordIds().length
    return <Stack horizontal wrap verticalAlign='center' tokens={{ childrenGap: 12 }}>
        <Text>{selected.length} of {provider.getRecords().length} lines selected: {toCurrency(total)}</Text>
        <PrimaryButton text={unsaved === 0 ? 'Saved' : 'Save ' + unsaved} disabled={unsaved === 0} onClick={() => provider.save()} />
        <DefaultButton text='Discard' disabled={unsaved === 0} onClick={() => provider.clearChanges()} />
    </Stack>
}

const GridExample = () => {
    const order = React.useMemo(createOrder, [])
    return <DatasetControl onLoad={async () => ({ provider: order })} height='420px'>
        <DatasetControl.Header>
            <DatasetControl.Header.End>
                <DatasetControl.QuickFind />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid
                modules={{
                    rowModel: createClientSideRowModelModule(),
                    rowSelection: createRowSelectionModule({ mode: 'multiple' }),
                    editing: createEditingModule(),
                    sorting: createSortingModule(),
                }} />
        </DatasetControl.Body>
        <DatasetControl.Footer>
            <DatasetControl.Footer.Start>
                <OrderSummary />
            </DatasetControl.Footer.Start>
        </DatasetControl.Footer>
    </DatasetControl>
}
`

export const STEER_FROM_CODE_CODE = `const PRIORITY = [
    { Value: 1, Label: 'High', Color: '#a4262c' },
    { Value: 2, Label: 'Normal', Color: '#0078d4' },
    { Value: 3, Label: 'Low', Color: '#605e5c' },
]

const createTickets = () => new MemoryDataProvider({
    dataSource: [
        { ticketid: 't1', title: 'Printer on 2nd floor jams', priority: 2, createdon: dayjs().subtract(1, 'day').format('YYYY-MM-DD') },
        { ticketid: 't2', title: 'VPN drops every hour', priority: 1, createdon: dayjs().subtract(3, 'day').format('YYYY-MM-DD') },
        { ticketid: 't3', title: 'New laptop for Petra', priority: 3, createdon: dayjs().subtract(8, 'day').format('YYYY-MM-DD') },
        { ticketid: 't4', title: 'Payroll export fails', priority: 1, createdon: dayjs().format('YYYY-MM-DD') },
        { ticketid: 't5', title: 'Printer toner is low', priority: 3, createdon: dayjs().subtract(5, 'day').format('YYYY-MM-DD') },
        { ticketid: 't6', title: 'Meeting room screen flickers', priority: 2, createdon: dayjs().subtract(2, 'day').format('YYYY-MM-DD') },
        { ticketid: 't7', title: 'Email signature for sales team', priority: 3, createdon: dayjs().subtract(12, 'day').format('YYYY-MM-DD') },
        { ticketid: 't8', title: 'Shared drive is read-only', priority: 1, createdon: dayjs().subtract(1, 'day').format('YYYY-MM-DD') },
    ],
    metadata: { PrimaryIdAttribute: 'ticketid', PrimaryNameAttribute: 'title', LogicalName: 'ticket', QuickFindColumns: ['title'] },
    columns: [
        { name: 'title', displayName: 'Title', dataType: DataTypes.SingleLineText, visualSizeFactor: 280 },
        { name: 'priority', displayName: 'Priority', dataType: DataTypes.OptionSet, visualSizeFactor: 120, metadata: { OptionSet: PRIORITY } },
        { name: 'createdon', displayName: 'Created', dataType: DataTypes.DateAndTimeDateOnly, visualSizeFactor: 130 },
    ],
    pageSize: 5,
})

const GridExample = () => {
    const tickets = React.useMemo(createTickets, [])

    const apply = (change: () => void) => {
        change()
        tickets.refresh()
    }

    const newestFirst = () => apply(() => tickets.setSorting([{ name: 'createdon', sortDirection: 1 }]))
    const highPriorityOnly = () => apply(() => tickets.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'priority', conditionOperator: Operators.Equal.Value, value: '1' }] }))
    const searchPrinter = () => apply(() => tickets.setSearchQuery('printer'))
    const reset = () => apply(() => {
        tickets.setSorting([])
        tickets.setFiltering(null)
        tickets.setSearchQuery('')
    })

    return <Stack tokens={{ childrenGap: 12 }}>
        <Stack horizontal wrap tokens={{ childrenGap: 8 }}>
            <DefaultButton text='Newest first' onClick={newestFirst} />
            <DefaultButton text='High priority only' onClick={highPriorityOnly} />
            <DefaultButton text='Search "printer"' onClick={searchPrinter} />
            <DefaultButton text='Reset' onClick={reset} />
        </Stack>
        <DatasetControl onLoad={async () => ({ provider: tickets })} height='340px'>
            <DatasetControl.Body>
                <Grid modules={{ rowModel: createClientSideRowModelModule(), sorting: createSortingModule() }} enableOptionSetColors />
            </DatasetControl.Body>
            <DatasetControl.Footer>
                <DatasetControl.Footer.End>
                    <DatasetControl.Pagination />
                </DatasetControl.Footer.End>
            </DatasetControl.Footer>
        </DatasetControl>
    </Stack>
}
`

export const SharedProviderExample = () => <GridExampleRunner seedCode={SHARED_PROVIDER_CODE} />

export const SteerFromCodeExample = () => <GridExampleRunner seedCode={STEER_FROM_CODE_CODE} />
