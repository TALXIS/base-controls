const GridExample = () => {
    const [isServerSide, setIsServerSide] = React.useState(false)

    return <Stack tokens={{ childrenGap: 8 }}>
        <Toggle label='Server-side rows' inlineLabel checked={isServerSide} onChange={(_event, checked) => setIsServerSide(!!checked)} />
        <Grid.Root
            key={isServerSide ? 'server' : 'client'}
            provider={provider}
            modules={{
                rowModel: isServerSide ? createServerSideRowModelModule() : createClientSideRowModelModule(),
                grouping: createGroupingModule(),
            }}
            height='440px' />
    </Stack>
}
