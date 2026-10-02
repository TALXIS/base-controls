import React from 'react'
import { ChoiceGroup, IChoiceGroupOption, Icon, mergeStyleSets, Stack, Text } from '@fluentui/react'
import { IGridRowModelType } from '@talxis/base-controls'
import { MemoryDataProvider } from '@talxis/client-libraries'
import { GridExampleRunner } from '../GridExampleRunner'
import { createTicketsProvider } from '../data'

export const OPEN_TICKET_GROUPS_CODE = `interface IGridExampleProps {
    rowModel: IGridRowModelType
}

//remounted per row model: modules are read at mount
const GridExample = (props: IGridExampleProps) => <Grid.Root
    key={props.rowModel}
    provider={provider}
    modules={{
        rowModel: props.rowModel === 'serverSide' ? createServerSideRowModelModule() : createClientSideRowModelModule(),
        grouping: createGroupingModule(),
    }}
    height='440px' />
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
