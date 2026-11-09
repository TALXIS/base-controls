import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import type { IGridExampleFile } from '../GridLivePreview'

export const OPEN_TICKET_GROUPS_CODE = `import { createRemoteTickets } from './remoteTickets'

//your AG Grid Enterprise key, as your host supplies it
const AG_GRID_LICENSE_KEY = ''

const ROW_MODELS = [
    { key: 'clientSide', text: 'Client side' },
    { key: 'serverSide', text: 'Server side (Enterprise)' },
]

const GridExample = () => {
    const [rowModel, setRowModel] = React.useState<IGridRowModelType>('clientSide')
    const [groupFetches, setGroupFetches] = React.useState(0)
    const tickets = React.useMemo(() => createRemoteTickets(() => setGroupFetches(count => count + 1)), [])

    const switchRowModel = (next: IGridRowModelType) => {
        //the next row model starts with no group fetched
        setGroupFetches(0)
        tickets.refresh()
        setRowModel(next)
    }

    const RowModelGrid = rowModel === 'serverSide' ? ServerSideGrid : ClientSideGrid

    return <DatasetControl onLoad={async () => ({ provider: tickets })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <ChoiceGroup label='Row model' selectedKey={rowModel} options={ROW_MODELS} onChange={(_, option) => option && switchRowModel(option.key as IGridRowModelType)} />
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <Text>{groupFetches === 1 ? '1 customer fetched' : groupFetches + ' customers fetched'}</Text>
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <RowModelGrid
                modules={[
                    //the module requires a key
                    ...(AG_GRID_LICENSE_KEY ? [createLicenseModule({ key: AG_GRID_LICENSE_KEY })] : []),
                    createGroupingModule(),
                ]}
                height='440px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

const REMOTE_TICKETS_FILE: IGridExampleFile = {
    name: 'remoteTickets.ts',
    code: `const FETCH_DELAY = 800

/** The support queue grouped by customer, behind a slow service that reports each customer it fetches. */
export const createRemoteTickets = (onGroupFetch: () => void) => {
    class RemoteTickets extends MemoryDataProvider {
        public async getDataAsync(...parameters: Parameters<MemoryDataProvider['getDataAsync']>) {
            //a group's records are fetched by a provider of the group's own
            if (this.getParentDataProvider()) {
                //deferred: the grid fetches groups while it renders
                window.setTimeout(onGroupFetch)
            }
            await new Promise(resolve => window.setTimeout(resolve, FETCH_DELAY))
            return super.getDataAsync(...parameters)
        }
    }
    const tickets = createTicketsProvider()
    const remoteTickets = new RemoteTickets({ dataSource: tickets.getDataSource(), metadata: tickets.getMetadata() })
    remoteTickets.setColumns(tickets.getColumns())
    remoteTickets.grouping.addGroupBy({ columnName: 'customer', alias: 'customer_group' })
    return remoteTickets
}
`,
}

export const PICK_MODULES_CODE = `interface IModuleSwitches {
    sorting: boolean
    filtering: boolean
    grouping: boolean
}

const LABELS: { [name in keyof IModuleSwitches]: string } = {
    sorting: 'Sorting',
    filtering: 'Filtering',
    grouping: 'Grouping (Enterprise)',
}

const GridExample = () => {
    const [switches, setSwitches] = React.useState<IModuleSwitches>({ sorting: true, filtering: true, grouping: false })

    const toggle = (name: keyof IModuleSwitches, isOn: boolean) => {
        //a module switched off leaves its state on the provider
        if (name === 'grouping' && !isOn) {
            provider.grouping.getGroupBys().forEach(groupBy => provider.grouping.removeGroupBy(groupBy.alias))
            provider.refresh()
        }
        setSwitches(current => ({ ...current, [name]: isOn }))
    }

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                {(Object.keys(LABELS) as (keyof IModuleSwitches)[]).map(name => <Toggle key={name} inlineLabel label={LABELS[name]} checked={switches[name]} onChange={(_, checked) => toggle(name, !!checked)} />)}
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <ClientSideGrid
                //the modules are read at mount
                key={JSON.stringify(switches)}
                modules={[
                    ...(switches.sorting ? [createSortingModule()] : []),
                    ...(switches.filtering ? [createFilteringModule()] : []),
                    ...(switches.grouping ? [createGroupingModule()] : []),
                ]}
                height='400px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const PickModulesExample = () => <GridExampleRunner seedCode={PICK_MODULES_CODE} dataset='tickets' />

export const OpenTicketGroupsExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: OPEN_TICKET_GROUPS_CODE }, REMOTE_TICKETS_FILE]} tabs={['preview', 'code']} />
