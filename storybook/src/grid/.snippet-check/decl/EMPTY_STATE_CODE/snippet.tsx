const GridExample = () => {
    const emptyProvider = React.useMemo(() => {
        const emptyProvider = new MemoryDataProvider({
            dataSource: [],
            metadata: { PrimaryIdAttribute: 'docs_dealid', PrimaryNameAttribute: 'name', LogicalName: 'docs_deal', EntitySetName: 'docs_deals' },
        })
        emptyProvider.setColumns(provider.getColumns())
        emptyProvider.refresh()
        return emptyProvider
    }, [])

    return <Grid.Root
        provider={emptyProvider}
        modules={{ rowModel: createClientSideRowModelModule() }}
        labels={{ noRecordsFound: 'No deals in the pipeline yet.' }}
        components={{
            emptyRecordsOverlay: {
                onRenderIcon: iconProps => <Icon {...iconProps} iconName='Money' style={{ color: '#5B5FC7' }} />,
            },
        }}
        height='320px' />
}
