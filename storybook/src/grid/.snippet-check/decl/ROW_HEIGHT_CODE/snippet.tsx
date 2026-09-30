const compactWonRowsModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('rows').registerRowHeightHook((result, { record }) => {
            if (Number(record.getValue('stage')) === 4) {
                result.height = 30
            }
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [compactWonRowsModule] }}
    height='440px' />
