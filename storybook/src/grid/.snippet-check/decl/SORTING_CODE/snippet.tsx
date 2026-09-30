const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        sorting: createSortingModule({
            labels: { sortTextAscending: 'A → Z', sortTextDescending: 'Z → A' },
        }),
    }}
    height='440px' />
