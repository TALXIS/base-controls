import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { VIEWS_FILE, withFiles } from './shared'

const PROVIDER_VIEWS_CODE = `import { loadDeals } from './views'

const GridExample = () => <DatasetControl onLoad={loadDeals} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid />
    </DatasetControl.Body>
</DatasetControl>
`

const CUSTOM_UI_CODE = `import { ProductGallery } from './ProductGallery'

//the UI a view is drawn with, read through getView().data
interface IProductViewData {
    ui: 'grid' | 'gallery'
}

const VIEWS: IDatasetControlView<IProductViewData>[] = [
    { id: 'all', name: 'All products', resolve: provider => ({ columns: provider.getColumns(), data: { ui: 'grid' } }) },
    {
        id: 'seating',
        name: 'Seating',
        resolve: provider => {
            provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'category', conditionOperator: Operators.Equal.Value, value: '2' }] })
            return { columns: provider.getColumns(), data: { ui: 'gallery' } }
        },
    },
]

const loadProducts = async (): Promise<IDatasetControlLoadResult<IProductViewData>> => ({ provider: createProductsProvider(), views: VIEWS })

//the control mounts anew for every view, so the view's UI is picked once
const ProductsBody = () => {
    const isGallery = useDatasetControl<IProductViewData>().getView()?.data?.ui === 'gallery'
    //what shows instead of the UI when nothing matches
    return <DatasetControl.EmptyState>
        {isGallery ? <ProductGallery /> : <ClientSideGrid />}
    </DatasetControl.EmptyState>
}

const GridExample = () => <DatasetControl onLoad={loadProducts} height='560px'>
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
</DatasetControl>
`

const PRODUCT_GALLERY_FILE: IGridExampleFile = {
    name: 'ProductGallery.tsx',
    code: `const getGalleryStyles = (theme: ITheme) => mergeStyleSets({
    gallery: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', alignContent: 'start', gap: 12, padding: 4, height: '100%', overflow: 'auto', boxSizing: 'border-box' },
    selected: { outline: \`2px solid \${theme.palette.themePrimary}\` },
})

//the products as photo cards; a click selects a card, as selecting a row in the grid does
export const ProductGallery = () => {
    const provider = useDataProviderEvents(['onNewDataLoaded', 'onRecordsSelected'])
    const theme = useTheme()
    const styles = React.useMemo(() => getGalleryStyles(theme), [theme])
    //per view inside the DatasetControl, so the view comes back scrolled where it was
    const store = useControlStateStore('gallery')
    const galleryRef = React.useRef<HTMLDivElement>(null)

    React.useLayoutEffect(() => {
        galleryRef.current!.scrollTop = store.get<number>('scrollTop') ?? 0
    }, [])

    const selectedIds = provider.getSelectedRecordIds()
    const toggle = (id: string) => provider.setSelectedRecordIds(selectedIds.includes(id) ? selectedIds.filter(selectedId => selectedId !== id) : [...selectedIds, id])

    return <div ref={galleryRef} className={styles.gallery} onScroll={event => store.set('scrollTop', event.currentTarget.scrollTop)}>
        {provider.getRecords().map(product => <DocumentCard key={product.getRecordId()} className={selectedIds.includes(product.getRecordId()) ? styles.selected : undefined} onClick={() => toggle(product.getRecordId())}>
            <DocumentCardImage height={160} imageFit={ImageFit.cover} imageSrc={product.getValue('photo')?.fileUrl} />
            <DocumentCardDetails>
                <DocumentCardTitle title={product.getFormattedValue('name')} shouldTruncate />
                <DocumentCardTitle title={product.getFormattedValue('price')} showAsSecondaryTitle />
            </DocumentCardDetails>
        </DocumentCard>)}
    </div>
}
`,
}

export const ProviderViewsExample = () => <GridExampleRunner seedCode={withFiles(PROVIDER_VIEWS_CODE, VIEWS_FILE)} tabs={['preview', 'code']} />
export const CustomUiViewsExample = () => <GridExampleRunner seedCode={withFiles(CUSTOM_UI_CODE, PRODUCT_GALLERY_FILE)} tabs={['preview', 'code']} />
