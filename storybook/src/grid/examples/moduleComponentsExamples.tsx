import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const STARRED_PRODUCTS_CODE = `//the container around it takes the click and toggles the row
const STAR: ISelectionCellComponents = {
    checkbox: {
        onRenderCheckbox: props => <Icon iconName={props.checked ? 'FavoriteStarFill' : 'FavoriteStar'} />,
    },
}

const onSetup = (grid: IGrid) => {
    //runs after every built-in module, so the checkbox column is there
    grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
        const checkbox = columnDefs.find(colDef => colDef.colId === SELECTION_COLUMN_KEY)!
        checkbox.cellRendererParams = { ...checkbox.cellRendererParams, components: STAR }
    }, GRID_MODULE_PRIORITY.clipboard + 1)
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' })]}
            onSetup={onSetup}
            height='400px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const SORT_ARROWS_CODE = `const styles = mergeStyleSets({
    arrow: { color: '#0078d4' },
})

const COMPONENTS: IGridSortingComponents = {
    sortIcon: { onRenderIcon: ({ descending, ...props }) => <Icon {...props} iconName={descending ? 'SortDown' : 'SortUp'} className={styles.arrow} /> },
}

//opens sorted by price
const createPriceList = () => {
    const products = createProductsProvider()
    products.setSorting([{ name: 'price', sortDirection: 1 }])
    return products
}

const GridExample = () => {
    const products = React.useMemo(createPriceList, [])

    return <DatasetControl onLoad={async () => ({ provider: products })}>
        <DatasetControl.Body>
            <ClientSideGrid modules={[createSortingModule({ components: COMPONENTS })]}
                height='440px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const FILTER_ICON_CODE = `const styles = mergeStyleSets({
    icon: { color: '#0078d4' },
})

const COMPONENTS: IGridFilteringComponents = {
    filterIcon: { onRenderIcon: props => <Icon {...props} iconName='FilterSolid' className={styles.icon} /> },
    filterCallout: {
        onRenderTitle: props => <Text {...props}>Show products by {props.children}</Text>,
    },
}

//opens filtered to low stock
const createLowStockList = () => {
    const products = createProductsProvider()
    products.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'instock', conditionOperator: Operators.LessThan.Value, value: '10' }] })
    return products
}

const GridExample = () => {
    const products = React.useMemo(createLowStockList, [])

    return <DatasetControl onLoad={async () => ({ provider: products })}>
        <DatasetControl.Body>
            <ClientSideGrid modules={[createFilteringModule({ components: COMPONENTS })]}
                height='440px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const GROUP_BADGES_CODE = `const getStyles = (theme: ITheme) => mergeStyleSets({
    icon: { color: theme.palette.themePrimary },
    count: { marginLeft: 4, padding: '0 8px', borderRadius: 10, background: theme.palette.neutralLighter, color: theme.semanticColors.bodyText, fontSize: 12, lineHeight: '18px' },
})

const useStyles = () => {
    const theme = useTheme()
    return React.useMemo(() => getStyles(theme), [theme])
}

const GroupingIcon = (props: IIconProps) => <Icon {...props} className={useStyles().icon} />

//the part is handed the count as text in brackets
const ProductCount = (props: { className?: string }) => {
    const styles = useStyles()
    const cell = useGridCell()
    const count = useGridModule('grouping').getGroupedCount(cell.getRecord(), cell.getColumnName())
    return <span className={props.className}><span className={styles.count}>{count}</span></span>
}

const COMPONENTS: IGridGroupingComponents = {
    groupingIcon: { onRenderIcon: props => <GroupingIcon {...props} /> },
    groupCell: { count: { onRenderCount: props => <ProductCount className={props.className} /> } },
}

const createProductsByCategory = () => {
    const products = createProductsProvider()
    products.grouping.addGroupBy({ columnName: 'category', alias: 'category_group' })
    return products
}

const GridExample = () => {
    const products = React.useMemo(createProductsByCategory, [])

    return <DatasetControl onLoad={async () => ({ provider: products })}>
        <DatasetControl.Body>
            <ClientSideGrid modules={[createGroupingModule({ components: COMPONENTS })]}
                height='460px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const STOCK_TOTALS_CODE = `const getStyles = (theme: ITheme) => mergeStyleSets({
    label: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: theme.semanticColors.bodySubtext },
    value: { fontWeight: 700, color: theme.palette.themePrimary },
    stock: { fontWeight: 700, color: theme.semanticColors.successIcon },
})

const useStyles = () => {
    const theme = useTheme()
    return React.useMemo(() => getStyles(theme), [theme])
}

const TotalLabel: IAggregationUiTotalValueComponents['onRenderLabel'] = props => <span {...props} className={useStyles().label} />
const TotalValue: IAggregationUiTotalValueComponents['onRenderValue'] = props => <span {...props} className={useStyles().value} />
const StockValue: IAggregationUiTotalValueComponents['onRenderValue'] = props => <span {...props} className={useStyles().stock} />

const COMPONENTS: IGridAggregationComponents = {
    totalCell: {
        totalValue: {
            onRenderLabel: props => <TotalLabel {...props} />,
            onRenderValue: props => <TotalValue {...props} />,
        },
    },
}

//merged over the module's totalCell key by key
const STOCK_TOTAL: ITotalCellComponents = {
    totalValue: { onRenderValue: props => <StockValue {...props} /> },
}

const StockTotalCell = (props: IGridCellParams) => <TotalCell {...props} components={STOCK_TOTAL} />

const createStockTotals = () => {
    const products = createProductsProvider()
    products.aggregation.addAggregation({ columnName: 'instock', alias: 'instock_sum', aggregationFunction: 'sum' })
    products.aggregation.addAggregation({ columnName: 'price', alias: 'price_avg', aggregationFunction: 'avg' })
    return products
}

const onSetup = (grid: IGrid) => {
    //runs after the aggregation module has set the column's own selector
    grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
        //only the pinned totals row draws StockTotalCell
        columnDefs.find(colDef => colDef.colId === 'instock')!.cellRendererSelector = params => params.node.rowPinned ? { component: StockTotalCell } : undefined
    }, GRID_MODULE_PRIORITY.aggregation + 1)
}

const GridExample = () => {
    const products = React.useMemo(createStockTotals, [])

    return <DatasetControl onLoad={async () => ({ provider: products })}>
        <DatasetControl.Body>
            <ClientSideGrid modules={[createAggregationModule({ components: COMPONENTS })]}
                onSetup={onSetup}
                height='460px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const StarredProductsExample = () => <GridExampleRunner seedCode={STARRED_PRODUCTS_CODE} dataset='products' />

export const SortArrowsExample = () => <GridExampleRunner seedCode={SORT_ARROWS_CODE} tabs={['preview', 'code']} />

export const FilterIconExample = () => <GridExampleRunner seedCode={FILTER_ICON_CODE} tabs={['preview', 'code']} />

export const GroupBadgesExample = () => <GridExampleRunner seedCode={GROUP_BADGES_CODE} tabs={['preview', 'code']} />

export const StockTotalsExample = () => <GridExampleRunner seedCode={STOCK_TOTALS_CODE} tabs={['preview', 'code']} />
