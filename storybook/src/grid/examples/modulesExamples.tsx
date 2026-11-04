import React from 'react'
import { ChoiceGroup, IChoiceGroupOption, Icon, mergeStyleSets, Stack, Text } from '@fluentui/react'
import { IGridRowModelType } from '@talxis/base-controls'
import { MemoryDataProvider } from '@talxis/client-libraries'
import { GridExampleRunner } from '../GridExampleRunner'
import { createTicketsProvider } from '../data'

export const OPEN_TICKET_GROUPS_CODE = `//your AG Grid Enterprise key, as your host supplies it
const AG_GRID_LICENSE_KEY = ''

interface IGridExampleProps {
    rowModel: IGridRowModelType
}

//remounted per row model: modules are read at mount
const GridExample = (props: IGridExampleProps) => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <Grid
            key={props.rowModel}
            modules={[
                //the key is required, so leave the module out without one
                ...(AG_GRID_LICENSE_KEY ? [createLicenseModule({ key: AG_GRID_LICENSE_KEY })] : []),
                props.rowModel === 'serverSide' ? createServerSideRowModelModule() : createClientSideRowModelModule(),
                createGroupingModule(),
            ]}
            height='440px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const PICK_MODULES_CODE = `interface IModuleSwitches {
    selection: boolean
    sorting: boolean
    filtering: boolean
    grouping: boolean
}

const LABELS: { [name in keyof IModuleSwitches]: string } = {
    selection: 'Row selection',
    sorting: 'Sorting',
    filtering: 'Filtering',
    grouping: 'Grouping (Enterprise)',
}

const GridExample = () => {
    const [switches, setSwitches] = React.useState<IModuleSwitches>({ selection: true, sorting: true, filtering: true, grouping: false })

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
                <Stack horizontal wrap tokens={{ childrenGap: 16 }}>
                    {(Object.keys(LABELS) as (keyof IModuleSwitches)[]).map(name => <Toggle key={name} inlineLabel label={LABELS[name]} checked={switches[name]} onChange={(_, checked) => toggle(name, !!checked)} />)}
                </Stack>
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid
                //modules are read at mount
                key={JSON.stringify(switches)}
                modules={[
                    createClientSideRowModelModule(),
                    ...(switches.selection ? [createRowSelectionModule({ mode: 'multiple' })] : []),
                    ...(switches.sorting ? [createSortingModule()] : []),
                    ...(switches.filtering ? [createFilteringModule()] : []),
                    ...(switches.grouping ? [createGroupingModule()] : []),
                ]}
                enableOptionSetColors
                height='400px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

const FETCH_DELAY = 800

//stands in for a remote service whose every fetch takes a moment
class RemoteTicketsProvider extends MemoryDataProvider {
    public groupFetches = 0
    public onGroupFetch?: () => void

    public async getDataAsync(...parameters: Parameters<MemoryDataProvider['getDataAsync']>) {
        const topLevelProvider = this.getTopLevelDataProvider() as RemoteTicketsProvider
        if (topLevelProvider !== this) {
            topLevelProvider.groupFetches++
            //deferred: a grid fetches its groups while it renders
            window.setTimeout(() => topLevelProvider.onGroupFetch?.())
        }
        await new Promise(resolve => window.setTimeout(resolve, FETCH_DELAY))
        return super.getDataAsync(...parameters)
    }
}

const createRemoteTicketsProvider = (onGroupFetch: () => void) => {
    const tickets = createTicketsProvider()
    const provider = new RemoteTicketsProvider({ dataSource: tickets.getDataSource(), metadata: tickets.getMetadata() })
    provider.setColumns(tickets.getColumns())
    provider.grouping.addGroupBy({ columnName: 'customer', alias: 'customer_group' })
    provider.onGroupFetch = onGroupFetch
    provider.refresh()
    return provider
}

const ROW_MODEL_OPTIONS: IChoiceGroupOption[] = [
    { key: 'clientSide', text: 'Client side' },
    { key: 'serverSide', text: 'Server side (Enterprise)' },
]

const styles = mergeStyleSets({
    bar: {
        marginBottom: 12,
    },
    options: {
        display: 'flex',
        columnGap: 24,
    },
})

interface IRowModelBarProps {
    rowModel: IGridRowModelType
    groupFetches: number
    onChange: (rowModel: IGridRowModelType) => void
}

const RowModelBar = (props: IRowModelBarProps) => <Stack horizontal wrap verticalAlign='end' horizontalAlign='space-between' tokens={{ childrenGap: 16 }} className={styles.bar}>
    <ChoiceGroup
        label='Row model'
        selectedKey={props.rowModel}
        options={ROW_MODEL_OPTIONS}
        onChange={(_event, option) => option && props.onChange(option.key as IGridRowModelType)}
        styles={{ flexContainer: styles.options }} />
    <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 8 }}>
        <Icon iconName='CloudDownload' />
        <Text>{props.groupFetches === 1 ? '1 customer fetched' : props.groupFetches + ' customers fetched'}</Text>
    </Stack>
</Stack>

export const PickModulesExample = () => <GridExampleRunner seedCode={PICK_MODULES_CODE} dataset='tickets' />

export const OpenTicketGroupsExample = () => {
    const [rowModel, setRowModel] = React.useState<IGridRowModelType>('clientSide')
    const [, onGroupFetch] = React.useReducer((fetches: number) => fetches + 1, 0)
    const providerRef = React.useRef<RemoteTicketsProvider>()

    const createProvider = () => {
        providerRef.current = createRemoteTicketsProvider(onGroupFetch)
        return providerRef.current
    }

    const onRowModelChange = (next: IGridRowModelType) => {
        const provider = providerRef.current!
        //the next row model starts with no group fetched
        provider.groupFetches = 0
        provider.refresh()
        setRowModel(next)
    }

    return <GridExampleRunner
        seedCode={OPEN_TICKET_GROUPS_CODE}
        onCreateProvider={createProvider}
        previewProps={{ rowModel }}
        renderAbovePreview={() => <RowModelBar rowModel={rowModel} groupFetches={providerRef.current?.groupFetches ?? 0} onChange={onRowModelChange} />} />
}
