const lockWonDealsModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('locks').registerLockHook((result, { record, columnName }) => {
            //a cell: both are given
            if (record && columnName && Number(record.getValue('stage')) === 4) {
                result.isLocked = true
            }
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [lockWonDealsModule] }}
    enableEditing
    height='440px' />
