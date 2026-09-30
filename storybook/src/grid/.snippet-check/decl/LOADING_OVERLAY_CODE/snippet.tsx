const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    components={{
        loadingOverlay: {
            onRenderSpinner: () => <Icon iconName='Sync' style={{ fontSize: 28, color: '#5B5FC7' }} />,
            onRenderText: textProps => <span style={{ fontWeight: 600, color: '#5B5FC7' }}>{textProps.children}</span>,
        },
    }}
    height='320px' />
