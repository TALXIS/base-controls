import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const LOCK_CLOSED_DEALS_CODE = `const WON = 4
const LOST = 5
//stage is left out so a closed deal can be reopened
const LOCKED_WHEN_CLOSED = ['products', 'value', 'probability', 'closedate']

const isClosed = (record: IRecord) => [WON, LOST].includes(Number(record.getValue('stage')))

const closedDealsModule: IGridModule = {
    name: 'closedDeals',
    onLoad: grid => {
        grid.modules.observe('editing', editing => editing.locks.hooks.lock.add((result, { record, columnName }) => {
            if (record && columnName && LOCKED_WHEN_CLOSED.includes(columnName) && isClosed(record)) {
                result.isLocked = true
            }
        }))
    },
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createEditingModule({ enableAutoSave: true }), closedDealsModule]}
            height='420px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const DAY_UNDER_TEN_HOURS_CODE = `const MAX_HOURS_A_DAY = 10

const getHoursThatDay = (entry: IRecord) => entry.getDataProvider().getRecords()
    .filter(other => other.getValue('employee') === entry.getValue('employee') && dayjs(other.getValue('date')).isSame(entry.getValue('date'), 'day'))
    .reduce((total, other) => total + Number(other.getValue('hours') ?? 0), 0)

const dayLimitModule: IGridModule = {
    name: 'dayLimit',
    onLoad: grid => {
        const timesheets = grid.services.get('provider')
        const cells = grid.services.get('cells')
        grid.services.get('validation').hooks.validation.add((result, { record, columnName }) => {
            if (columnName === 'hours' && getHoursThatDay(record) > MAX_HOURS_A_DAY) {
                result.error = true
                result.errorMessage = \`\${record.getValue('employee')} logged more than \${MAX_HOURS_A_DAY} hours on this day.\`
            }
        })
        //the provider outlives the grid
        grid.services.observe('gridApi', () => {
            //one entry decides whether the others of its day are valid
            return timesheets.addEventListener('onRecordColumnValueChanged', () => cells.render())
        })
    },
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createEditingModule({ enableAutoSave: true }), dayLimitModule]}
            height='440px' />
    </DatasetControl.Body>
</DatasetControl>
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
        name: 'priceRefresh',
        onLoad: grid => {
            cells = grid.services.get('cells')
            cells.hooks.loading.add((result, { record, columnName }) => {
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

    //the ribbon disables a command while it runs
    const loadCommands = async (): Promise<IRibbonCommand[]> => [
        { id: 'refresh', label: 'Refresh prices', iconName: 'Refresh', onExecute: () => priceRefresh.refreshPrices(provider.getRecords()) },
    ]

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.Ribbon onLoad={loadCommands} />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <ClientSideGrid modules={[priceRefresh.module]}
                height='420px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const URGENT_ROWS_CODE = `const HIGH = 1

const urgentRowsModule: IGridModule = {
    name: 'urgentRows',
    onLoad: grid => {
        const tickets = grid.services.get('provider')
        grid.services.get('rows').hooks.height.add((result, { record }) => {
            if (Number(record.getValue('priority')) === HIGH) {
                result.height = 64
            }
        })
        //AG Grid asks for a row's height again only when it is told to
        grid.services.observe('gridApi', gridApi => {
            const resizeRows = (_record: IRecord, columnName: string) => {
                if (columnName === 'priority') {
                    gridApi.resetRowHeights()
                }
            }
            return tickets.addEventListener('onRecordColumnValueChanged', resizeRows)
        })
    },
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createEditingModule({ enableAutoSave: true }), urgentRowsModule]}
            height='440px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const COPY_COLUMN_CODE = `const createCopyColumnModule = (onCopied: (message: string) => void): IGridModule => ({
    name: 'copyColumn',
    onLoad: grid => {
        grid.services.get('columns').headers.hooks.menuSections.add((sections, header) => {
            const column = header.getColumn()
            if (!column) {
                return
            }
            const copyValues = async () => {
                const values = grid.services.get('provider').getRecords().map(record => record.getFormattedValue(column.name) ?? '')
                await navigator.clipboard.writeText(values.join('\\n'))
                onCopied(\`Copied \${values.length} values of \${column.displayName}.\`)
            }
            sections.push({
                key: 'column',
                title: 'Column',
                items: [{ key: 'copyValues', text: 'Copy column values', iconProps: { iconName: 'Copy' }, onClick: () => { copyValues() } }],
            })
        //below the modules' own sections
        }, GRID_MODULE_PRIORITY.aggregation + 1)
    },
})

const GridExample = () => {
    const [message, setMessage] = React.useState('')
    const copyColumnModule = React.useMemo(() => createCopyColumnModule(setMessage), [])

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        {message && <MessageBar messageBarType={MessageBarType.success} onDismiss={() => setMessage('')}>{message}</MessageBar>}
        <DatasetControl.Body>
            <ClientSideGrid
                modules={[
                    createSortingModule(),
                    createFilteringModule(),
                    copyColumnModule,
                ]}
                height='420px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const CURRENCY_IN_HEADER_CODE = `const currencyModule: IGridModule = {
    name: 'currency',
    onLoad: grid => {
        grid.services.get('columns').headers.hooks.adornments.add((adornments, header) => {
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

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createSortingModule(), currencyModule]}
            height='420px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const ASSIGN_TO_ME_CODE = `const ME = 'Eva Horák'

const assignToMeModule: IGridModule = {
    name: 'assignToMe',
    onLoad: grid => {
        grid.services.get('cells').hooks.commands.add((result, { record, columnName }) => {
            if (columnName !== 'assignee' || record.getValue('assignee')) {
                return
            }
            result.items.push({
                key: 'assignToMe',
                text: 'Assign to me',
                iconProps: { iconName: 'AddFriend' },
                onClick: () => {
                    record.setValue('assignee', ME)
                    record.save()
                },
            })
        })
    },
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid modules={[assignToMeModule]}
            height='440px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const COLUMNS_BY_ROLE_CODE = `type Role = 'consultant' | 'manager'

const createColumnsByRoleModule = (getRole: () => Role): IGridModule => ({
    name: 'columnsByRole',
    onLoad: grid => {
        grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
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

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <ChoiceGroup label='Signed in as' selectedKey={role} options={ROLES} onChange={(_, option) => switchRole(option?.key as Role)} />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <ClientSideGrid modules={[columnsByRole]}
                height='420px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const PLACEHOLDERS_CODE = `const PLACEHOLDERS: { [columnName: string]: string } = {
    assignee: 'Unassigned',
    customer: 'No customer',
}

const placeholdersModule: IGridModule = {
    name: 'placeholders',
    onLoad: grid => {
        grid.services.get('cells').hooks.controlParameters.add((parameters, { columnName }) => {
            if (PLACEHOLDERS[columnName]) {
                parameters.Placeholder = { raw: PLACEHOLDERS[columnName] }
            }
        })
    },
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createEditingModule({ enableAutoSave: true }), placeholdersModule]}
            height='440px' />
    </DatasetControl.Body>
</DatasetControl>
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
