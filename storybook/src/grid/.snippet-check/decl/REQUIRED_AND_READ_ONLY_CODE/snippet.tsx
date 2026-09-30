const GridExample = () => {
    const dealProvider = React.useMemo(() => {
        const dealProvider = createDocsProvider()
        dealProvider.setColumns(dealProvider.getColumns().map(column => {
            switch (column.name) {
                case 'name':
                    return { ...column, metadata: { ...column.metadata, RequiredLevel: 2 } }
                case 'value':
                    return { ...column, metadata: { ...column.metadata, IsValidForUpdate: false } }
                default:
                    return column
            }
        }))
        dealProvider.refresh()
        return dealProvider
    }, [])

    return <Grid.Root
        provider={dealProvider}
        modules={{ rowModel: createClientSideRowModelModule() }}
        enableEditing
        height='440px' />
}
