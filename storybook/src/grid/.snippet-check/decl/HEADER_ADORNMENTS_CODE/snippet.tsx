const currencyModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('columns').headers.registerColumnHeaderAdornmentsHook((adornments, header) => {
            if (header.getColumn()?.name !== 'value') {
                return
            }
            adornments.push({
                key: 'currency',
                placement: 'suffix',
                title: 'in USD',
                onRender: () => <Icon iconName='Money' style={{ color: '#107c10' }} />,
            })
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [currencyModule] }}
    height='440px' />
