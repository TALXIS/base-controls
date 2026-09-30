const GridExample = () => {
    const [message, setMessage] = React.useState('Open a column menu.')
    const describeModule = React.useMemo<IGridModule>(() => ({
        onRegister: runtime => {
            runtime.services.get('columns').headers.registerColumnMenuItemsHook((items, header) => {
                items.push({
                    key: 'describe',
                    text: 'Describe this column',
                    iconProps: { iconName: 'Info' },
                    onClick: () => setMessage(header.getName() + ' holds ' + header.getColumn()?.dataType + ' values.'),
                })
            })
        },
    }), [])

    return <Stack tokens={{ childrenGap: 8 }}>
        <MessageBar>{message}</MessageBar>
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule(), sorting: createSortingModule(), custom: [describeModule] }}
            height='440px' />
    </Stack>
}
