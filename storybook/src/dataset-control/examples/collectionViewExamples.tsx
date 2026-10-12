import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const GALLERY_CODE = `const VIEWS = [
    { id: 'all', name: 'All products' },
    { id: 'seating', name: 'Seating', category: 2 },
    { id: 'lighting', name: 'Lighting', category: 3 },
]

const loadProducts = async (params: IDatasetControlLoadParameters): Promise<IDatasetControlLoadResult> => {
    const view = VIEWS.find(view => view.id === params.viewId) ?? VIEWS[0]
    const provider = createProductsProvider()
    //the product name is what the quick find searches
    provider.setColumns(provider.getColumns().map(column => ({ ...column, isPrimary: column.name === 'name' })))
    provider.setFiltering(view.category ? { filterOperator: 0, conditions: [{ attributeName: 'category', conditionOperator: 0, value: \`\${view.category}\` }] } : null)
    return { provider, views: VIEWS.map(({ id, name }) => ({ id, name })), viewId: view.id }
}

//orders more of the selected products; the commands follow the selection
const ProductsRibbon = () => {
    const provider = useDataProvider()
    const onLoad = async (): Promise<IRibbonCommand[]> => {
        const selectedIds = provider.getSelectedRecordIds()
        const commands: IRibbonCommand[] = [{ id: 'refresh', label: 'Refresh', iconName: 'Refresh', onExecute: async () => { await provider.refresh() } }]
        if (selectedIds.length > 0) {
            commands.push({ id: 'reorder', label: \`Reorder \${selectedIds.length}\`, iconName: 'ShoppingCart', onExecute: () => selectedIds.forEach(id => {
                const product = provider.getRecordsMap()[id]
                product.setValue('instock', product.getValue('instock') + product.getValue('reorderlevel') * 2)
            }) })
            commands.push({ id: 'clearSelection', label: 'Clear selection', iconName: 'Clear', onExecute: () => provider.clearSelectedRecordIds() })
        }
        return commands
    }
    return <DatasetControl.Ribbon onLoad={onLoad} />
}

const styles = mergeStyleSets({
    gallery: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', alignContent: 'start', gap: 12, paddingBottom: 12, height: '100%', overflow: 'auto', boxSizing: 'border-box' },
    card: { maxWidth: 'none', minWidth: 0 },
    selectedCard: { outline: '2px solid #0f6cbd', outlineOffset: -2 },
})

//shows the products DatasetControl loaded as a gallery; clicking a card selects it
const ProductGallery = () => {
    const provider = useDataProvider()
    //per view inside the DatasetControl, so each view comes back scrolled where it was
    const store = useControlStateStore('gallery')
    const galleryRef = React.useRef<HTMLDivElement>(null)
    const [, setVersion] = React.useState(0)

    React.useLayoutEffect(() => {
        galleryRef.current!.scrollTop = store.get<number>('scrollTop') ?? 0
    }, [])

    React.useEffect(() => {
        const rerender = () => setVersion(version => version + 1)
        provider.addEventListener('onNewDataLoaded', rerender)
        provider.addEventListener('onRecordsSelected', rerender)
        provider.addEventListener('onRecordColumnValueChanged', rerender)
        return () => {
            provider.removeEventListener('onNewDataLoaded', rerender)
            provider.removeEventListener('onRecordsSelected', rerender)
            provider.removeEventListener('onRecordColumnValueChanged', rerender)
        }
    }, [provider])

    const selectedIds = provider.getSelectedRecordIds()
    const toggle = (id: string) => provider.setSelectedRecordIds(selectedIds.includes(id) ? selectedIds.filter(selectedId => selectedId !== id) : [...selectedIds, id])

    return <div ref={galleryRef} className={styles.gallery} onScroll={event => store.set('scrollTop', event.currentTarget.scrollTop)}>
        {provider.getRecords().map(product => {
            const photo = product.getValue('photo')
            const inStock = product.getValue('instock')
            return <DocumentCard
                key={product.getRecordId()}
                className={selectedIds.includes(product.getRecordId()) ? \`\${styles.card} \${styles.selectedCard}\` : styles.card}
                onClick={() => toggle(product.getRecordId())}>
                <DocumentCardImage height={160} imageFit={ImageFit.cover} imageSrc={photo?.fileUrl ?? photo?.thumbnailUrl} />
                <DocumentCardDetails>
                    <DocumentCardTitle title={product.getFormattedValue('name')} shouldTruncate />
                    <DocumentCardTitle title={\`\${product.getFormattedValue('price')} · \${inStock > 0 ? \`\${inStock} in stock\` : 'Out of stock'}\`} showAsSecondaryTitle />
                </DocumentCardDetails>
            </DocumentCard>
        })}
    </div>
}

const GridExample = () => <DatasetControl stateKey='products' onLoad={loadProducts} height='560px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <ProductsRibbon />
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <DatasetControl.EmptyRecords>
            <ProductGallery />
        </DatasetControl.EmptyRecords>
    </DatasetControl.Body>
    <DatasetControl.Footer>
        <DatasetControl.Footer.Start>
            <DatasetControl.PageSizeSwitcher />
        </DatasetControl.Footer.Start>
        <DatasetControl.Footer.End>
            <DatasetControl.Pagination />
        </DatasetControl.Footer.End>
    </DatasetControl.Footer>
</DatasetControl>
`

export const GalleryExample = () => <GridExampleRunner seedCode={GALLERY_CODE} />
