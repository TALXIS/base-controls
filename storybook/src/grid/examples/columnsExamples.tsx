import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import { createDealsProvider, DEAL_COLUMNS, DEAL_DETAIL_COLUMNS } from '../data'

export const KEY_COLUMNS_CODE = `const DETAIL_COLUMNS = ['sku', 'reorderlevel', 'supplier', 'lastrestocked', 'discontinued', 'producturl']

//keyed by the provider column's name, which is the definition's colId
const CHANGES: { [colId: string]: Partial<IGridColDef> } = {
    name: { pinned: 'left' },
    category: { pinned: 'right' },
    photo: { maxWidth: 80 },
}

const GridExample = () => {
    const [showEveryColumn, setShowEveryColumn] = React.useState(true)

    const onSetup = (grid: IGrid) => {
        //runs each time the grid builds its columns
        grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
            for (const colDef of columnDefs) {
                Object.assign(colDef, CHANGES[colDef.colId!])
                if (DETAIL_COLUMNS.includes(colDef.colId!)) {
                    colDef.hide = !showEveryColumn
                }
                if (colDef.colId === 'price') {
                    colDef.headerName += ' (excl. VAT)'
                }
            }
        })
    }

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <Toggle inlineLabel label='Show every column' checked={showEveryColumn} onChange={(_, checked) => setShowEveryColumn(!!checked)} />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid
                //a new key makes the grid build its columns again
                key={String(showEveryColumn)}
                modules={[createClientSideRowModelModule()]}
                onSetup={onSetup}
                height='420px' />
        </DatasetControl.Body>
    </DatasetControl>
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

interface IProductFormProps {
    product: IRecord
}

const ProductForm = (props: IProductFormProps) => {
    //the ribbon's save saves the record the grid shows
    return <Form.Root key={props.product.getRecordId()} onLoad={async () => ({ record: props.product })}>
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

const ProductPanel = (props: IProductPanelProps) => <Panel isOpen={!!props.product} headerText={props.product?.getValue('name')} isLightDismiss type={PanelType.medium} closeButtonAriaLabel='Close' onDismiss={props.onDismiss} onRenderFooterContent={() => <DefaultButton text='Close' onClick={props.onDismiss} />}>
    {props.product && <ProductForm key={props.product.getRecordId()} product={props.product} />}
</Panel>

const GridExample = () => {
    const [productId, setProductId] = React.useState<string>()

    const onSetup = (grid: IGrid) => {
        grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
            const name = columnDefs.find(colDef => colDef.colId === 'name')!
            name.pinned = 'left'
            //spread, so the grid's own context keys stay
            name.context = { ...name.context, isPrimary: true }
        })
        grid.hooks.openRecord.add(request => {
            //a handled request is not passed on to the provider
            request.isHandled = true
            setProductId(request.record.getRecordId())
        })
    }

    return <>
        <DatasetControl onLoad={async () => ({ provider: provider })}>
            <DatasetControl.Body>
                <Grid
                    modules={[createClientSideRowModelModule()]}
                    onSetup={onSetup}
                    height='420px' />
            </DatasetControl.Body>
        </DatasetControl>
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

const onSetup = (grid: IGrid) => {
    grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
        //a colId that is not a provider column's name adds a column
        columnDefs.push({
            colId: 'stockvalue',
            headerName: 'Stock value',
            pinned: 'right',
            initialWidth: 130,
            cellRenderer: StockValueCell,
            valueGetter: params => params.data ? getStockValue(params.data) : null,
            context: { alignment: 'right' },
        })
    })
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <Grid
            modules={[createClientSideRowModelModule(), createEditingModule()]}
            onSetup={onSetup}
            height='440px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const ROW_COMMANDS_CODE = `const isLowStock = (product: IRecord) => Number(product.getValue('instock') ?? 0) < Number(product.getValue('reorderlevel') ?? 0)
const isDiscontinued = (product: IRecord) => product.getValue('discontinued') === '1'

const GridExample = () => {
    const [status, setStatus] = React.useState('Hover a product to see what you can do with it.')
    const gridRef = React.useRef<IGrid>()

    const reorder = (product: IRecord) => {
        setStatus('Ordered ' + product.getValue('reorderlevel') + ' more of ' + product.getFormattedValue('name') + ' from ' + product.getFormattedValue('supplier') + '.')
    }

    const copySku = async (product: IRecord) => {
        const sku = product.getFormattedValue('sku') ?? ''
        await navigator.clipboard.writeText(sku)
        setStatus('Copied ' + sku + '.')
    }

    const discontinue = (product: IRecord) => {
        gridRef.current?.services.get('fields').get(product, 'discontinued').setValue(true)
        setStatus(product.getFormattedValue('name') + ' is discontinued.')
    }

    const addCommands: GridCellCommandsHook = (result, { record, columnName }) => {
        if (columnName !== 'actions') {
            return
        }
        if (isLowStock(record) && !isDiscontinued(record)) {
            result.items.push({ key: 'reorder', text: 'Reorder', iconOnly: true, iconProps: { iconName: 'ShoppingCart' }, onClick: () => reorder(record) })
        }
        result.overflowItems.push({ key: 'copySku', text: 'Copy SKU', iconProps: { iconName: 'Copy' }, onClick: () => { copySku(record) } })
        if (!isDiscontinued(record)) {
            result.overflowItems.push({ key: 'discontinue', text: 'Discontinue', iconProps: { iconName: 'Blocked' }, onClick: () => discontinue(record) })
        }
    }

    const onSetup = (grid: IGrid) => {
        gridRef.current = grid
        grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
            columnDefs.push({ colId: 'actions', headerName: '', pinned: 'right', initialWidth: 96 })
        })
        grid.services.get('cells').hooks.commands.add(addCommands)
    }

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <MessageBar>{status}</MessageBar>
        <DatasetControl.Body>
            <Grid
                modules={[createClientSideRowModelModule(), createEditingModule({ enableAutoSave: true })]}
                onSetup={onSetup}
                height='440px' />
        </DatasetControl.Body>
    </DatasetControl>
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
    const activeFilter = React.useRef<string>()

    const applyQuickFilter = (key?: string) => {
        const filter = QUICK_FILTERS.find(quickFilter => quickFilter.key === key)
        activeFilter.current = filter?.key
        provider.setFiltering(filter ? { filterOperator: Type.And.Value, conditions: [{ attributeName: 'instock', conditionOperator: filter.operator.Value, value: filter.value }] } : null)
        provider.refresh()
    }

    const addBadge: GridColumnHeaderAdornmentsHook = (adornments, header) => {
        if (header.getColDef().colId !== 'instock') {
            return
        }
        const lowStock = provider.getRecords().filter(isLowStock).length
        if (lowStock > 0) {
            adornments.push({ key: 'lowStock', placement: 'suffix', title: lowStock + ' below reorder level', onRender: () => <span className={styles.badge}>{lowStock}</span> })
        }
    }

    const addQuickFilters: GridColumnMenuSectionsHook = (sections, header) => {
        if (header.getColDef().colId !== 'instock') {
            return
        }
        sections.push({
            key: 'quickFilters',
            title: 'Quick filters',
            items: [
                ...QUICK_FILTERS.map(filter => ({ key: filter.key, text: filter.text, iconProps: { iconName: filter.iconName }, canCheck: true, checked: activeFilter.current === filter.key, onClick: () => applyQuickFilter(filter.key) })),
                { key: 'showAll', text: 'Show all products', iconProps: { iconName: 'ClearFilter' }, disabled: !activeFilter.current, onClick: () => applyQuickFilter() },
            ],
        })
    }

    const onSetup = (grid: IGrid) => {
        const headers = grid.services.get('columns').headers
        headers.hooks.adornments.add(addBadge)
        headers.hooks.menuSections.add(addQuickFilters)
        //a header does not watch the values of the records
        grid.services.observe('gridApi', () => provider.addEventListener('onRecordColumnValueChanged', () => headers.render()))
    }

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <DatasetControl.Body>
            <Grid
                modules={[createClientSideRowModelModule(), createEditingModule({ enableAutoSave: true }), createSortingModule()]}
                onSetup={onSetup}
                height='440px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const LONG_NOTES_CODE = `const onSetup = (grid: IGrid) => {
    grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
        const nextStep = columnDefs.find(colDef => colDef.colId === 'nextstep')!
        //spread, so the cell keeps the rest of what the grid set
        nextStep.context = { ...nextStep.context, cell: { ...nextStep.context?.cell, isRowResizable: false } }
    })
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <Grid
            modules={[createClientSideRowModelModule()]}
            onSetup={onSetup}
            height='480px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const AUTO_HEIGHT_CODE = `const onSetup = (grid: IGrid) => {
    grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
        columnDefs.find(colDef => colDef.colId === 'notes')!.autoHeight = true
    })
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <Grid
            modules={[createClientSideRowModelModule()]}
            onSetup={onSetup}
            height='480px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const REMEMBER_LAYOUT_CODE = `interface IProductListProps {
    onReopen: () => void
}

//the control keeps the columns of each view under its stateKey
const ProductList = (props: IProductListProps) => {
    const products = React.useMemo(createProductsProvider, [])
    const loadCommands = async (): Promise<IRibbonCommand[]> => [
        { id: 'reopen', label: 'Reopen the list', iconName: 'Refresh', onExecute: props.onReopen },
    ]

    return <DatasetControl stateKey='product-list' onLoad={async () => ({ provider: products })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.Ribbon onLoad={loadCommands} />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid modules={[createClientSideRowModelModule()]} height='420px' />
        </DatasetControl.Body>
    </DatasetControl>
}

const GridExample = () => {
    const [visit, setVisit] = React.useState(0)
    return <ProductList key={visit} onReopen={() => setVisit(visit + 1)} />
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

export const RememberLayoutExample = () => <GridExampleRunner seedCode={REMEMBER_LAYOUT_CODE} tabs={['preview', 'code']} />
