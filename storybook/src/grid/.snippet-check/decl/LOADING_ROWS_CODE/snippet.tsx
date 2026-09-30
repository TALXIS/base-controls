//a datasource that never answers keeps the rows loading
const neverLoadModule: IGridModule = {
    onRegister: runtime => {
        runtime.registerAgGridOptions(result => {
            result.options.serverSideDatasource = { getRows: () => { } }
        }, 1000)
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createServerSideRowModelModule(), custom: [neverLoadModule] }}
    components={{
        rowLoading: {
            onRenderShimmer: () => <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: '100%', padding: '0 12px', color: '#605e5c' }}>
                <Icon iconName='Sync' /> Loading deals...
            </div>,
        },
    }}
    height='320px' />
