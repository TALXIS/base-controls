const overdueModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('cells').registerCellThemeHook((theme, { record, columnName }) => {
            const closeDate = record.getValue('closedate')
            const isWon = Number(record.getValue('stage')) === 4
            if (columnName !== 'closedate' || !closeDate || isWon || new Date(closeDate) >= new Date()) {
                return
            }
            theme.colors.background = '#fde7e9'
            theme.colors.text = '#a4262c'
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [overdueModule] }}
    height='440px' />
