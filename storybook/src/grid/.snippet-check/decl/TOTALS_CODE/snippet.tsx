const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        aggregation: createAggregationModule({ allowUserAggregation: true }),
    }}
    height='440px' />
