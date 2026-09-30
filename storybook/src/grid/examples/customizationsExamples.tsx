import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const FEATURE_PROPS_CODE = `const GridExample = () => {
    const [isZebra, setIsZebra] = React.useState(true)
    const [hasOptionColors, setHasOptionColors] = React.useState(true)
    const [isCompact, setIsCompact] = React.useState(false)

    return <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal tokens={{ childrenGap: 24 }}>
            <Toggle label='Zebra rows' inlineLabel checked={isZebra} onChange={(_event, checked) => setIsZebra(!!checked)} />
            <Toggle label='Option set colours' inlineLabel checked={hasOptionColors} onChange={(_event, checked) => setHasOptionColors(!!checked)} />
            <Toggle label='Compact rows' inlineLabel checked={isCompact} onChange={(_event, checked) => setIsCompact(!!checked)} />
        </Stack>
        <Grid.Root
            key={[isZebra, hasOptionColors, isCompact].join()}
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            enableZebra={isZebra}
            enableOptionSetColors={hasOptionColors}
            rowHeight={isCompact ? 32 : 42}
            height='440px' />
    </Stack>
}
`

export const EDITABLE_GRID_CODE = `const validateProbability = (record: IRecord) => record.expressions.setValidationExpression('probability', () => {
    const probability = Number(record.getValue('probability') ?? 0)
    return { error: probability < 0 || probability > 100, errorMessage: 'A probability is between 0 and 100 %.' }
})

const GridExample = () => {
    const [status, setStatus] = React.useState('Change a value, then leave the cell.')

    React.useEffect(() => {
        provider.getRecords().forEach(validateProbability)
        provider.addEventListener('onRecordLoaded', validateProbability)
        return () => provider.removeEventListener('onRecordLoaded', validateProbability)
    }, [])

    return <Stack tokens={{ childrenGap: 8 }}>
        <MessageBar>{status}</MessageBar>
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            enableEditing
            enableAutoSave
            onBeforeRecordSaved={record => setStatus('Saving ' + record.getFormattedValue('name') + '...')}
            onAfterRecordSaved={result => setStatus(result.success ? 'Saved.' : 'The save failed.')}
            height='440px' />
    </Stack>
}
`

export const LABELS_CODE = `const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        sorting: createSortingModule({
            labels: {
                menuSection: 'Řazení',
                sortTextAscending: 'Seřadit od A do Z',
                sortTextDescending: 'Seřadit od Z do A',
                sortNumberAscending: 'Od nejmenšího',
                sortNumberDescending: 'Od největšího',
                sortDateAscending: 'Od nejstaršího',
                sortDateDescending: 'Od nejnovějšího',
                clear: 'Zrušit řazení',
            },
        }),
    }}
    labels={{
        noRecordsFound: 'Nebyly nalezeny žádné záznamy.',
        valueNotEditable: 'Tuto hodnotu nelze upravit.',
    }}
    height='440px' />
`

export const FeaturePropsExample = () => <GridExampleRunner seedCode={FEATURE_PROPS_CODE} />
export const EditableGridExample = () => <GridExampleRunner seedCode={EDITABLE_GRID_CODE} />
export const LabelsExample = () => <GridExampleRunner seedCode={LABELS_CODE} />
