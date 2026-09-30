import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const CONDITIONAL_FORMATTING_CODE = `const overdueModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('cells').registerCellThemeHook((theme, { record, columnName }) => {
            const closeDate = record.getValue('closedate')
            const isWon = Number(record.getValue('stage')) === 4
            if (columnName !== 'closedate' || !closeDate || isWon || new Date(closeDate) >= new Date()) {
                return
            }
            theme.colors.background = '#fde7e9'
            theme.colors.text = '#a4262c'
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [overdueModule] }}
    height='440px' />
`

export const EDITABLE_PER_RECORD_CODE = `const lockWonDealsModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('locks').registerLockHook((result, { record, columnName }) => {
            //a cell: both are given
            if (record && columnName && Number(record.getValue('stage')) === 4) {
                result.isLocked = true
            }
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [lockWonDealsModule] }}
    enableEditing
    height='440px' />
`

export const INACTIVE_RECORDS_CODE = `const inactiveWonDealsModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('locks').registerLockHook((result, { record, columnName }) => {
            //a record's row: no column is given
            if (record && !columnName && Number(record.getValue('stage')) === 4) {
                result.isLocked = true
            }
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [inactiveWonDealsModule] }}
    enableEditing
    height='440px' />
`

export const ROW_HEIGHT_CODE = `const compactWonRowsModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('rows').registerRowHeightHook((result, { record }) => {
            if (Number(record.getValue('stage')) === 4) {
                result.height = 30
            }
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [compactWonRowsModule] }}
    height='440px' />
`

export const COLUMN_MENU_ITEMS_CODE = `const GridExample = () => {
    const [message, setMessage] = React.useState('Open a column menu.')
    const describeModule = React.useMemo<IGridModule>(() => ({
        onRegister: runtime => {
            runtime.services.get('columns').headers.registerColumnMenuItemsHook((items, header) => {
                items.push({
                    key: 'describe',
                    text: 'Describe this column',
                    iconProps: { iconName: 'Info' },
                    onClick: () => setMessage(header.getName() + ' holds ' + header.getColumn()?.dataType + ' values.'),
                })
            })
        },
    }), [])

    return <Stack tokens={{ childrenGap: 8 }}>
        <MessageBar>{message}</MessageBar>
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule(), sorting: createSortingModule(), custom: [describeModule] }}
            height='440px' />
    </Stack>
}
`

export const HEADER_ADORNMENTS_CODE = `const currencyModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('columns').headers.registerColumnHeaderAdornmentsHook((adornments, header) => {
            if (header.getColumn()?.name !== 'value') {
                return
            }
            adornments.push({
                key: 'currency',
                placement: 'suffix',
                title: 'in USD',
                onRender: () => <Icon iconName='Money' style={{ color: '#107c10' }} />,
            })
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [currencyModule] }}
    height='440px' />
`

export const CELL_COMMANDS_CODE = `const markWonModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('cells').registerCellCommandsHook((result, { record, columnName }) => {
            if (columnName !== 'name' || Number(record.getValue('stage')) === 4) {
                return
            }
            result.items.push({
                key: 'won',
                text: 'Won',
                iconProps: { iconName: 'CheckMark' },
                onClick: () => record.setValue('stage', 4),
            })
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [markWonModule] }}
    height='440px' />
`

export const COLUMN_DEFINITIONS_CODE = `const layoutModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('columns').registerColumnDefinitionsHook(columnDefs => {
            const recurringIndex = columnDefs.findIndex(columnDef => columnDef.colId === 'recurring')
            if (recurringIndex !== -1) {
                columnDefs.splice(recurringIndex, 1)
            }
            const nameColumn = columnDefs.find(columnDef => columnDef.colId === 'name')
            if (nameColumn) {
                nameColumn.pinned = 'left'
            }
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [layoutModule] }}
    height='440px' />
`

export const ConditionalFormattingExample = () => <GridExampleRunner seedCode={CONDITIONAL_FORMATTING_CODE} />
export const EditablePerRecordExample = () => <GridExampleRunner seedCode={EDITABLE_PER_RECORD_CODE} />
export const InactiveRecordsExample = () => <GridExampleRunner seedCode={INACTIVE_RECORDS_CODE} />
export const RowHeightExample = () => <GridExampleRunner seedCode={ROW_HEIGHT_CODE} />
export const ColumnMenuItemsExample = () => <GridExampleRunner seedCode={COLUMN_MENU_ITEMS_CODE} />
export const HeaderAdornmentsExample = () => <GridExampleRunner seedCode={HEADER_ADORNMENTS_CODE} />
export const CellCommandsExample = () => <GridExampleRunner seedCode={CELL_COMMANDS_CODE} />
export const ColumnDefinitionsExample = () => <GridExampleRunner seedCode={COLUMN_DEFINITIONS_CODE} />
