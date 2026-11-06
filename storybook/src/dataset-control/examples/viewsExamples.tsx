import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { PRODUCT_GALLERY_FILE, VIEWS_FILE, withFiles } from './shared'

const PROVIDER_VIEWS_CODE = `import { loadDeals } from './views'

const GridExample = () => {
    const modules = React.useMemo(() => [
        createClientSideRowModelModule(),
        createEditingModule({ autoSave: false }),
        createSortingModule(),
        createFilteringModule(),
    ], [])

    return <DatasetControl stateKey='dealViews' onLoad={loadDeals} height='440px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher />
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <DatasetControl.EditColumns />
                <DatasetControl.QuickFind />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid stateKey='grid' modules={modules} />
        </DatasetControl.Body>
    </DatasetControl>
}
`

const CUSTOM_UI_CODE = `import { loadProducts } from './views'
import { ProductsBody } from './ProductsBody'

const GridExample = () => <DatasetControl stateKey='productViews' onLoad={loadProducts} height='560px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ProductsBody />
    </DatasetControl.Body>
    <DatasetControl.Footer>
        <DatasetControl.Footer.End>
            <DatasetControl.Pagination />
        </DatasetControl.Footer.End>
    </DatasetControl.Footer>
</DatasetControl>
`

const PRODUCT_VIEWS_FILE: IGridExampleFile = {
    name: 'views.ts',
    code: `/** How a view draws the products. */
export type ProductUi = 'grid' | 'datagrid' | 'gallery'

const TABLES = { id: 'tables', name: 'Tables' }
const GALLERIES = { id: 'galleries', name: 'Galleries' }

/** What a view keeps for the body: the UI it is drawn with. */
export interface IProductViewData {
    ui: ProductUi
}

//the product name is what the quick find searches
const COLUMNS = createProductsProvider().getColumns().map(column => ({ ...column, isPrimary: column.name === 'name' }))

//a gallery of one category, filtered as it opens
const categoryGallery = (id: string, name: string, category: number): IDatasetControlView<IProductViewData> => ({
    id,
    name,
    group: GALLERIES,
    resolve: provider => {
        provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'category', conditionOperator: Operators.Equal.Value, value: \`\${category}\` }] })
        return { columns: COLUMNS, data: { ui: 'gallery' } }
    },
})

const VIEWS: IDatasetControlView<IProductViewData>[] = [
    { id: 'all', name: 'All products', group: TABLES, resolve: () => ({ columns: COLUMNS, data: { ui: 'grid' } }) },
    { id: 'priceList', name: 'Price list', group: TABLES, resolve: () => ({ columns: COLUMNS, data: { ui: 'datagrid' } }) },
    categoryGallery('seating', 'Seating', 2),
    categoryGallery('lighting', 'Lighting', 3),
]

export const loadProducts = async (): Promise<IDatasetControlLoadResult<IProductViewData>> => ({ provider: createProductsProvider(), views: VIEWS })
`,
}

const PRODUCTS_BODY_FILE: IGridExampleFile = {
    name: 'ProductsBody.tsx',
    code: `import { IProductViewData, ProductUi } from './views'
import { ProductDataGrid } from './ProductDataGrid'
import { ProductGallery } from './ProductGallery'

const ProductGrid = () => <Grid stateKey='grid' modules={[createClientSideRowModelModule(), createRowSelectionModule({ mode: 'multiple' })]} />

const UIS: { [ui in ProductUi]: () => JSX.Element } = {
    grid: ProductGrid,
    datagrid: ProductDataGrid,
    gallery: ProductGallery,
}

//the control mounts anew for every view, so the view's UI is picked once
export const ProductsBody = () => {
    const control = useDatasetControl<IProductViewData>()
    const Ui = UIS[control.getView()?.data?.ui ?? 'grid']

    //what shows instead of the UI when nothing matches
    return <DatasetControl.EmptyState>
        <Ui />
    </DatasetControl.EmptyState>
}
`,
}

const PRODUCT_DATA_GRID_FILE: IGridExampleFile = {
    name: 'ProductDataGrid.tsx',
    code: `import { createTableColumn, DataGrid, DataGridBody, DataGridCell, DataGridHeader, DataGridHeaderCell, DataGridRow, FluentProvider, TableCellLayout, webDarkTheme, webLightTheme } from '@fluentui/react-components'

const columns = [
    createTableColumn({
        columnId: 'name',
        renderHeaderCell: () => 'Product',
        renderCell: (product: IRecord) => <TableCellLayout media={<img src={product.getValue('photo')?.thumbnailUrl} alt='' width={32} height={32} style={{ borderRadius: 4, objectFit: 'cover' }} />}>{product.getFormattedValue('name')}</TableCellLayout>,
    }),
    createTableColumn({ columnId: 'category', renderHeaderCell: () => 'Category', renderCell: (product: IRecord) => product.getFormattedValue('category') }),
    createTableColumn({ columnId: 'price', renderHeaderCell: () => 'Price', renderCell: (product: IRecord) => product.getFormattedValue('price') }),
    createTableColumn({ columnId: 'instock', renderHeaderCell: () => 'In stock', renderCell: (product: IRecord) => product.getFormattedValue('instock') }),
]

//the products in Fluent UI v9's DataGrid, sharing the provider's records and selection
export const ProductDataGrid = () => {
    const provider = useDataProviderEvents(['onNewDataLoaded', 'onRecordsSelected', 'onRecordColumnValueChanged'])
    const isLight = isLightColor(useTheme().semanticColors.bodyBackground)

    return <FluentProvider theme={isLight ? webLightTheme : webDarkTheme} style={{ height: '100%', overflow: 'auto', background: 'transparent' }}>
        <DataGrid
            items={provider.getRecords()}
            columns={columns}
            getRowId={(product: IRecord) => product.getRecordId()}
            selectionMode='multiselect'
            selectedItems={new Set(provider.getSelectedRecordIds())}
            onSelectionChange={(_, data) => provider.setSelectedRecordIds([...data.selectedItems] as string[])}>
            <DataGridHeader>
                <DataGridRow>
                    {({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}
                </DataGridRow>
            </DataGridHeader>
            <DataGridBody>
                {({ item, rowId }) => <DataGridRow key={rowId}>
                    {({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}
                </DataGridRow>}
            </DataGridBody>
        </DataGrid>
    </FluentProvider>
}
`,
}

export const ProviderViewsExample = () => <GridExampleRunner seedCode={withFiles(PROVIDER_VIEWS_CODE, VIEWS_FILE)} tabs={['preview', 'code']} />
export const CustomUiViewsExample = () => <GridExampleRunner seedCode={withFiles(CUSTOM_UI_CODE, PRODUCT_VIEWS_FILE, PRODUCTS_BODY_FILE, PRODUCT_DATA_GRID_FILE, PRODUCT_GALLERY_FILE)} tabs={['preview', 'code']} />
