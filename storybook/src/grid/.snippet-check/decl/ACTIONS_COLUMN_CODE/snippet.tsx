const GridExample = () => {
    const [log, setLog] = React.useState('Hover a row to see what it offers.')

    return <Stack tokens={{ childrenGap: 8 }}>
        <MessageBar>{log}</MessageBar>
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            colDefs={{
                actions: {
                    headerName: '',
                    pinned: 'right',
                    initialWidth: 130,
                    sortable: false,
                    valueGetter: () => null,
                    settings: {
                        cell: {
                            onGetCommands: (result, { record }) => {
                                result.items.push(
                                    { key: 'open', title: 'Open', iconProps: { iconName: 'OpenInNewWindow' }, onClick: () => setLog('Opened ' + record.getFormattedValue('name')) },
                                    { key: 'won', title: 'Mark as won', iconProps: { iconName: 'CheckMark' }, onClick: () => record.setValue('stage', 4) },
                                )
                                result.overflowItems.push(
                                    { key: 'reset', text: 'Reset probability', iconProps: { iconName: 'Undo' }, onClick: () => record.setValue('probability', 0) },
                                )
                            },
                        },
                    },
                },
            }}
            height='440px' />
    </Stack>
}
