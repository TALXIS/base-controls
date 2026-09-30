const GridExample = () => {
    const [selectedIds, setSelectedIds] = React.useState<string[]>([])

    return <Stack tokens={{ childrenGap: 8 }}>
        <MessageBar>{selectedIds.length} deal(s) selected</MessageBar>
        <Grid.Root
            provider={provider}
            modules={{
                rowModel: createClientSideRowModelModule(),
                rowSelection: createRowSelectionModule({ mode: 'multiple', onSelectionChanged: setSelectedIds }),
            }}
            height='440px' />
    </Stack>
}
