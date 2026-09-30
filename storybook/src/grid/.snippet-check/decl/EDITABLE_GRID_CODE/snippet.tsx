const validateProbability = (result: IFieldValidationResult, { record }: { record: IRecord }) => {
    const probability = Number(record.getValue('probability') ?? 0)
    if (probability < 0 || probability > 100) {
        result.error = true
        result.errorMessage = 'A probability is between 0 and 100 %.'
    }
}

const GridExample = () => {
    const [status, setStatus] = React.useState('Change a value, then leave the cell.')

    return <Stack tokens={{ childrenGap: 8 }}>
        <MessageBar>{status}</MessageBar>
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            enableEditing
            enableAutoSave
            colDefs={{ probability: { settings: { cell: { onGetValidation: validateProbability } } } }}
            onBeforeRecordSaved={record => setStatus('Saving ' + record.getFormattedValue('name') + '...')}
            onAfterRecordSaved={result => setStatus(result.success ? 'Saved.' : 'The save failed.')}
            height='440px' />
    </Stack>
}
