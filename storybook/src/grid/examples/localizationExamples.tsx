import React from 'react'
import type { IColumn } from '@talxis/client-libraries'
import { GridExampleRunner } from '../GridExampleRunner'
import { createTimesheetsProvider } from '../data'

export const CZECH_GRID_CODE = `const APPROVED = 3

const LABELS = {
    ...CZECH_LABELS,
    'grid.recordLocked': 'Schválený výkaz už nelze upravit.',
    'gridSorting.clear': 'Zrušit řazení',
}

const GridExample = () => <LocalizationProvider labels={LABELS}>
    <DatasetControl onLoad={async () => ({ provider: provider })}>
        <DatasetControl.Body>
            <Grid
                modules={[
                    createClientSideRowModelModule(),
                    createEditingModule(),
                    createSortingModule(),
                    createFilteringModule(),
                    createGroupingModule(),
                    createAggregationModule(),
                ]}
                colDefs={{ employee: { context: { isLocked: true } } }}
                rowSettings={{
                    onGetLock: (result, { record }) => {
                        if (Number(record.getValue('status')) === APPROVED) {
                            result.isLocked = true
                        }
                    },
                }}
                height='460px' />
        </DatasetControl.Body>
    </DatasetControl>
</LocalizationProvider>
`

const CZECH_COLUMN_NAMES: { [columnName: string]: string } = {
    description: 'Popis práce',
    employee: 'Zaměstnanec',
    project: 'Projekt',
    date: 'Datum',
    hours: 'Hodiny',
    billable: 'Fakturovat',
    rate: 'Hodinová sazba',
    status: 'Stav',
    comment: 'Komentář',
}

const CZECH_OPTION_LABELS: { [columnName: string]: { [value: number]: string } } = {
    project: { 4: 'Interní' },
    billable: { 0: 'Ne', 1: 'Ano' },
    status: { 1: 'Koncept', 2: 'Odesláno', 3: 'Schváleno', 4: 'Zamítnuto' },
}

const toCzech = (column: IColumn): IColumn => ({
    ...column,
    displayName: CZECH_COLUMN_NAMES[column.name] ?? column.displayName,
    metadata: {
        ...column.metadata,
        OptionSet: column.metadata?.OptionSet?.map(option => ({ ...option, Label: CZECH_OPTION_LABELS[column.name]?.[option.Value] ?? option.Label })),
    },
})

//column and option names come from the provider, not from the labels
const createCzechTimesheetsProvider = () => {
    const provider = createTimesheetsProvider()
    provider.setColumns(provider.getColumns().map(toCzech))
    provider.aggregation.addAggregation({ columnName: 'hours', alias: 'hours_sum', aggregationFunction: 'sum' })
    provider.refresh()
    return provider
}

/** Czech timesheets under `CZECH_LABELS`, with two labels of their own. */
export const CzechGridExample = () => <GridExampleRunner seedCode={CZECH_GRID_CODE} onCreateProvider={createCzechTimesheetsProvider} />
