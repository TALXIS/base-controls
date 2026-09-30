const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    colDefs={{
        name: { pinned: 'left' },
        stage: { pinned: 'right' },
        owner: { settings: { alignment: 'center' } },
    }}
    height='440px' />
