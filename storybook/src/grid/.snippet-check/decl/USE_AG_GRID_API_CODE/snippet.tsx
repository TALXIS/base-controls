const GridExample = () => {
    const runtimeRef = React.useRef<IGridRuntime>()
    const getGridApi = () => runtimeRef.current?.services.find('gridApi')

    return <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal tokens={{ childrenGap: 8 }}>
            <DefaultButton text='Fit columns to their content' onClick={() => getGridApi()?.autoSizeAllColumns()} />
            <DefaultButton text='Scroll to the last row' onClick={() => {
                const gridApi = getGridApi()
                gridApi?.ensureIndexVisible(gridApi.getDisplayedRowCount() - 1, 'bottom')
            }} />
        </Stack>
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            onGridReady={runtime => { runtimeRef.current = runtime }}
            height='400px' />
    </Stack>
}
