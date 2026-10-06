import React from 'react'
import { Operators, Type } from '@talxis/client-libraries'
import { GridExampleRunner } from '../GridExampleRunner'
import { createProductsProvider } from '../data'

export const STARRED_PRODUCTS_CODE = `const styles = mergeStyleSets({
    star: { color: '#8a8886' },
    starred: { color: '#c19c00' },
})

const Star = (props: ICheckboxProps) => <IconButton
    iconProps={{ iconName: props.checked ? 'FavoriteStarFill' : 'FavoriteStar' }}
    className={props.checked ? styles.starred : styles.star}
    title={props.ariaLabel}
    onClick={event => props.onChange?.(event as React.MouseEvent<HTMLElement>, !props.checked)} />

const COMPONENTS: IGridRowSelectionComponents = {
    cell: { checkbox: { onRenderCheckbox: props => <Star {...props} /> } },
}

const GridExample = () => {
    const [starred, setStarred] = React.useState<string[]>([])

    return <Stack tokens={{ childrenGap: 8 }}>
        <MessageBar>{starred.length ? starred.length + ' products starred for the next order.' : 'Star the products to order next.'}</MessageBar>
        <Grid.Root
            provider={provider}
            modules={{
                rowModel: createClientSideRowModelModule(),
                rowSelection: createRowSelectionModule({ mode: 'multiple', onSelectionChanged: setStarred, components: COMPONENTS }),
            }}
            height='400px' />
    </Stack>
}
`

export const SORT_ARROWS_CODE = `const styles = mergeStyleSets({
    arrow: { color: '#0078d4' },
})

const COMPONENTS: IGridSortingComponents = {
    sortIcon: { onRenderIcon: ({ descending, ...props }) => <Icon {...props} iconName={descending ? 'SortDown' : 'SortUp'} className={styles.arrow} /> },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), sorting: createSortingModule({ components: COMPONENTS }) }}
    height='440px' />
`

export const FILTER_ICON_CODE = `const styles = mergeStyleSets({
    icon: { color: '#0078d4' },
    title: { display: 'flex', alignItems: 'center', gap: 8 },
})

const COMPONENTS: IGridFilteringComponents = {
    filterIcon: { onRenderIcon: props => <Icon {...props} iconName='FilterSolid' className={styles.icon} /> },
    filterCallout: {
        onRenderTitle: props => <div className={styles.title}>
            <Icon iconName='Filter' className={styles.icon} />
            <Text {...props}>Show products by {props.children}</Text>
        </div>,
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), filtering: createFilteringModule({ components: COMPONENTS }) }}
    height='440px' />
`

export const GROUP_BADGES_CODE = `const styles = mergeStyleSets({
    icon: { color: '#0078d4' },
    count: { marginLeft: 4, padding: '0 8px', borderRadius: 10, background: '#edebe9', fontSize: 12, lineHeight: '18px' },
})

//the part is handed the count as text in brackets
const ProductCount = (props: { className?: string }) => {
    const cell = useGridCell()
    const count = useGridService('grouping')?.getGroupedCount(cell.getRecord(), cell.getColumnName())
    return <span className={props.className}><span className={styles.count}>{count}</span></span>
}

const COMPONENTS: IGridGroupingComponents = {
    groupingIcon: { onRenderIcon: props => <Icon {...props} className={styles.icon} /> },
    groupCell: { count: { onRenderCount: props => <ProductCount className={props.className} /> } },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), grouping: createGroupingModule({ defaultExpandedLevel: 0, components: COMPONENTS }) }}
    height='460px' />
`

export const STOCK_TOTALS_CODE = `const styles = mergeStyleSets({
    label: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.7 },
    value: { fontWeight: 700, color: '#0078d4' },
})

const COMPONENTS: IGridAggregationComponents = {
    totalCell: {
        totalValue: {
            onRenderLabel: props => <span {...props} className={styles.label} />,
            onRenderValue: props => <span {...props} className={styles.value} />,
        },
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), aggregation: createAggregationModule({ components: COMPONENTS }) }}
    height='460px' />
`

const createSortedProducts = () => {
    const provider = createProductsProvider()
    provider.setSorting([{ name: 'price', sortDirection: 1 }])
    provider.refresh()
    return provider
}

const createLowStockProducts = () => {
    const provider = createProductsProvider()
    provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'instock', conditionOperator: Operators.LessThan.Value, value: '10' }] })
    provider.refresh()
    return provider
}

const createProductsByCategory = () => {
    const provider = createProductsProvider()
    provider.grouping.addGroupBy({ columnName: 'category', alias: 'category_group' })
    provider.refresh()
    return provider
}

const createStockTotals = () => {
    const provider = createProductsProvider()
    provider.aggregation.addAggregation({ columnName: 'instock', alias: 'instock_sum', aggregationFunction: 'sum' })
    provider.aggregation.addAggregation({ columnName: 'price', alias: 'price_avg', aggregationFunction: 'avg' })
    provider.refresh()
    return provider
}

export const StarredProductsExample = () => <GridExampleRunner seedCode={STARRED_PRODUCTS_CODE} dataset='products' />

export const SortArrowsExample = () => <GridExampleRunner seedCode={SORT_ARROWS_CODE} onCreateProvider={createSortedProducts} />

export const FilterIconExample = () => <GridExampleRunner seedCode={FILTER_ICON_CODE} onCreateProvider={createLowStockProducts} />

export const GroupBadgesExample = () => <GridExampleRunner seedCode={GROUP_BADGES_CODE} onCreateProvider={createProductsByCategory} />

export const StockTotalsExample = () => <GridExampleRunner seedCode={STOCK_TOTALS_CODE} onCreateProvider={createStockTotals} />
