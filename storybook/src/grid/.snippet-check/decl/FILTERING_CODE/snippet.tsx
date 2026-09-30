const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        sorting: createSortingModule(),
        filtering: createFilteringModule(),
    }}
    height='440px' />
