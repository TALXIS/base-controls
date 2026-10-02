import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const LOCK_CLOSED_DEALS_CODE = `const WON = 4
const LOST = 5
//stage is left out so a closed deal can be reopened
const LOCKED_WHEN_CLOSED = ['products', 'value', 'probability', 'closedate']

const isClosed = (record: IRecord) => [WON, LOST].includes(Number(record.getValue('stage')))

const closedDealsModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('locks').registerLockHook((result, { record, columnName }) => {
            if (record && columnName && LOCKED_WHEN_CLOSED.includes(columnName) && isClosed(record)) {
                result.isLocked = true
            }
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [closedDealsModule] }}
    enableEditing
    enableAutoSave
    enableOptionSetColors
    labels={{ valueLocked: 'A closed deal keeps its numbers. Reopen it to change them.' }}
    height='420px' />
`

export const DAY_UNDER_TEN_HOURS_CODE = `const MAX_HOURS_A_DAY = 10
const DAY_COLUMNS = ['employee', 'date', 'hours']

const isSameDay = (entry: IRecord, other: IRecord) => other.getValue('employee') === entry.getValue('employee') && dayjs(other.getValue('date')).isSame(entry.getValue('date'), 'day')

const getHoursThatDay = (entry: IRecord) => entry.getDataProvider().getRecords()
    .filter(other => isSameDay(entry, other))
    .reduce((total, other) => total + Number(other.getValue('hours') ?? 0), 0)

const dayLimitModule: IGridModule = {
    onRegister: runtime => {
        const timesheets = runtime.services.get('provider')
        const cells = runtime.services.get('cells')
        runtime.services.get('validation').registerValidationHook((result, { record, columnName }) => {
            if (columnName === 'hours' && getHoursThatDay(record) > MAX_HOURS_A_DAY) {
                result.error = true
                result.errorMessage = \`\${record.getValue('employee')} logged more than \${MAX_HOURS_A_DAY} hours on this day.\`
            }
        })
        //one entry decides whether the other entries of its day are valid
        const redrawDay = (_record: IRecord, columnName: string) => {
            if (DAY_COLUMNS.includes(columnName)) {
                cells.render()
            }
        }
        timesheets.addEventListener('onRecordColumnValueChanged', redrawDay)
        //the provider outlives the grid
        runtime.events.addEventListener('onDestroyed', () => timesheets.removeEventListener('onRecordColumnValueChanged', redrawDay))
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [dayLimitModule] }}
    enableEditing
    enableAutoSave
    height='440px' />
`

export const REFRESH_PRICES_CODE = `//stands in for the supplier's price list
const fetchSupplierPrice = async (product: IRecord) => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return Math.round(Number(product.getValue('price')) * 1.04)
}

const createPriceRefresh = () => {
    const refreshing = new Set<string>()
    let cells: IGridCells | undefined
    const module: IGridModule = {
        onRegister: runtime => {
            cells = runtime.services.get('cells')
            cells.registerCellLoadingHook((result, { record, columnName }) => {
                if (columnName === 'price' && refreshing.has(record.getRecordId())) {
                    result.isLoading = true
                }
            })
        },
    }
    const refreshPrices = async (products: IRecord[]) => {
        products.forEach(product => refreshing.add(product.getRecordId()))
        cells?.render()
        for (const product of products) {
            const price = await fetchSupplierPrice(product)
            refreshing.delete(product.getRecordId())
            //setting the value redraws the row
            product.setValue('price', price)
        }
    }
    return { module, refreshPrices }
}

const GridExample = () => {
    const priceRefresh = React.useMemo(createPriceRefresh, [])
    const [isRefreshing, setIsRefreshing] = React.useState(false)

    const refreshPrices = async () => {
        setIsRefreshing(true)
        await priceRefresh.refreshPrices(provider.getRecords())
        setIsRefreshing(false)
    }

    const commands: ICommandBarItemProps[] = [
        { key: 'refresh', text: isRefreshing ? 'Refreshing prices...' : 'Refresh prices', iconProps: { iconName: 'Refresh' }, disabled: isRefreshing, onClick: () => { refreshPrices() } },
    ]

    return <Stack tokens={{ childrenGap: 8 }}>
        <CommandBar items={commands} />
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule(), custom: [priceRefresh.module] }}
            height='420px' />
    </Stack>
}
`

export const URGENT_ROWS_CODE = `const HIGH = 1

const urgentRowsModule: IGridModule = {
    onRegister: runtime => {
        const tickets = runtime.services.get('provider')
        runtime.services.get('rows').registerRowHeightHook((result, { record }) => {
            if (Number(record.getValue('priority')) === HIGH) {
                result.height = 64
            }
        })
        //AG Grid asks for a row's height again only when it is told to
        const resizeRows = (_record: IRecord, columnName: string) => {
            if (columnName === 'priority') {
                runtime.services.find('gridApi')?.resetRowHeights()
            }
        }
        tickets.addEventListener('onRecordColumnValueChanged', resizeRows)
        runtime.events.addEventListener('onDestroyed', () => tickets.removeEventListener('onRecordColumnValueChanged', resizeRows))
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [urgentRowsModule] }}
    enableEditing
    enableAutoSave
    enableOptionSetColors
    height='440px' />
`

export const COPY_COLUMN_CODE = `const createCopyColumnModule = (onCopied: (message: string) => void): IGridModule => ({
    onRegister: runtime => {
        runtime.services.get('columns').headers.registerColumnMenuSectionHook((sections, header) => {
            const column = header.getColumn()
            if (!column) {
                return
            }
            const copyValues = async () => {
                const values = runtime.services.get('provider').getRecords().map(record => record.getFormattedValue(column.name) ?? '')
                await navigator.clipboard.writeText(values.join('\\n'))
                onCopied(\`Copied \${values.length} values of \${column.displayName}.\`)
            }
            sections.push({
                key: 'column',
                title: 'Column',
                items: [{ key: 'copyValues', text: 'Copy column values', iconProps: { iconName: 'Copy' }, onClick: () => { copyValues() } }],
            })
        }, GRID_MODULE_PRIORITY.aggregation + 1)
    },
})

const GridExample = () => {
    const [message, setMessage] = React.useState('')
    const copyColumnModule = React.useMemo(() => createCopyColumnModule(setMessage), [])

    return <Stack tokens={{ childrenGap: 8 }}>
        {message && <MessageBar messageBarType={MessageBarType.success} onDismiss={() => setMessage('')}>{message}</MessageBar>}
        <Grid.Root
            provider={provider}
            modules={{
                rowModel: createClientSideRowModelModule(),
                sorting: createSortingModule(),
                filtering: createFilteringModule(),
                custom: [copyColumnModule],
            }}
            height='420px' />
    </Stack>
}
`

export const CURRENCY_IN_HEADER_CODE = `const currencyModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('columns').headers.registerColumnHeaderAdornmentsHook((adornments, header) => {
            if (header.getColumn()?.dataType !== DataTypes.Currency) {
                return
            }
            adornments.push({
                key: 'currency',
                placement: 'suffix',
                title: 'US dollars',
                onRender: () => <Text variant='small'>USD</Text>,
            })
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), sorting: createSortingModule(), custom: [currencyModule] }}
    height='420px' />
`

export const ASSIGN_TO_ME_CODE = `const ME = 'Eva Horák'
const IN_PROGRESS = 2

const assignToMeModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('cells').registerCellCommandsHook((result, { record, columnName }) => {
            if (columnName !== 'assignee' || record.getValue('assignee')) {
                return
            }
            result.items.push({
                key: 'assignToMe',
                text: 'Assign to me',
                iconProps: { iconName: 'AddFriend' },
                onClick: () => {
                    record.setValue('assignee', ME)
                    record.setValue('status', IN_PROGRESS)
                    record.save()
                },
            })
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [assignToMeModule] }}
    enableOptionSetColors
    height='440px' />
`

export const COLUMNS_BY_ROLE_CODE = `type Role = 'consultant' | 'manager'

const createColumnsByRoleModule = (getRole: () => Role): IGridModule => ({
    onRegister: runtime => {
        runtime.services.get('columns').registerColumnDefinitionsHook(columnDefs => {
            const rate = columnDefs.find(colDef => colDef.colId === 'rate')
            if (rate) {
                rate.hide = getRole() !== 'manager'
            }
        })
    },
})

const ROLES = [
    { key: 'consultant', text: 'Consultant' },
    { key: 'manager', text: 'Project manager' },
]

const GridExample = () => {
    const [role, setRole] = React.useState<Role>('consultant')
    const roleRef = React.useRef(role)
    const columnsByRole = React.useMemo(() => createColumnsByRoleModule(() => roleRef.current), [])

    const switchRole = (next: Role) => {
        roleRef.current = next
        setRole(next)
        //the column definitions are built again on every load
        provider.refresh()
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <ChoiceGroup label='Signed in as' selectedKey={role} options={ROLES} onChange={(_, option) => switchRole(option?.key as Role)} styles={{ flexContainer: { display: 'flex', gap: 16 } }} />
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule(), custom: [columnsByRole] }}
            height='420px' />
    </Stack>
}
`

export const PLACEHOLDERS_CODE = `const PLACEHOLDERS: { [columnName: string]: string } = {
    assignee: 'Unassigned',
    customer: 'No customer',
}

const placeholdersModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('cells').registerControlParametersHook((parameters, { columnName }) => {
            if (PLACEHOLDERS[columnName]) {
                parameters.Placeholder = { raw: PLACEHOLDERS[columnName] }
            }
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [placeholdersModule] }}
    enableEditing
    enableAutoSave
    height='440px' />
`

export const LockClosedDealsExample = () => <GridExampleRunner seedCode={LOCK_CLOSED_DEALS_CODE} dataset='deals' />

export const DayUnderTenHoursExample = () => <GridExampleRunner seedCode={DAY_UNDER_TEN_HOURS_CODE} dataset='timesheets' />

export const RefreshPricesExample = () => <GridExampleRunner seedCode={REFRESH_PRICES_CODE} dataset='products' />

export const UrgentRowsExample = () => <GridExampleRunner seedCode={URGENT_ROWS_CODE} dataset='tickets' />

export const CopyColumnExample = () => <GridExampleRunner seedCode={COPY_COLUMN_CODE} dataset='deals' />

export const CurrencyInHeaderExample = () => <GridExampleRunner seedCode={CURRENCY_IN_HEADER_CODE} dataset='products' />

export const AssignToMeExample = () => <GridExampleRunner seedCode={ASSIGN_TO_ME_CODE} dataset='tickets' />

export const ColumnsByRoleExample = () => <GridExampleRunner seedCode={COLUMNS_BY_ROLE_CODE} dataset='timesheets' />

export const PlaceholdersExample = () => <GridExampleRunner seedCode={PLACEHOLDERS_CODE} dataset='tickets' />
