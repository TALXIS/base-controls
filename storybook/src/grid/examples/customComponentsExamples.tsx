import React from 'react'
import { MemoryDataProvider } from '@talxis/client-libraries'
import { GridExampleRunner } from '../GridExampleRunner'
import { createDocsDataset, createProductsProvider } from '../data'

export const STOCK_BAR_CODE = `const styles = mergeStyleSets({
    stock: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '0 9px' },
    track: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden', background: '#edebe9' },
    count: { minWidth: 24, textAlign: 'right' },
})

const StockBar = () => {
    const product = useGridCell().getRecord()
    const inStock = Number(product.getValue('instock') ?? 0)
    const reorderAt = Number(product.getValue('reorderlevel') ?? 0)
    //a full bar is three times the reorder level
    const fill = Math.min(inStock / Math.max(reorderAt * 3, 1), 1)

    return <div className={styles.stock}>
        <div className={styles.track}>
            <div style={{ width: fill * 100 + '%', height: '100%', background: inStock <= reorderAt ? '#d13438' : '#107c10' }} />
        </div>
        <span className={styles.count}>{inStock}</span>
    </div>
}

const STOCK_COMPONENTS: ICellRendererComponents = {
    control: {
        //a two-options value reads as '1' or '0'
        onRenderControl: (props, defaultRender) => props.parameters.Record.raw.getValue('discontinued') === '1' ? defaultRender(props) : <StockBar />,
    },
}

const StockCell = (props: IGridCellParams) => <Grid.Cell.FieldRenderer {...props} components={STOCK_COMPONENTS} />

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule({ autoSave: true }) }}
    colDefs={{
        instock: { cellRenderer: StockCell, initialWidth: 180 },
    }}
    height='440px' />
`

export const HEADER_CAPTION_CODE = `const CAPTIONS: { [columnName: string]: string } = {
    price: 'USD, excl. VAT',
    instock: 'units',
    reorderlevel: 'units',
}

const styles = mergeStyleSets({
    label: { minWidth: 0 },
    caption: { opacity: 0.75 },
})

const CaptionedLabel = (props: ITextProps) => {
    const header = useGridColumnHeader()

    return <Stack className={styles.label} horizontalAlign={header.getAlignment() === 'right' ? 'end' : 'start'}>
        <Text {...props} />
        <Text variant='small' className={styles.caption}>{CAPTIONS[header.getColDef().colId!]}</Text>
    </Stack>
}

const CAPTIONED_HEADER: IColumnHeaderRendererComponents = {
    label: { onRenderText: props => <CaptionedLabel {...props} /> },
}

const CaptionedHeader = (props: IColumnHeaderRendererProps) => <Grid.ColumnHeader.Renderer {...props} components={CAPTIONED_HEADER} />

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        sorting: createSortingModule(),
    }}
    colDefs={{
        price: { headerComponent: CaptionedHeader },
        instock: { headerComponent: CaptionedHeader },
        reorderlevel: { headerComponent: CaptionedHeader },
    }}
    height='440px' />
`

export const EMPTY_CATALOGUE_CODE = `const COMPONENTS: IGridComponents = {
    emptyRecordsOverlay: {
        onRenderIcon: props => <Icon {...props} iconName='ProductCatalog' />,
        onRenderText: props => <Stack horizontalAlign='center' tokens={{ childrenGap: 4 }}>
            <Text {...props} variant='large' />
            <Text>Import your supplier's price list to start selling.</Text>
        </Stack>,
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    labels={{ noRecordsFound: 'Your catalogue has no products yet.' }}
    components={COMPONENTS}
    height='360px' />
`

export const WAREHOUSE_LOADING_CODE = `const styles = mergeStyleSets({
    card: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: 300, padding: 24, borderRadius: 8, background: '#ffffff', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.14)' },
    truck: { fontSize: 36, color: '#0078d4' },
    progress: { width: '100%' },
})

const COMPONENTS: IGridComponents = {
    loadingOverlay: {
        onRenderContainer: props => <div {...props} className={styles.card} />,
        onRenderSpinner: () => <>
            <Icon iconName='DeliveryTruck' className={styles.truck} />
            <ProgressIndicator className={styles.progress} />
        </>,
    },
}

const GridExample = () => <Stack horizontalAlign='start' tokens={{ childrenGap: 8 }}>
    <DefaultButton iconProps={{ iconName: 'Refresh' }} text='Check stock again' onClick={() => provider.refresh()} />
    <Stack.Item align='stretch'>
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            components={COMPONENTS}
            height='400px' />
    </Stack.Item>
</Stack>
`

export const LOADING_ROWS_CODE = `const styles = mergeStyleSets({
    loadingRow: { display: 'flex', alignItems: 'center', gap: 8, height: '100%', padding: '0 16px' },
})

const COMPONENTS: IGridComponents = {
    rowLoading: {
        onRenderShimmer: () => <div className={styles.loadingRow}>
            <Spinner />
            <span>Fetching this category's products from the warehouse…</span>
        </div>,
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createServerSideRowModelModule(),
        grouping: createGroupingModule(),
    }}
    components={COMPONENTS}
    height='420px' />
`

export const SAVE_STATUS_CODE = `const SaveErrorTitle = (props: ITextProps) => {
    const product = useGridCell().getRecord()
    return <Text {...props}>{product.getFormattedValue('name')}: {props.children}</Text>
}

const COMPONENTS: IGridEditingComponents = {
    recordSaveCell: {
        indicator: {
            onRenderButton: ({ state, ...props }) => <ActionButton {...props} text={state === 'failed' ? 'Not saved' : 'Saved'} />,
        },
        errorCallout: {
            onRenderTitle: props => <SaveErrorTitle {...props} />,
        },
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule({ autoSave: true, components: COMPONENTS }) }}
    colDefs={{
        [RECORD_SAVE_COLUMN_KEY]: { width: 112 },
    }}
    height='440px' />
`

export const MODULE_ICONS_CODE = `const styles = mergeStyleSets({
    icon: { color: '#0078d4' },
    count: { marginLeft: 4, padding: '0 8px', borderRadius: 10, background: '#edebe9', fontSize: 12, lineHeight: '18px' },
})

//the part is handed the count as text in brackets
const ProductCount = (props: { className?: string }) => {
    const cell = useGridCell()
    const count = useGridService('grouping')?.getGroupedCount(cell.getRecord(), cell.getColumnName())
    return <span className={props.className}><span className={styles.count}>{count}</span></span>
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        sorting: createSortingModule({
            components: {
                sortIcon: { onRenderIcon: ({ descending, ...props }) => <Icon {...props} iconName={descending ? 'CaretDownSolid8' : 'CaretUpSolid8'} className={styles.icon} /> },
            },
        }),
        filtering: createFilteringModule({
            components: {
                filterIcon: { onRenderIcon: props => <Icon {...props} iconName='FilterSolid' className={styles.icon} /> },
            },
        }),
        grouping: createGroupingModule({
            defaultExpandedLevel: 0,
            components: {
                groupingIcon: { onRenderIcon: props => <Icon {...props} className={styles.icon} /> },
                groupCell: { count: { onRenderCount: props => <ProductCount className={props.className} /> } },
            },
        }),
    }}
    height='460px' />
`

const WAREHOUSE_DELAY = 2500
const GROUP_DELAY = 2000

//stands in for a warehouse system that takes its time to answer
class WarehouseProductsProvider extends MemoryDataProvider {
    public async getDataAsync(...parameters: Parameters<MemoryDataProvider['getDataAsync']>) {
        const isGroupLoad = !!this.getParentDataProvider()
        if (!isGroupLoad) {
            this.setLoading(true, "Asking the warehouse for today's stock levels…")
        }
        await new Promise(resolve => window.setTimeout(resolve, isGroupLoad ? GROUP_DELAY : WAREHOUSE_DELAY))
        return super.getDataAsync(...parameters)
    }
}

const createWarehouseProvider = (groupByCategory: boolean) => {
    const products = createProductsProvider()
    const provider = new WarehouseProductsProvider({ dataSource: products.getDataSource(), metadata: products.getMetadata() })
    provider.setColumns(products.getColumns())
    provider.getPaging().setPageSize(products.getDataSource().length)
    if (groupByCategory) {
        provider.grouping.addGroupBy({ columnName: 'category', alias: 'category_group' })
    }
    provider.refresh()
    return provider
}

const createEmptyCatalogue = () => {
    const provider = createProductsProvider()
    provider.setDataSource([])
    provider.refresh()
    return provider
}

const PRICE_APPROVAL_LIMIT = 1000
const PRICING_DELAY = 600

//stands in for a pricing service that sends big prices to a manager first
const createPricingProvider = () => {
    const provider = createDocsDataset('products')
    provider.setInterceptor('onRecordSave', async (record, defaultAction) => {
        await new Promise(resolve => window.setTimeout(resolve, PRICING_DELAY))
        if (!record.isDirty('price') || Number(record.getValue('price') ?? 0) <= PRICE_APPROVAL_LIMIT) {
            return defaultAction(record)
        }
        return { recordId: record.getRecordId(), success: false, fields: [], errors: [{ fieldName: 'price', message: "A price over $1,000 needs the category manager's approval." }] }
    })
    return provider
}

const createSortedCatalogue = () => {
    const provider = createProductsProvider()
    provider.grouping.addGroupBy({ columnName: 'category', alias: 'category_group' })
    provider.setSorting([{ name: 'price', sortDirection: 1 }])
    provider.refresh()
    return provider
}

export const StockBarExample = () => <GridExampleRunner seedCode={STOCK_BAR_CODE} dataset='products' />

export const HeaderCaptionExample = () => <GridExampleRunner seedCode={HEADER_CAPTION_CODE} dataset='products' />

export const EmptyCatalogueExample = () => <GridExampleRunner seedCode={EMPTY_CATALOGUE_CODE} onCreateProvider={createEmptyCatalogue} />

export const WarehouseLoadingExample = () => <GridExampleRunner seedCode={WAREHOUSE_LOADING_CODE} onCreateProvider={() => createWarehouseProvider(false)} />

export const LoadingRowsExample = () => <GridExampleRunner seedCode={LOADING_ROWS_CODE} onCreateProvider={() => createWarehouseProvider(true)} />

export const SaveStatusExample = () => <GridExampleRunner seedCode={SAVE_STATUS_CODE} onCreateProvider={createPricingProvider} />

export const ModuleIconsExample = () => <GridExampleRunner seedCode={MODULE_ICONS_CODE} onCreateProvider={createSortedCatalogue} />
