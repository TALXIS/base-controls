const layoutModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('columns').registerColumnDefinitionsHook(columnDefs => {
            const recurringIndex = columnDefs.findIndex(columnDef => columnDef.colId === 'recurring')
            if (recurringIndex !== -1) {
                columnDefs.splice(recurringIndex, 1)
            }
            const nameColumn = columnDefs.find(columnDef => columnDef.colId === 'name')
            if (nameColumn) {
                nameColumn.pinned = 'left'
            }
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [layoutModule] }}
    height='440px' />
