import type { IGridExampleFile } from '../../grid/GridLivePreview'

/** Three views of the deals, one of them a report, each resolving the columns it shows as it opens. */
export const VIEWS_FILE: IGridExampleFile = {
    name: 'views.ts',
    code: `/** What a view keeps beside its columns, for onLoad. */
export interface IDealViewData {
    sorting?: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[]
    filtering?: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression | null
    searchQuery?: string
}

//the deal name is what quick find searches
const DEALS = DEAL_COLUMNS.map(column => ({ ...column, isPrimary: column.name === 'name' }))
const getDealColumn = (name: string) => DEALS.find(column => column.name === name)!

//the deal columns a view shows, in the order it shows them
const columns = (...names: string[]) => names.map((name, order) => ({ ...getDealColumn(name), order }))
//what a view filters by without showing it
const hidden = (...names: string[]) => names.map(name => ({ ...getDealColumn(name), isHidden: true }))

//listed by name; what a view shows is resolved only when it is opened
const VIEWS: IDatasetControlView<IDealViewData>[] = [
    { id: 'all', name: 'All deals', resolve: () => ({ columns: columns('name', 'owner', 'stage', 'value', 'probability', 'closedate') }) },
    { id: 'won', name: 'Won deals', resolve: () => ({ columns: [...columns('name', 'owner', 'value', 'closedate'), ...hidden('stage')], data: { filtering: { filterOperator: Type.And.Value, conditions: [{ attributeName: 'stage', conditionOperator: Operators.Equal.Value, value: '4' }] } } }) },
    //sortDirection 1 is descending
    { id: 'biggest', name: 'Biggest deals', group: { id: 'reports', name: 'Reports' }, resolve: () => ({ columns: columns('name', 'value', 'stage'), data: { sorting: [{ name: 'value', sortDirection: 1 }] } }) },
]

//offers every deal column to Edit columns and user views, not only the ones a view shows
class DealsProvider extends MemoryDataProvider {
    public async onGetAvailableColumns() {
        return DEALS
    }
}

const createDealsProvider = () => new DealsProvider({
    dataSource: DEAL_ROWS.map(row => ({ ...row })),
    metadata: { PrimaryIdAttribute: DEAL_PRIMARY_ID, PrimaryNameAttribute: 'name', LogicalName: 'docs_deal', EntitySetName: 'docs_deals' },
})

//the control sets the view's columns; the rest of the view is set up here
export const loadDeals = async ({ view }: IDatasetControlLoadParameters<IDealViewData>): Promise<IDatasetControlLoadResult> => {
    //stands in for fetching the metadata from a server
    await new Promise(resolve => setTimeout(resolve, 800))
    //a new provider on every load: a view switch or reload mounts everything anew
    const provider = createDealsProvider()
    //what the view carries besides its columns
    const { data = {} } = view ? await view.resolve(provider) : {}
    provider.setSorting(data.sorting ?? [])
    provider.setFiltering(data.filtering ?? null)
    provider.setSearchQuery(data.searchQuery)
    return { provider }
}

/** Saves the sorting, filter and search with every user view; pass it as the control's onMounted. */
export const saveDealViewData = (control: IDatasetControl<IDealViewData>) => {
    const provider = () => control.getProvider()!
    control.modules.observe('userQueries', userQueries => {
        userQueries.saveWithView('sorting', () => provider().getSorting())
        userQueries.saveWithView('filtering', () => provider().getFiltering())
        userQueries.saveWithView('searchQuery', () => provider().getSearchQuery())
    })
}

//the views to switch between
export const loadDealViews = async (): Promise<IDatasetControlView<IDealViewData>[]> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    return VIEWS
}
`,
}

/** The products as photo cards that select on click or from the keyboard, scrolled back where they were per view. */
export const PRODUCT_GALLERY_FILE: IGridExampleFile = {
    name: 'ProductGallery.tsx',
    code: `const getGalleryStyles = (theme: ITheme) => mergeStyleSets({
    gallery: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', alignContent: 'start', gap: 12, padding: '4px 4px 12px', height: '100%', overflow: 'auto', boxSizing: 'border-box' },
    item: { cursor: 'pointer', ':focus-visible': { outline: \`2px solid \${theme.semanticColors.focusBorder}\`, outlineOffset: 2 } },
    card: { maxWidth: 'none', minWidth: 0 },
    selectedCard: { outline: \`2px solid \${theme.palette.themePrimary}\`, outlineOffset: -2 },
})

//the products as a gallery; a click, Enter or Space selects a card
export const ProductGallery = () => {
    const provider = useDataProviderEvents(['onNewDataLoaded', 'onRecordsSelected', 'onRecordColumnValueChanged'])
    const theme = useTheme()
    const styles = React.useMemo(() => getGalleryStyles(theme), [theme])
    //per view inside the DatasetControl, so each view comes back scrolled where it was
    const store = useControlStateStore('gallery')
    const galleryRef = React.useRef<HTMLDivElement>(null)

    React.useLayoutEffect(() => {
        galleryRef.current!.scrollTop = store.get<number>('scrollTop') ?? 0
    }, [])

    const selectedIds = provider.getSelectedRecordIds()
    const toggle = (id: string) => provider.setSelectedRecordIds(selectedIds.includes(id) ? selectedIds.filter(selectedId => selectedId !== id) : [...selectedIds, id])

    const onKeyDown = (event: { key: string, preventDefault: () => void }, id: string) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            toggle(id)
        }
    }

    return <div ref={galleryRef} role='group' aria-label='Products' className={styles.gallery} onScroll={event => store.set('scrollTop', event.currentTarget.scrollTop)}>
        {provider.getRecords().map(product => {
            const id = product.getRecordId()
            const isSelected = selectedIds.includes(id)
            const photo = product.getValue('photo')
            const inStock = product.getValue('instock')
            return <div key={id} role='checkbox' aria-checked={isSelected} aria-label={product.getFormattedValue('name')} tabIndex={0} className={styles.item} onClick={() => toggle(id)} onKeyDown={event => onKeyDown(event, id)}>
                <DocumentCard className={isSelected ? \`\${styles.card} \${styles.selectedCard}\` : styles.card}>
                    <DocumentCardImage height={160} imageFit={ImageFit.cover} imageSrc={photo?.fileUrl ?? photo?.thumbnailUrl} />
                    <DocumentCardDetails>
                        <DocumentCardTitle title={product.getFormattedValue('name')} shouldTruncate />
                        <DocumentCardTitle title={\`\${product.getFormattedValue('price')} · \${inStock > 0 ? \`\${inStock} in stock\` : 'Out of stock'}\`} showAsSecondaryTitle />
                    </DocumentCardDetails>
                </DocumentCard>
            </div>
        })}
    </div>
}
`,
}

/** The commands of a sales pipeline, which change with what is selected. */
export const RIBBON_FILE: IGridExampleFile = {
    name: 'DealsRibbon.tsx',
    code: `const WON_STAGE = 4

//DatasetControl.Ribbon calls onLoad again on every selection
export const DealsRibbon = (props: { enableSave?: boolean; enableDiscard?: boolean; enableRefresh?: boolean }) => {
    const provider = useDataProvider()
    const control = useDatasetControl()

    const setStage = async (recordIds: string[], stage: number) => {
        //stands in for a server call, during which the button is disabled
        await new Promise(resolve => setTimeout(resolve, 1500))
        recordIds.forEach(id => provider.getRecordsMap()[id].setValue('stage', stage))
        //the selection is the same, but which buttons apply to it is not
        control.parts.get('ribbon').reload()
    }

    const onLoad = async (): Promise<IRibbonCommand[]> => {
        const selectedIds = provider.getSelectedRecordIds()
        const commands: IRibbonCommand[] = []
        if (selectedIds.length === 0) {
            return commands
        }
        const openIds = selectedIds.filter(id => provider.getRecordsMap()[id].getValue('stage') !== WON_STAGE)
        if (openIds.length > 0) {
            commands.push({ id: 'markWon', label: \`Mark \${openIds.length} as won\`, iconName: 'Trophy2', onExecute: () => setStage(openIds, WON_STAGE) })
        }
        if (openIds.length < selectedIds.length) {
            commands.push({ id: 'reopen', label: 'Reopen', iconName: 'Undo', onExecute: () => setStage(selectedIds.filter(id => !openIds.includes(id)), 1) })
        }
        if (selectedIds.length === 1) {
            const name = provider.getRecordsMap()[selectedIds[0]].getValue('name')
            commands.push({ id: 'copyName', label: 'Copy name', iconName: 'Copy', tooltip: name, onExecute: () => navigator.clipboard.writeText(name) })
        }
        commands.push({ id: 'clearSelection', label: 'Clear selection', iconName: 'Clear', onExecute: () => provider.clearSelectedRecordIds() })
        return commands
    }

    return <DatasetControl.Ribbon {...props} onLoad={onLoad} />
}
`,
}

/** The example's own file, with the shared ones it imports. */
export const withFiles = (code: string, ...files: IGridExampleFile[]): IGridExampleFile[] => [{ name: 'GridExample.tsx', code }, ...files]
