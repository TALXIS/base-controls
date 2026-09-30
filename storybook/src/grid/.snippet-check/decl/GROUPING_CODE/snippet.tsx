const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createServerSideRowModelModule(),
        grouping: createGroupingModule({
            type: 'nested',
            defaultExpandedLevel: 1,
            pinGroupedColumns: true,
        }),
    }}
    height='440px' />
