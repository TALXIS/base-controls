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
                colDef.hide = !showEveryColumn && DETAIL_COLUMNS.includes(colDef.colId!)
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
            <ClientSideGrid
                //a new key makes the grid build its columns again
                key={String(showEveryColumn)}
                onSetup={onSetup}
                height='420px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const PRODUCT_LINK_CODE = `const FIELDS = ['name', 'sku', 'category', 'price', 'instock', 'supplier']

const GridExample = () => {
    const [product, setProduct] = React.useState<IRecord>()

    const onSetup = (grid: IGrid) => {
        grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
            const name = columnDefs.find(colDef => colDef.colId === 'name')!
            //spread, so the grid's own context keys stay
            name.context = { ...name.context, isPrimary: true }
        })
        grid.hooks.openRecord.add(request => {
            //a handled request is not passed on to the provider
            request.isHandled = true
            setProduct(request.record)
        })
    }

    return <>
        <DatasetControl onLoad={async () => ({ provider: provider })}>
            <DatasetControl.Body>
                <ClientSideGrid onSetup={onSetup} height='420px' />
            </DatasetControl.Body>
        </DatasetControl>
        <Panel isOpen={!!product} headerText={product?.getFormattedValue('name') ?? ''} isLightDismiss onDismiss={() => setProduct(undefined)}>
            {product && <Form.Root key={product.getRecordId()} onLoad={async () => ({ record: product })}>
                <Form.Section cellLabelPosition='Top'>
                    {FIELDS.map(columnName => <Form.Field key={columnName} name={columnName}>
                        <Form.Cell><Form.Control /></Form.Cell>
                    </Form.Field>)}
                </Form.Section>
            </Form.Root>}
        </Panel>
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
        <ClientSideGrid modules={[createEditingModule()]}
            onSetup={onSetup}
            height='440px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const ROW_COMMANDS_CODE = `const isLowStock = (product: IRecord) => Number(product.getValue('instock') ?? 0) < Number(product.getValue('reorderlevel') ?? 0)
const isDiscontinued = (product: IRecord) => product.getValue('discontinued') === '1'

const GridExample = () => {
    const [status, setStatus] = React.useState('')

    const onSetup = (grid: IGrid) => {
        grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
            columnDefs.push({ colId: 'actions', headerName: '', pinned: 'right', initialWidth: 96 })
        })
        grid.services.get('cells').hooks.commands.add((result, { record, columnName }) => {
            if (columnName !== 'actions') {
                return
            }
            if (isLowStock(record) && !isDiscontinued(record)) {
                result.items.push({ key: 'reorder', text: 'Reorder', iconOnly: true, iconProps: { iconName: 'ShoppingCart' }, onClick: () => setStatus('Ordered ' + record.getValue('reorderlevel') + ' more of ' + record.getFormattedValue('name') + '.') })
            }
            result.overflowItems.push({ key: 'copySku', text: 'Copy SKU', iconProps: { iconName: 'Copy' }, onClick: () => { navigator.clipboard.writeText(record.getFormattedValue('sku') ?? '') } })
            if (!isDiscontinued(record)) {
                //the field saves the product while auto-save is on
                result.overflowItems.push({ key: 'discontinue', text: 'Discontinue', iconProps: { iconName: 'Blocked' }, onClick: () => { grid.services.get('fields').get(record, 'discontinued').setValue(true) } })
            }
        })
    }

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        {status && <MessageBar onDismiss={() => setStatus('')}>{status}</MessageBar>}
        <DatasetControl.Body>
            <ClientSideGrid modules={[createEditingModule({ enableAutoSave: true })]}
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
    badge: { minWidth: 18, padding: '0 5px', borderRadius: 9, backgroundColor: '#a4262c', color: '#ffffff', fontSize: 11, lineHeight: '18px', textAlign: 'center' },
})

const filterInStock = (filter?: typeof QUICK_FILTERS[number]) => {
    provider.setFiltering(filter ? { filterOperator: Type.And.Value, conditions: [{ attributeName: 'instock', conditionOperator: filter.operator.Value, value: filter.value }] } : null)
    provider.refresh()
}

const onSetup = (grid: IGrid) => {
    const headers = grid.services.get('columns').headers
    //each hook runs for every header
    headers.hooks.adornments.add((adornments, header) => {
        if (header.getColDef().colId !== 'instock') {
            return
        }
        const lowStock = provider.getRecords().filter(isLowStock).length
        if (lowStock > 0) {
            adornments.push({ key: 'lowStock', placement: 'suffix', title: lowStock + ' below reorder level', onRender: () => <span className={styles.badge}>{lowStock}</span> })
        }
    })
    headers.hooks.menuSections.add((sections, header) => {
        if (header.getColDef().colId !== 'instock') {
            return
        }
        sections.push({
            key: 'quickFilters',
            title: 'Quick filters',
            items: [
                ...QUICK_FILTERS.map(filter => ({ key: filter.key, text: filter.text, iconProps: { iconName: filter.iconName }, onClick: () => filterInStock(filter) })),
                { key: 'showAll', text: 'Show all products', iconProps: { iconName: 'ClearFilter' }, onClick: () => filterInStock() },
            ],
        })
    })
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid onSetup={onSetup} height='440px' />
    </DatasetControl.Body>
</DatasetControl>
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
        <ClientSideGrid
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
        <ClientSideGrid
            onSetup={onSetup}
            height='480px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const REMEMBER_LAYOUT_CODE = `const GridExample = () => {
    const [visit, setVisit] = React.useState(0)
    const loadCommands = async (): Promise<IRibbonCommand[]> => [
        { id: 'reopen', label: 'Reopen the list', iconName: 'Refresh', onExecute: () => setVisit(count => count + 1) },
    ]

    //the control keeps the columns of each view under its stateKey
    return <DatasetControl key={visit} stateKey='product-list' onLoad={async () => ({ provider: createProductsProvider() })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.Ribbon onLoad={loadCommands} />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <ClientSideGrid height='420px' />
        </DatasetControl.Body>
    </DatasetControl>
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
