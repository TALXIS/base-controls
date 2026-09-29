import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const YOUR_OWN_DATA_CODE = `const createProductProvider = () => {
    const productProvider = new MemoryDataProvider({
        dataSource: [
            { productid: 'desk', name: 'Standing desk', price: 640, instock: true },
            { productid: 'chair', name: 'Office chair', price: 310, instock: true },
            { productid: 'lamp', name: 'Desk lamp', price: 45, instock: false },
            { productid: 'shelf', name: 'Bookshelf', price: 180, instock: true },
        ],
        metadata: {
            PrimaryIdAttribute: 'productid',
            PrimaryNameAttribute: 'name',
            LogicalName: 'product',
            EntitySetName: 'products',
        },
    })
    productProvider.setColumns([
        { name: 'name', displayName: 'Product', dataType: DataTypes.SingleLineText, visualSizeFactor: 220, metadata: { IsValidForGrid: true } },
        { name: 'price', displayName: 'Price', dataType: DataTypes.Currency, visualSizeFactor: 120, metadata: { IsValidForGrid: true } },
        {
            name: 'instock', displayName: 'In stock', dataType: DataTypes.TwoOptions, visualSizeFactor: 100,
            metadata: { IsValidForGrid: true, OptionSet: [{ Value: 0, Label: 'No', Color: '#a4262c' }, { Value: 1, Label: 'Yes', Color: '#107c10' }] },
        },
    ])
    productProvider.refresh()
    return productProvider
}

const GridExample = () => {
    const productProvider = React.useMemo(createProductProvider, [])

    return <Grid.Root
        provider={productProvider}
        modules={{
            rowModel: createClientSideRowModelModule(),
            sorting: createSortingModule(),
        }}
        height='260px' />
}
`

export const REQUIRED_AND_READ_ONLY_CODE = `const GridExample = () => {
    const taskProvider = React.useMemo(() => {
        const taskProvider = createDocsProvider()
        taskProvider.setColumns(taskProvider.getColumns().map(column => {
            switch (column.name) {
                case 'name':
                    return { ...column, metadata: { ...column.metadata, RequiredLevel: 2 } }
                case 'budget':
                    return { ...column, metadata: { ...column.metadata, IsValidForUpdate: false } }
                default:
                    return column
            }
        }))
        taskProvider.refresh()
        return taskProvider
    }, [])

    return <Grid.Root
        provider={taskProvider}
        modules={{ rowModel: createClientSideRowModelModule() }}
        enableEditing
        height='440px' />
}
`

export const YourOwnDataExample = () => <GridExampleRunner seedCode={YOUR_OWN_DATA_CODE} />
export const RequiredAndReadOnlyExample = () => <GridExampleRunner seedCode={REQUIRED_AND_READ_ONLY_CODE} />
