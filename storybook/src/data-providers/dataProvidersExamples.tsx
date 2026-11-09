import React from 'react'
import { GridExampleRunner } from '../grid/GridExampleRunner'

export const SHARED_PROVIDER_CODE = `import { ClientSideGrid, createEditingModule, createRowSelectionModule, createSortingModule, DatasetControl, useDataProviderEvents, usePcfContext } from '@talxis/base-controls'
import { DataTypes, MemoryDataProvider } from '@talxis/client-libraries'
import { DefaultButton, PrimaryButton, Stack, Text } from '@fluentui/react'

const createOrder = () => {
    const order = new MemoryDataProvider({
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
    //validation and required levels are set on each record as it loads
    order.addEventListener('onRecordLoaded', record => {
        record.expressions.setValidationExpression('quantity', () => ({ error: record.getValue('quantity') < 1, errorMessage: 'Order at least one.' }))
        record.expressions.setRequiredLevelExpression('product', () => 'required')
    })
    return order
}

//draws again on each of these events
const OrderSummary = () => {
    const provider = useDataProviderEvents(['onNewDataLoaded', 'onRecordsSelected', 'onRecordColumnValueChanged', 'onAfterSaved'])
    const { formatting } = usePcfContext()
    const selected = provider.getSelectedRecordIds().map(id => provider.getRecordsMap()[id])
    const total = selected.reduce((sum, line) => sum + (line.getValue('quantity') ?? 0) * (line.getValue('unitprice') ?? 0), 0)
    const unsaved = provider.getDirtyRecordIds().length
    return <Stack horizontal wrap verticalAlign='center' tokens={{ childrenGap: 12 }}>
        <Text>{selected.length} of {provider.getRecords().length} lines selected: {formatting.formatCurrency(total)}</Text>
        <PrimaryButton text={unsaved === 0 ? 'No changes' : 'Save changes (' + unsaved + ')'} disabled={unsaved === 0} onClick={() => provider.save()} />
        <DefaultButton text='Discard' disabled={unsaved === 0} onClick={() => provider.clearChanges()} />
    </Stack>
}

const GridExample = () => {
    return <DatasetControl onLoad={async () => ({ provider: createOrder() })} height='420px'>
        <DatasetControl.Header>
            <DatasetControl.Header.End>
                <DatasetControl.QuickFind />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <ClientSideGrid
                modules={[
                    createRowSelectionModule({ mode: 'multiple' }),
                    createEditingModule(),
                    createSortingModule(),
                ]} />
        </DatasetControl.Body>
        <DatasetControl.Footer>
            <DatasetControl.Footer.Start>
                <OrderSummary />
            </DatasetControl.Footer.Start>
        </DatasetControl.Footer>
    </DatasetControl>
}
`

export const STEER_FROM_CODE_CODE = `import { ClientSideGrid, createSortingModule, DatasetControl } from '@talxis/base-controls'
import { DataTypes, MemoryDataProvider, Operators, Type } from '@talxis/client-libraries'
import { DefaultButton, Stack } from '@fluentui/react'

const PRIORITY = [
    { Value: 1, Label: 'High', Color: '#a4262c' },
    { Value: 2, Label: 'Normal', Color: '#0078d4' },
    { Value: 3, Label: 'Low', Color: '#038387' },
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
    const [tickets] = React.useState(createTickets)
    //the page destroys the provider, not the control
    React.useEffect(() => () => tickets.destroy(), [tickets])

    //setters only store the state refresh() loads with
    const apply = async (change: () => void) => {
        change()
        await tickets.refresh()
    }

    //sortDirection 1 is descending
    const newestFirst = () => apply(() => tickets.setSorting([{ name: 'createdon', sortDirection: 1 }]))
    const highPriorityOnly = () => apply(() => tickets.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'priority', conditionOperator: Operators.Equal.Value, value: '1' }] }))
    const searchPrinter = () => apply(() => tickets.setSearchQuery('printer'))
    const reset = () => apply(() => {
        tickets.setSorting([])
        tickets.setFiltering(null)
        tickets.setSearchQuery('')
    })
    //paging loads straight away
    const nextPage = async () => await tickets.getPaging().loadNextPage()

    return <Stack tokens={{ childrenGap: 12 }}>
        <Stack horizontal wrap tokens={{ childrenGap: 8 }}>
            <DefaultButton text='Newest first' onClick={newestFirst} />
            <DefaultButton text='High priority only' onClick={highPriorityOnly} />
            <DefaultButton text='Search "printer"' onClick={searchPrinter} />
            <DefaultButton text='Next page' onClick={nextPage} />
            <DefaultButton text='Reset' onClick={reset} />
        </Stack>
        <DatasetControl onLoad={async () => ({ provider: tickets, destroyProviderOnUnmount: false })} height='340px'>
            <DatasetControl.Body>
                <ClientSideGrid modules={[createSortingModule()]} enableOptionSetColors />
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

const HAND_DOWN_CODE = `import { ClientSideGrid, createRowSelectionModule, DataProviderScope, Spinner, useDataProviderEvents } from '@talxis/base-controls'
import { MessageBar, MessageBarType, SearchBox, Stack, Text } from '@fluentui/react'

//draws again on each of these events
const LoadStatus = () => {
    const provider = useDataProviderEvents(['onLoading', 'onError'])
    if (provider.isError()) {
        return <MessageBar messageBarType={MessageBarType.error}>{provider.getErrorMessage()}</MessageBar>
    }
    return provider.isLoading() ? <Spinner label='Loading' labelPosition='right' /> : null
}

const SelectedCount = () => {
    const provider = useDataProviderEvents(['onRecordsSelected'])
    return <Text>{provider.getSelectedRecordIds().length} selected</Text>
}

const GridExample = () => {
    const [deals] = React.useState(createDealsProvider)
    const [search, setSearch] = React.useState('')
    React.useEffect(() => () => deals.destroy(), [deals])

    //nothing inside DataProviderScope loads the provider for you
    React.useEffect(() => {
        const load = async () => {
            deals.setSearchQuery(search)
            await deals.refresh()
        }
        load()
    }, [search])

    return <DataProviderScope provider={deals}>
        <Stack tokens={{ childrenGap: 12 }}>
            <Stack horizontal wrap verticalAlign='center' tokens={{ childrenGap: 16 }}>
                <SearchBox placeholder='Search deals' onSearch={setSearch} onClear={() => setSearch('')} styles={{ root: { width: 240 } }} />
                <SelectedCount />
                <LoadStatus />
            </Stack>
            <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' })]} height='360px' />
        </Stack>
    </DataProviderScope>
}
`

const READ_CODE = `import { ITheme, useTheme } from '@talxis/base-controls'
import { IColumn, TotalRow } from '@talxis/client-libraries'
import { DefaultButton, mergeStyleSets, Stack } from '@fluentui/react'

const getStyles = (theme: ITheme) => mergeStyleSets({
    output: { margin: 0, padding: 12, minHeight: 160, border: \`1px solid \${theme.semanticColors.bodyDivider}\`, borderRadius: theme.effects.roundedCorner4, fontSize: theme.fonts.small.fontSize, whiteSpace: 'pre-wrap' },
})

const describe = (value: any) => value instanceof Date ? 'Date ' + dayjs(value).format('YYYY-MM-DD') : JSON.stringify(value)

const sumOfValue = (column: IColumn): IColumn => column.name === 'value' ? { ...column, aggregation: { aggregationFunction: 'sum' } } : column

const GridExample = () => {
    const theme = useTheme()
    const styles = React.useMemo(() => getStyles(theme), [theme])
    const [lines, setLines] = React.useState(['Pick what to read.'])

    const readDeal = async () => {
        const deals = createDealsProvider()
        const records = await deals.refresh()
        const deal = deals.getRecordsMap()['deal-2']
        setLines([
            records.length + ' records loaded',
            ...['name', 'stage', 'products', 'recurring', 'value', 'closedate'].map(column => \`getValue('\${column}'): \${describe(deal.getValue(column))}\`),
        ])
        deals.destroy()
    }

    const groupByOwner = async () => {
        const deals = createDealsProvider()
        deals.setColumns(deals.getColumns().map(column => column.name === 'owner' ? { ...column, grouping: { isGrouped: true } } : sumOfValue(column)))
        //one record per group now
        const groups = await deals.refresh()
        const results: string[] = []
        for (const group of groups) {
            const groupDeals = deals.createGroupedRecordDataProvider(group)
            const records = await groupDeals.refresh()
            results.push(\`\${group.getValue('owner_group')}: owner_count \${group.getValue('owner_count')}, value_sum \${group.getValue('value_sum')}, \${records.length} records in its provider\`)
        }
        setLines(results)
        deals.destroy()
    }

    const totalValue = async () => {
        const deals = createDealsProvider()
        deals.setColumns(deals.getColumns().map(sumOfValue))
        await deals.refresh()
        //works the totals out again whenever the provider loads
        const totals = new TotalRow(deals)
        await totals.refresh()
        setLines(['value_sum over every deal: ' + totals.getTotalRowRecord()?.getValue('value_sum')])
        totals.destroy()
        deals.destroy()
    }

    return <Stack tokens={{ childrenGap: 12 }}>
        <Stack horizontal wrap tokens={{ childrenGap: 8 }}>
            <DefaultButton text='Read a deal' onClick={readDeal} />
            <DefaultButton text='Group by account manager' onClick={groupByOwner} />
            <DefaultButton text='Total value' onClick={totalValue} />
        </Stack>
        <pre className={styles.output}>{lines.join('\\n')}</pre>
    </Stack>
}
`

const EVENTS_CODE = `import { ClientSideGrid, createEditingModule, createRowSelectionModule, DatasetControl, ITheme, useTheme } from '@talxis/base-controls'
import { DefaultButton, mergeStyleSets, Stack } from '@fluentui/react'

const getStyles = (theme: ITheme) => mergeStyleSets({
    log: { padding: '8px 12px', minHeight: 132, border: \`1px solid \${theme.semanticColors.bodyDivider}\`, borderRadius: theme.effects.roundedCorner4, fontSize: theme.fonts.small.fontSize, lineHeight: '22px' },
    line: { color: theme.semanticColors.bodySubtext },
    latest: { color: theme.semanticColors.bodyText, fontWeight: 600 },
})

const GridExample = () => {
    const theme = useTheme()
    const styles = React.useMemo(() => getStyles(theme), [theme])
    const [deals] = React.useState(createDealsProvider)
    const [log, setLog] = React.useState<string[]>([])
    const write = (line: string) => setLog(log => [line, ...log].slice(0, 6))
    React.useEffect(() => () => deals.destroy(), [deals])

    //returning the remover stops listening on unmount
    React.useEffect(() => deals.addEventListener('onRecordsSelected', ids => write('onRecordsSelected: ' + (ids.join(', ') || 'none'))), [deals])
    React.useEffect(() => deals.addEventListener('onAfterRecordSaved', result => write(\`onAfterRecordSaved: \${result.recordId}, success \${result.success}\`)), [deals])
    //saves each change as it is made
    React.useEffect(() => deals.addEventListener('onRecordColumnValueChanged', async (record, column) => {
        write(\`onRecordColumnValueChanged: \${column} of \${record.getRecordId()}\`)
        await record.save()
    }), [deals])

    return <Stack tokens={{ childrenGap: 12 }}>
        <Stack horizontal wrap tokens={{ childrenGap: 8 }}>
            <DefaultButton text='Select deals 1 and 2' onClick={() => deals.setSelectedRecordIds(['deal-1', 'deal-2'])} />
            <DefaultButton text='Toggle deal 3' onClick={() => deals.toggleSelectedRecordId('deal-3')} />
            <DefaultButton text='Clear the selection' onClick={() => deals.clearSelectedRecordIds()} />
        </Stack>
        <DatasetControl onLoad={async () => ({ provider: deals, destroyProviderOnUnmount: false })} height='300px'>
            <DatasetControl.Body>
                <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule()]} />
            </DatasetControl.Body>
        </DatasetControl>
        <div className={styles.log}>
            {log.map((line, index) => <div key={index} className={index === 0 ? styles.latest : styles.line}>{line}</div>)}
        </div>
    </Stack>
}
`

const OWN_PROVIDER_CODE = `import { ClientSideGrid, createEditingModule, DatasetControl, useDataProviderEvents } from '@talxis/base-controls'
import { DataTypes, IRecord, IRecordSaveOperationResult, MemoryDataProvider } from '@talxis/client-libraries'
import { PrimaryButton, Stack, Text } from '@fluentui/react'
import { saveProduct } from './api'

//its copies are made with the inherited constructor
class ProductsProvider extends MemoryDataProvider {
    public async onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult> {
        try {
            await saveProduct(record.toRawData())
        } catch (error) {
            return { recordId: record.getRecordId(), success: false, fields: [], errors: [{ message: (error as Error).message }] }
        }
        return super.onRecordSave(record)
    }
}

const createProducts = () => new ProductsProvider({
    dataSource: [
        { productid: 'desk', name: 'Standing desk', price: 640 },
        { productid: 'chair', name: 'Ergonomic chair', price: 410 },
        { productid: 'lamp', name: 'Desk lamp', price: 85 },
    ],
    metadata: { PrimaryIdAttribute: 'productid', PrimaryNameAttribute: 'name', LogicalName: 'product' },
    columns: [
        { name: 'name', displayName: 'Product', dataType: DataTypes.SingleLineText, visualSizeFactor: 240 },
        { name: 'price', displayName: 'Price', dataType: DataTypes.Currency, visualSizeFactor: 130 },
    ],
})

const SaveButton = () => {
    const provider = useDataProviderEvents(['onRecordColumnValueChanged', 'onAfterSaved'])
    const [message, setMessage] = React.useState('')
    const save = async () => {
        const results = await provider.save()
        const failed = results.filter(result => !result.success)
        setMessage(failed.length === 0 ? 'Saved.' : failed.map(result => result.errors?.[0]?.message).join(' '))
    }
    return <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 12 }}>
        <PrimaryButton text='Save' disabled={!provider.isDirty()} onClick={save} />
        <Text>{message}</Text>
    </Stack>
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: createProducts() })} height='280px'>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createEditingModule()]} />
    </DatasetControl.Body>
    <DatasetControl.Footer>
        <DatasetControl.Footer.Start>
            <SaveButton />
        </DatasetControl.Footer.Start>
    </DatasetControl.Footer>
</DatasetControl>
`

const API_FILE = {
    name: 'api.ts',
    code: `import { IRawRecord } from '@talxis/client-libraries'

//stands in for your server
export const saveProduct = async (product: IRawRecord) => {
    await new Promise(resolve => setTimeout(resolve, 600))
    if (product.price < 0) {
        throw new Error(product.name + ': the server refuses a negative price.')
    }
}
`,
}

const SERVER_PROVIDER_CODE = `import { ClientSideGrid, createSortingModule, DatasetControl } from '@talxis/base-controls'
import { DataProvider, DataTypes, IAvailableRelatedColumn, IColumn, ICommand, IRecordDeleteOperationResult, IRecordSaveOperationResult, IRetrievedData, IRetrieveRecordCommandOptions } from '@talxis/client-libraries'
import { fetchProducts } from './api'

//sorts, searches and pages on the server
class ProductsProvider extends DataProvider {
    //its copies, such as one per group, are made with the same options
    constructor(options: object) {
        super(options)
        this.setMetadata({ PrimaryIdAttribute: 'productid', PrimaryNameAttribute: 'name', LogicalName: 'product' })
        this.setColumns([
            { name: 'name', displayName: 'Product', dataType: DataTypes.SingleLineText, isPrimary: true, visualSizeFactor: 240 },
            { name: 'price', displayName: 'Price', dataType: DataTypes.Currency, visualSizeFactor: 130 },
        ])
        this.getPaging().setPageSize(5)
    }

    public async getDataAsync(pageNumber: number, pageSize: number): Promise<IRetrievedData> {
        const { items, total } = await fetchProducts({ page: pageNumber, size: pageSize, search: this.getSearchQuery() ?? '', sorting: this.getSorting() })
        return { data: items, totalRecordCount: total, hasNextPage: pageNumber * pageSize < total }
    }

    public getDataSync(): IRetrievedData {
        throw new Error('Not implemented.')
    }

    public async onPreload() { }

    public onGetQuickFindColumns(): IColumn[] {
        return this.getColumns().filter(column => column.isPrimary)
    }

    public async onRetrieveRecordCommand(defaultAction: (options?: IRetrieveRecordCommandOptions) => Promise<ICommand[]>, options?: IRetrieveRecordCommandOptions) {
        return defaultAction(options)
    }

    public onIsRecordActive() {
        return true
    }

    public onOpenDatasetItem(entityReference: ComponentFramework.EntityReference) {
        alert(\`Open \${entityReference.name}\`)
    }

    public async onGetAvailableColumns(): Promise<IColumn[]> {
        return this.getColumns()
    }

    public async onGetAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]> {
        return []
    }

    //the products are read-only
    public async onRecordSave(): Promise<IRecordSaveOperationResult> {
        throw new Error('Not implemented.')
    }

    public async onRecordsDelete(): Promise<{ success: boolean, results: IRecordDeleteOperationResult[] }> {
        throw new Error('Not implemented.')
    }

    public onRecordCreate() {
        throw new Error('Not implemented.')
    }

    public onRecordRawDataUpdate() {
        throw new Error('Not implemented.')
    }

    public async onBulkEdit(): Promise<boolean> {
        throw new Error('Not implemented.')
    }
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: new ProductsProvider({}) })} height='320px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createSortingModule()]} />
    </DatasetControl.Body>
    <DatasetControl.Footer>
        <DatasetControl.Footer.End>
            <DatasetControl.Pagination />
        </DatasetControl.Footer.End>
    </DatasetControl.Footer>
</DatasetControl>
`

const SERVER_API_FILE = {
    name: 'api.ts',
    code: `import { IRawRecord } from '@talxis/client-libraries'

//stands in for your server, which sorts, searches and pages the products
const PRODUCTS: IRawRecord[] = [
    { productid: 'desk', name: 'Standing desk', price: 640 },
    { productid: 'chair', name: 'Ergonomic chair', price: 410 },
    { productid: 'lamp', name: 'Desk lamp', price: 85 },
    { productid: 'monitor', name: 'Monitor arm', price: 120 },
    { productid: 'mat', name: 'Anti-fatigue mat', price: 60 },
    { productid: 'shelf', name: 'Wall shelf', price: 95 },
    { productid: 'cabinet', name: 'Filing cabinet', price: 230 },
    { productid: 'whiteboard', name: 'Whiteboard', price: 150 },
    { productid: 'footrest', name: 'Footrest', price: 45 },
    { productid: 'sofa', name: 'Lounge sofa', price: 980 },
    { productid: 'plant', name: 'Office plant', price: 35 },
    { productid: 'locker', name: 'Locker', price: 310 },
]

interface IProductQuery {
    page: number
    size: number
    search: string
    sorting: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[]
}

export const fetchProducts = async (query: IProductQuery) => {
    await new Promise(resolve => setTimeout(resolve, 400))
    const found = PRODUCTS.filter(product => product.name.toLowerCase().includes(query.search.toLowerCase()))
    const [sort] = query.sorting
    if (sort) {
        const direction = sort.sortDirection === 1 ? -1 : 1
        found.sort((a, b) => (a[sort.name] > b[sort.name] ? 1 : -1) * direction)
    }
    return { items: found.slice((query.page - 1) * query.size, query.page * query.size), total: found.length }
}
`,
}

export const SharedProviderExample = () => <GridExampleRunner seedCode={SHARED_PROVIDER_CODE} tabs={['preview', 'code']} />

export const SteerFromCodeExample = () => <GridExampleRunner seedCode={STEER_FROM_CODE_CODE} tabs={['preview', 'code']} />

export const HandDownExample = () => <GridExampleRunner seedCode={HAND_DOWN_CODE} />

export const ReadExample = () => <GridExampleRunner seedCode={READ_CODE} tabs={['preview', 'code']} />

export const EventsExample = () => <GridExampleRunner seedCode={EVENTS_CODE} />

export const OwnProviderExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: OWN_PROVIDER_CODE }, API_FILE]} tabs={['preview', 'code']} />

export const ServerProviderExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: SERVER_PROVIDER_CODE }, SERVER_API_FILE]} tabs={['preview', 'code']} />
