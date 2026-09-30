const GridExample = () => <Stack tokens={{ childrenGap: 8 }}>
    <span>Drag across cells to highlight them, then press Ctrl+C and paste into a spreadsheet.</span>
    <Grid.Root
        provider={provider}
        modules={{
            rowModel: createClientSideRowModelModule(),
            cellSelection: createCellSelectionModule({ enableFillHandle: false }),
            clipboard: createClipboardModule({ copyHeadersToClipboard: true }),
        }}
        height='440px' />
</Stack>
