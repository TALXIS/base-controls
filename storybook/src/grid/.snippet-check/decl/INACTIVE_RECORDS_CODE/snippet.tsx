const inactiveWonDealsModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('locks').registerLockHook((result, { record, columnName }) => {
            //a record's row: no column is given
            if (record && !columnName && Number(record.getValue('stage')) === 4) {
                result.isLocked = true
            }
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [inactiveWonDealsModule] }}
    enableEditing
    height='440px' />
