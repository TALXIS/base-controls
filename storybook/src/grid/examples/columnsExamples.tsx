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

export const PRODUCT_LINK_CODE = `const SECTIONS = [
    { label: 'General', columnNames: ['photo', 'name', 'sku', 'category', 'discontinued'] },
    { label: 'Price and stock', columnNames: ['price', 'instock', 'reorderlevel', 'lastrestocked'] },
    { label: 'Supply', columnNames: ['supplier', 'producturl'] },
]

const styles = mergeStyleSets({
    photo: { width: 96, height: 96, borderRadius: 12, objectFit: 'cover', border: '1px solid #edebe9' },
})

interface IProductPhotoProps {
    product: IRecord
}

//a photo reads better as a picture than as a file field
const ProductPhoto = (props: IProductPhotoProps) => <img className={styles.photo} src={props.product.getValue('photo')?.thumbnailUrl} alt={props.product.getFormattedValue('name') ?? ''} />

//the ribbon's save writes the changes into the record the grid shows
const createProductStrategy = (product: IRecord) => {
    const strategy = new MemoryStrategy({
        onGetColumns: () => provider.getColumns(),
        onGetData: () => ({ ...product.getRawData() }),
        onGetMetadata: () => ({ PrimaryIdAttribute: provider.getMetadata().PrimaryIdAttribute, PrimaryNameAttribute: 'name' }),
    })
    strategy.onSave = async ({ updatedData }) => {
        Object.entries(updatedData).forEach(([columnName, value]) => product.setValue(columnName, value))
        return product.save()
    }
    return strategy
}

interface IProductFormProps {
    product: IRecord
}

const ProductForm = (props: IProductFormProps) => {
    const strategy = React.useMemo(() => createProductStrategy(props.product), [props.product])

    return <Form.Root strategy={strategy}>
        <Form.Notifications />
        <Form.Ribbon />
        {SECTIONS.map(section => <Form.Section key={section.label} label={section.label} layout={{ lg: 2 }} cellLabelPosition='Top'>
            {section.columnNames.map(columnName => <Form.Field key={columnName} name={columnName}>
                {columnName === 'photo'
                    //an explicit undefined label hides the column's name
                    ? <Form.Cell label={undefined} colspan={2}><ProductPhoto product={props.product} /></Form.Cell>
                    : <Form.Cell><Form.Control /></Form.Cell>}
            </Form.Field>)}
        </Form.Section>)}
    </Form.Root>
}

interface IProductPanelProps {
    product?: IRecord
    onDismiss: () => void
}

const ProductPanel = (props: IProductPanelProps) => <Panel isOpen={!!props.product} isLightDismiss type={PanelType.medium} closeButtonAriaLabel='Close' onDismiss={props.onDismiss}>
    {props.product && <ProductForm key={props.product.getRecordId()} product={props.product} />}
</Panel>

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

const styles = mergeStyleSets({
    value: { padding: '0 9px' },
})

//drawn again by Grid.Cell.Root whenever the product changes
const StockValue = () => {
    const cell = useGridCell()
    const { formatting } = usePcfContext()
    return <span className={styles.value} style={{ textAlign: cell.getAlignment() }}>{formatting.formatCurrency(getStockValue(cell.getRecord()))}</span>
}

const StockValueCell = (props: IGridCellParams) => <Grid.Cell.Root {...props}>
    <Grid.Cell.Theme>
        <Grid.Cell.Container>
            <Grid.Cell.Control>
                <StockValue />
            </Grid.Cell.Control>
        </Grid.Cell.Container>
    </Grid.Cell.Theme>
</Grid.Cell.Root>

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule() }}
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
            modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule({ autoSave: true }) }}
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
            onGridReady={gridRuntime => runtime.current = gridRuntime}
            height='440px' />
    </Stack>
}
`

export const HEADER_CODE = `const isLowStock = (product: IRecord) => Number(product.getValue('instock') ?? 0) < Number(product.getValue('reorderlevel') ?? 0)

const QUICK_FILTERS = [
    { key: 'outOfStock', text: 'Out of stock', iconName: 'Blocked', operator: Operators.Equal, value: '0' },
    { key: 'runningLow', text: 'Fewer than 10 left', iconName: 'Warning', operator: Operators.LessThan, value: '10' },
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
        modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule({ autoSave: true }), sorting: createSortingModule() }}
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
                                    ...QUICK_FILTERS.map(filter => ({ key: filter.key, text: filter.text, iconProps: { iconName: filter.iconName }, canCheck: true, checked: activeFilter.current === filter.key, onClick: () => applyQuickFilter(filter.key) })),
                                    { key: 'showAll', text: 'Show all products', iconProps: { iconName: 'ClearFilter' }, disabled: !activeFilter.current, onClick: () => applyQuickFilter() },
                                ],
                            })
                        },
                    },
                },
            },
        }}
        onGridReady={gridRuntime => { runtime.current = gridRuntime }}
        onRecordValueChanged={redrawHeaders}
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

export const AUTO_HEIGHT_CODE = `const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    colDefs={{
        notes: { autoHeight: true },
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

export const AutoHeightExample = () => <GridExampleRunner seedCode={AUTO_HEIGHT_CODE} onCreateProvider={createNotesProvider} />

export const RememberLayoutExample = () => <GridExampleRunner seedCode={REMEMBER_LAYOUT_CODE} dataset='products' />
