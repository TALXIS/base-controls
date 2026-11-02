import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const SWITCH_LANGUAGE_CODE = `const OWN_STRINGS = {
    'quickFind.searchPlaceholder': 'Hledat obchody...',
    'grid.noRecordsFound': 'Žádný obchod neodpovídá hledání.',
}

//quick find searches the primary column
const loadDeals = async () => {
    provider.setColumns(provider.getColumns().map(column => ({ ...column, isPrimary: column.name === 'name' })))
    return { provider }
}

const GridExample = () => {
    const [isCzech, setIsCzech] = React.useState(true)
    const labels = React.useMemo(() => isCzech ? { ...CZECH_LABELS, ...OWN_STRINGS } : {}, [isCzech])
    const modules = React.useMemo(() => [createClientSideRowModelModule(), createSortingModule(), createFilteringModule()], [])

    return <Stack tokens={{ childrenGap: 12 }}>
        <Toggle label='Čeština' inlineLabel checked={isCzech} onChange={(_, checked) => setIsCzech(!!checked)} />
        <LocalizationProvider labels={labels}>
            {/* the grid captures some strings at mount */}
            <DatasetControl key={String(isCzech)} onLoad={loadDeals} height='420px'>
                <DatasetControl.Header>
                    <DatasetControl.Header.End>
                        <DatasetControl.QuickFind />
                    </DatasetControl.Header.End>
                </DatasetControl.Header>
                <DatasetControl.Body>
                    <Grid modules={modules} />
                </DatasetControl.Body>
                <DatasetControl.Footer>
                    <DatasetControl.Footer.End>
                        <DatasetControl.Pagination />
                    </DatasetControl.Footer.End>
                </DatasetControl.Footer>
            </DatasetControl>
        </LocalizationProvider>
    </Stack>
}
`

export const SwitchLanguageExample = () => <GridExampleRunner seedCode={SWITCH_LANGUAGE_CODE} />
