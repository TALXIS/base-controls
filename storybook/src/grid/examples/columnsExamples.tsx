import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import { createDealsProvider, DEAL_COLUMNS, DEAL_DETAIL_COLUMNS } from '../data'

export const KEY_COLUMNS_CODE = `const DETAIL_COLUMNS = ['sku', 'reorderlevel', 'supplier', 'lastrestocked', 'discontinued', 'producturl']

const GridExample = () => {
    const [showEveryColumn, setShowEveryColumn] = React.useState(true)

    return <Stack tokens={{ childrenGap: 8 }}>
        <Toggle inlineLabel label='Show every column' checked={showEveryColumn} onChange={(_, checked) => setShowEveryColumn(!!checked)} />
        <Grid.Root
            //a new key makes the grid build its columns again
            key={String(showEveryColumn)}
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            colDefs={{
                ...Object.fromEntries(DETAIL_COLUMNS.map(name => [name, { hide: !showEveryColumn }])),
                name: { pinned: 'left' },
                category: { pinned: 'right' },
                photo: { maxWidth: 80 },
            }}
            height='420px' />
    </Stack>
}
`

export const PRODUCT_LINK_CODE = `const DETAILS = ['sku', 'category', 'price', 'instock', 'supplier', 'lastrestocked']

interface IProductPanelProps {
    product?: IRecord
    onDismiss: () => void
}

const ProductPanel = (props: IProductPanelProps) => {
    const { product } = props
    const columns = provider.getColumnsMap()

    return <Panel isOpen={!!product} isLightDismiss type={PanelType.smallFixedFar} headerText={product?.getFormattedValue('name') ?? ''} closeButtonAriaLabel='Close' onDismiss={props.onDismiss}>
        {product && <Stack tokens={{ childrenGap: 12 }}>
            <img src={product.getValue('photo')?.thumbnailUrl} alt='' width={64} height={64} />
            {DETAILS.map(name => <div key={name}>
                <Label>{columns[name].displayName}</Label>
                <Text>{product.getFormattedValue(name)}</Text>
            </div>)}
            <Link href={product.getValue('producturl')} target='_blank'>Open the product page</Link>
        </Stack>}
    </Panel>
}

const GridExample = () => {
    const [productId, setProductId] = React.useState<string>()

    return <>
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            colDefs={{
                name: { pinned: 'left', settings: { isPrimary: true } },
            }}
            onOpenRecord={({ record }) => setProductId(record.getRecordId())}
            height='420px' />
        <ProductPanel product={productId ? provider.getRecordsMap()[productId] : undefined} onDismiss={() => setProductId(undefined)} />
    </>
}
`

export const STOCK_VALUE_CODE = `const getStockValue = (product: IRecord) => Number(product.getValue('price') ?? 0) * Number(product.getValue('instock') ?? 0)

const formatMoney = (amount: number) => amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

const styles = mergeStyleSets({
    value: { flex: 1, padding: '0 9px' },
})

//drawn again by Grid.Cell.Root whenever the product changes
const StockValue = () => {
    const cell = useGridCell()
    return <span className={styles.value} style={{ textAlign: cell.getAlignment() }}>{formatMoney(getStockValue(cell.getRecord()))}</span>
}

const StockValueCell = (props: IGridCellParams) => <Grid.Cell.Root {...props}>
    <Grid.Cell.Theme>
        <Grid.Cell.Container>
            <StockValue />
        </Grid.Cell.Container>
    </Grid.Cell.Theme>
</Grid.Cell.Root>

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    colDefs={{
        stockvalue: {
            headerName: 'Stock value',
            pinned: 'right',
            initialWidth: 130,
            cellRenderer: StockValueCell,
            valueGetter: params => params.data ? getStockValue(params.data) : null,
            settings: { alignment: 'right' },
        },
    }}
    enableEditing
    height='440px' />
`

export const ROW_COMMANDS_CODE = `const isLowStock = (product: IRecord) => Number(product.getValue('instock') ?? 0) < Number(product.getValue('reorderlevel') ?? 0)
const isDiscontinued = (product: IRecord) => product.getValue('discontinued') === '1'

const GridExample = () => {
    const [status, setStatus] = React.useState('Hover a product to see what you can do with it.')
    const runtime = React.useRef<IGridRuntime>()

    const reorder = (product: IRecord) => {
        setStatus('Ordered ' + product.getValue('reorderlevel') + ' more of ' + product.getFormattedValue('name') + ' from ' + product.getFormattedValue('supplier') + '.')
    }

    const copySku = async (product: IRecord) => {
        const sku = product.getFormattedValue('sku') ?? ''
        await navigator.clipboard.writeText(sku)
        setStatus('Copied ' + sku + '.')
    }

    const discontinue = (product: IRecord) => {
        runtime.current?.services.get('fields').get(product, 'discontinued').setValue(true)
        setStatus(product.getFormattedValue('name') + ' is discontinued.')
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <MessageBar>{status}</MessageBar>
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            colDefs={{
                actions: {
                    headerName: '',
                    pinned: 'right',
                    initialWidth: 96,
                    settings: {
                        cell: {
                            onGetCommands: (result, { record }) => {
                                if (isLowStock(record) && !isDiscontinued(record)) {
                                    result.items.push({ key: 'reorder', text: 'Reorder', iconOnly: true, iconProps: { iconName: 'ShoppingCart' }, onClick: () => reorder(record) })
                                }
                                result.overflowItems.push({ key: 'copySku', text: 'Copy SKU', iconProps: { iconName: 'Copy' }, onClick: () => { copySku(record) } })
                                if (!isDiscontinued(record)) {
                                    result.overflowItems.push({ key: 'discontinue', text: 'Discontinue', iconProps: { iconName: 'Blocked' }, onClick: () => discontinue(record) })
                                }
                            },
                        },
                    },
                },
            }}
            enableAutoSave
            onGridReady={gridRuntime => runtime.current = gridRuntime}
            height='440px' />
    </Stack>
}
`

export const HEADER_CODE = `const isLowStock = (product: IRecord) => Number(product.getValue('instock') ?? 0) < Number(product.getValue('reorderlevel') ?? 0)

const QUICK_FILTERS = [
    { key: 'outOfStock', text: 'Out of stock', operator: Operators.Equal, value: '0' },
    { key: 'runningLow', text: 'Fewer than 10 left', operator: Operators.LessThan, value: '10' },
]

const styles = mergeStyleSets({
    badge: { minWidth: 18, padding: '0 5px', borderRadius: 9, backgroundColor: '#a4262c', color: '#ffffff', fontSize: 11, fontWeight: FontWeights.semibold, lineHeight: '18px', textAlign: 'center' },
})

const GridExample = () => {
    const runtime = React.useRef<IGridRuntime>()
    const activeFilter = React.useRef<string>()

    const applyQuickFilter = (key?: string) => {
        const filter = QUICK_FILTERS.find(quickFilter => quickFilter.key === key)
        activeFilter.current = filter?.key
        provider.setFiltering(filter ? { filterOperator: Type.And.Value, conditions: [{ attributeName: 'instock', conditionOperator: filter.operator.Value, value: filter.value }] } : null)
        provider.refresh()
    }

    //a header does not watch the values of the records
    const redrawHeaders = () => runtime.current?.services.get('columns').headers.render()

    return <Grid.Root
        provider={provider}
        modules={{ rowModel: createClientSideRowModelModule(), sorting: createSortingModule() }}
        colDefs={{
            instock: {
                settings: {
                    header: {
                        onGetAdornments: adornments => {
                            const lowStock = provider.getRecords().filter(isLowStock).length
                            if (lowStock > 0) {
                                adornments.push({ key: 'lowStock', placement: 'suffix', title: lowStock + ' below reorder level', onRender: () => <span className={styles.badge}>{lowStock}</span> })
                            }
                        },
                        onGetMenuSections: sections => {
                            sections.push({
                                key: 'quickFilters',
                                title: 'Quick filters',
                                items: [
                                    ...QUICK_FILTERS.map(filter => ({ key: filter.key, text: filter.text, canCheck: true, checked: activeFilter.current === filter.key, onClick: () => applyQuickFilter(filter.key) })),
                                    { key: 'showAll', text: 'Show all products', disabled: !activeFilter.current, onClick: () => applyQuickFilter() },
                                ],
                            })
                        },
                    },
                },
            },
        }}
        onGridReady={gridRuntime => { runtime.current = gridRuntime }}
        onRecordValueChanged={redrawHeaders}
        enableEditing
        enableAutoSave
        height='440px' />
}
`

export const LONG_NOTES_CODE = `const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    colDefs={{
        nextstep: { settings: { cell: { isRowResizable: false } } },
    }}
    height='480px' />
`

export const REMEMBER_LAYOUT_CODE = `interface IColumnLayout {
    name: string
    visualSizeFactor?: number
    order?: number
}

interface IProductListProps {
    layout: IColumnLayout[]
    onLayoutChanged: (layout: IColumnLayout[]) => void
}

const openProducts = (layout: IColumnLayout[]) => {
    const products = createProductsProvider()
    const saved = new Map(layout.map(column => [column.name, column]))
    products.setColumns(products.getColumns().map(column => ({ ...column, ...saved.get(column.name) })))
    return products
}

const ProductList = (props: IProductListProps) => {
    const [products] = React.useState(() => openProducts(props.layout))

    return <Grid.Root
        provider={products}
        modules={{ rowModel: createClientSideRowModelModule() }}
        onColumnsChanged={columns => props.onLayoutChanged(columns.map(column => ({ name: column.name, visualSizeFactor: column.visualSizeFactor, order: column.order })))}
        height='420px' />
}

const GridExample = () => {
    const [layout, setLayout] = React.useState<IColumnLayout[]>([])
    const [visit, setVisit] = React.useState(0)

    return <Stack tokens={{ childrenGap: 8 }}>
        <MessageBar actions={<DefaultButton text='Reopen the list' iconProps={{ iconName: 'Refresh' }} onClick={() => setVisit(visit + 1)} />}>
            {layout.length ? 'Layout saved. Reopen the list: it opens the way you left it.' : 'Resize or move a column, then reopen the list.'}
        </MessageBar>
        <ProductList key={visit} layout={layout} onLayoutChanged={setLayout} />
    </Stack>
}
`

const NOTES_COLUMNS = ['name', 'owner', 'stage', 'nextstep', 'notes']

const createNotesProvider = () => {
    const provider = createDealsProvider()
    provider.setColumns([...DEAL_COLUMNS, ...DEAL_DETAIL_COLUMNS].filter(column => NOTES_COLUMNS.includes(column.name)))
    provider.refresh()
    return provider
}

export const KeyColumnsExample = () => <GridExampleRunner seedCode={KEY_COLUMNS_CODE} dataset='products' />

export const ProductLinkExample = () => <GridExampleRunner seedCode={PRODUCT_LINK_CODE} dataset='products' />

export const StockValueExample = () => <GridExampleRunner seedCode={STOCK_VALUE_CODE} dataset='products' />

export const RowCommandsExample = () => <GridExampleRunner seedCode={ROW_COMMANDS_CODE} dataset='products' />

export const HeaderExample = () => <GridExampleRunner seedCode={HEADER_CODE} dataset='products' />

export const LongNotesExample = () => <GridExampleRunner seedCode={LONG_NOTES_CODE} onCreateProvider={createNotesProvider} />

export const RememberLayoutExample = () => <GridExampleRunner seedCode={REMEMBER_LAYOUT_CODE} dataset='products' />
