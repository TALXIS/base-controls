import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'

const STORE_OPENINGS_CODE = `import { ClientSideGrid, DatasetControl, IDatasetControlLoadResult, IDatasetControlView, IGrid, LeafletMap, Map, Panel, useDatasetControl, useMapRecord } from '@talxis/base-controls'
import type { IRecord } from '@talxis/client-libraries'
import { Link, PanelType } from '@fluentui/react'
import { createStoresProvider } from './stores'
import { StoreForm } from './StoreForm'

//the UI a view draws the stores with, read through getView().data
interface IStoreViewData {
    ui: 'grid' | 'map'
}

const VIEWS: IDatasetControlView<IStoreViewData>[] = [
    { id: 'all', name: 'All stores', resolve: provider => ({ columns: provider.getColumns(), data: { ui: 'grid' } }) },
    { id: 'map', name: 'On the map', resolve: provider => ({ columns: provider.getColumns(), data: { ui: 'map' } }) },
]

const loadStores = async (): Promise<IDatasetControlLoadResult<IStoreViewData>> => ({ provider: createStoresProvider(), views: VIEWS })

interface IStoresProps {
    onOpenStore: (store: IRecord) => void
}

//a pin's popup with an Open link, like the store's name in the grid
const StorePopup = (props: IStoresProps) => {
    const store = useMapRecord()
    return <Map.Popup.Card>
        <Map.Popup.Header statusColumnName='status' />
        <Map.Popup.FieldRows>
            <Map.Popup.FieldRow columnName='manager' iconName='Contact' />
            <Map.Popup.FieldRow columnName='openingdate' iconName='Calendar' />
        </Map.Popup.FieldRows>
        <Link onClick={() => props.onOpenStore(store)}>Open</Link>
    </Map.Popup.Card>
}

//the body mounts anew for every view and reads the view once
const StoresBody = (props: IStoresProps) => {
    const isMap = useDatasetControl<IStoreViewData>().getView()?.data?.ui === 'map'

    const onSetup = (grid: IGrid) => {
        //a click on a store's name opens it through this hook
        grid.hooks.openRecord.add(request => {
            //a handled request is not passed on to the provider
            request.isHandled = true
            props.onOpenStore(request.record)
        })
    }

    //both draw the control's provider and take none of their own
    return isMap
        ? <LeafletMap fieldMapping={{ latitude: 'lat', longitude: 'lng' }} components={{ marker: { popup: { onRender: () => <StorePopup {...props} /> } } }} />
        : <ClientSideGrid onSetup={onSetup} enableOptionSetColors />
}

const GridExample = () => {
    const [openedStore, setOpenedStore] = React.useState<IRecord>()

    return <>
        <DatasetControl onLoad={loadStores} height='480px'>
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <DatasetControl.ViewSwitcher />
                </DatasetControl.Header.Start>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <StoresBody onOpenStore={setOpenedStore} />
            </DatasetControl.Body>
        </DatasetControl>
        <Panel isOpen={!!openedStore} type={PanelType.large} headerText={openedStore?.getFormattedValue('name') ?? ''} isLightDismiss onDismiss={() => setOpenedStore(undefined)}>
            {openedStore && <StoreForm key={openedStore.getRecordId()} store={openedStore} />}
        </Panel>
    </>
}
`

const STORE_FORM_FILE: IGridExampleFile = {
    name: 'StoreForm.tsx',
    code: `import { DatasetControl, Form, ITaskGridLoadResult, ITaskRuntime, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import type { IRecord } from '@talxis/client-libraries'
import { PLAN_COLUMNS, PLAN_FIELD_MAPPING, plans } from './plans'

const FIELDS = ['name', 'country', 'manager', 'status', 'openingdate']

//a TaskDatasetControl of its own, over the tasks of every store's plan
const OpeningPlan = (props: { storeId: string }) => {
    const loadPlan = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
        store: new MemoryTaskStore({ taskRuntime, database: plans, columns: PLAN_COLUMNS }),
        fieldMapping: PLAN_FIELD_MAPPING,
        //the grid shows only the tasks under the store's own task
        rootTaskId: props.storeId,
    })

    return <TaskDatasetControl onLoad={loadPlan} height='300px'>
        <DatasetControl.Body>
            <TaskGrid />
        </DatasetControl.Body>
    </TaskDatasetControl>
}

//the form edits the record the grid or the map opened
export const StoreForm = (props: { store: IRecord }) => <Form.Root onLoad={async () => ({ record: props.store })}>
    <Form.Ribbon />
    <Form.Section label='Store' layout={{ lg: 2 }} cellLabelPosition='Top'>
        {FIELDS.map(name => <Form.Field key={name} name={name}>
            <Form.Cell><Form.Control /></Form.Cell>
        </Form.Field>)}
    </Form.Section>
    <Form.Section label='Opening plan'>
        <OpeningPlan storeId={props.store.getRecordId()} />
    </Form.Section>
</Form.Root>
`,
}

const STORES_FILE: IGridExampleFile = {
    name: 'stores.ts',
    code: `import { DataTypes, MemoryDataProvider } from '@talxis/client-libraries'

//each option's colour is the colour of its tag
const STATUSES = [
    { Value: 1, Label: 'Planned', Color: '#8764b8' },
    { Value: 2, Label: 'Fitting out', Color: '#ca5010' },
    { Value: 3, Label: 'Open', Color: '#107c10' },
]

//the new stores of a coffee chain, with latitude and longitude in decimal degrees
const STORES = [
    { storeid: 'lyon', name: 'Lyon Part-Dieu', country: 'France', manager: 'Camille Durand', status: 3, openingdate: '2026-04-18', lat: 45.7606, lng: 4.8597 },
    { storeid: 'porto', name: 'Porto Ribeira', country: 'Portugal', manager: 'Inês Costa', status: 3, openingdate: '2026-09-05', lat: 41.1406, lng: -8.6132 },
    { storeid: 'krakow', name: 'Kraków Kazimierz', country: 'Poland', manager: 'Marta Nowak', status: 2, openingdate: '2026-12-12', lat: 50.0517, lng: 19.945 },
    { storeid: 'ghent', name: 'Ghent Korenmarkt', country: 'Belgium', manager: 'Pieter Claes', status: 2, openingdate: '2027-02-06', lat: 51.0545, lng: 3.7216 },
    { storeid: 'bologna', name: 'Bologna Santo Stefano', country: 'Italy', manager: 'Giulia Romano', status: 1, openingdate: '2027-04-17', lat: 44.4914, lng: 11.348 },
    { storeid: 'gothenburg', name: 'Gothenburg Haga', country: 'Sweden', manager: 'Erik Lindqvist', status: 1, openingdate: '2027-06-05', lat: 57.6985, lng: 11.9555 },
]

//each view's provider writes saved changes back into these rows
export const createStoresProvider = () => new MemoryDataProvider({
    dataSource: STORES,
    metadata: { PrimaryIdAttribute: 'storeid', PrimaryNameAttribute: 'name', LogicalName: 'store' },
    columns: [
        //the primary column, drawn as a link in the grid
        { name: 'name', displayName: 'Store', dataType: DataTypes.SingleLineText, isPrimary: true },
        { name: 'country', displayName: 'Country', dataType: DataTypes.SingleLineText },
        { name: 'manager', displayName: 'Manager', dataType: DataTypes.SingleLineText },
        { name: 'status', displayName: 'Status', dataType: DataTypes.OptionSet, metadata: { OptionSet: STATUSES } },
        { name: 'openingdate', displayName: 'Opening date', dataType: DataTypes.DateAndTimeDateOnly },
        //where the map puts each pin, hidden in the grid
        { name: 'lat', displayName: 'Latitude', dataType: DataTypes.Decimal, isHidden: true },
        { name: 'lng', displayName: 'Longitude', dataType: DataTypes.Decimal, isHidden: true },
    ],
})
`,
}

const PLANS_FILE: IGridExampleFile = {
    name: 'plans.ts',
    code: `import { MemoryTaskDatabase } from '@talxis/base-controls'
import { DataTypes, IColumn } from '@talxis/client-libraries'

//the columns that make the tree, and the one drawn as a progress bar
export const PLAN_FIELD_MAPPING = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', percentComplete: 'percentcomplete' }

export const PLAN_COLUMNS: IColumn[] = [
    { name: 'subject', displayName: 'Task', dataType: DataTypes.SingleLineText, isPrimary: true, visualSizeFactor: 320 },
    { name: 'due', displayName: 'Due', dataType: DataTypes.DateAndTimeDateOnly, visualSizeFactor: 130 },
    { name: 'percentcomplete', displayName: 'Progress', dataType: DataTypes.WholeNone, visualSizeFactor: 160 },
    { name: 'taskid', displayName: 'ID', dataType: DataTypes.SingleLineText, isHidden: true },
    { name: 'parentid', displayName: 'Parent', dataType: DataTypes.LookupSimple, isHidden: true },
    { name: 'stackrank', displayName: 'Rank', dataType: DataTypes.SingleLineText, isHidden: true },
    { name: 'statecode', displayName: 'State', dataType: DataTypes.WholeNone, isHidden: true },
]

//a parent lookup holds { id: { guid }, etn }
const under = (taskId: string) => [{ id: { guid: taskId }, etn: 'storetask' }]

//each store's plan sits under a task with the store's id
const TASKS = [
    { taskid: 'lyon', parentid: null, stackrank: '0|100000:', subject: 'Open Lyon Part-Dieu' },
    { taskid: 'lyon-lease', parentid: under('lyon'), stackrank: '0|100000:', subject: 'Sign the lease', due: '2025-10-31', percentcomplete: 100 },
    { taskid: 'lyon-fitout', parentid: under('lyon'), stackrank: '0|200000:', subject: 'Fit out the store', due: '2026-03-20', percentcomplete: 100 },
    { taskid: 'lyon-counter', parentid: under('lyon-fitout'), stackrank: '0|100000:', subject: 'Build the counter and seating', due: '2026-02-06', percentcomplete: 100 },
    { taskid: 'lyon-machines', parentid: under('lyon-fitout'), stackrank: '0|200000:', subject: 'Install the coffee machines', due: '2026-03-20', percentcomplete: 100 },
    { taskid: 'lyon-team', parentid: under('lyon'), stackrank: '0|300000:', subject: 'Hire and train the team', due: '2026-04-10', percentcomplete: 100 },

    { taskid: 'porto', parentid: null, stackrank: '0|200000:', subject: 'Open Porto Ribeira' },
    { taskid: 'porto-lease', parentid: under('porto'), stackrank: '0|100000:', subject: 'Sign the lease', due: '2026-03-20', percentcomplete: 100 },
    { taskid: 'porto-fitout', parentid: under('porto'), stackrank: '0|200000:', subject: 'Fit out the store', due: '2026-08-07', percentcomplete: 100 },
    { taskid: 'porto-counter', parentid: under('porto-fitout'), stackrank: '0|100000:', subject: 'Build the counter and seating', due: '2026-06-26', percentcomplete: 100 },
    { taskid: 'porto-machines', parentid: under('porto-fitout'), stackrank: '0|200000:', subject: 'Install the coffee machines', due: '2026-08-07', percentcomplete: 100 },
    { taskid: 'porto-team', parentid: under('porto'), stackrank: '0|300000:', subject: 'Hire and train the team', due: '2026-08-28', percentcomplete: 100 },

    { taskid: 'krakow', parentid: null, stackrank: '0|300000:', subject: 'Open Kraków Kazimierz' },
    { taskid: 'krakow-lease', parentid: under('krakow'), stackrank: '0|100000:', subject: 'Sign the lease', due: '2026-06-26', percentcomplete: 100 },
    { taskid: 'krakow-fitout', parentid: under('krakow'), stackrank: '0|200000:', subject: 'Fit out the store', due: '2026-11-13', percentcomplete: 80 },
    { taskid: 'krakow-counter', parentid: under('krakow-fitout'), stackrank: '0|100000:', subject: 'Build the counter and seating', due: '2026-10-02', percentcomplete: 100 },
    { taskid: 'krakow-machines', parentid: under('krakow-fitout'), stackrank: '0|200000:', subject: 'Install the coffee machines', due: '2026-11-13', percentcomplete: 60 },
    { taskid: 'krakow-team', parentid: under('krakow'), stackrank: '0|300000:', subject: 'Hire and train the team', due: '2026-12-04', percentcomplete: 40 },

    { taskid: 'ghent', parentid: null, stackrank: '0|400000:', subject: 'Open Ghent Korenmarkt' },
    { taskid: 'ghent-lease', parentid: under('ghent'), stackrank: '0|100000:', subject: 'Sign the lease', due: '2026-08-21', percentcomplete: 100 },
    { taskid: 'ghent-fitout', parentid: under('ghent'), stackrank: '0|200000:', subject: 'Fit out the store', due: '2027-01-08', percentcomplete: 25 },
    { taskid: 'ghent-counter', parentid: under('ghent-fitout'), stackrank: '0|100000:', subject: 'Build the counter and seating', due: '2026-11-27', percentcomplete: 50 },
    { taskid: 'ghent-machines', parentid: under('ghent-fitout'), stackrank: '0|200000:', subject: 'Install the coffee machines', due: '2027-01-08', percentcomplete: 0 },
    { taskid: 'ghent-team', parentid: under('ghent'), stackrank: '0|300000:', subject: 'Hire and train the team', due: '2027-01-29', percentcomplete: 0 },

    { taskid: 'bologna', parentid: null, stackrank: '0|500000:', subject: 'Open Bologna Santo Stefano' },
    { taskid: 'bologna-lease', parentid: under('bologna'), stackrank: '0|100000:', subject: 'Sign the lease', due: '2026-10-30', percentcomplete: 75 },
    { taskid: 'bologna-fitout', parentid: under('bologna'), stackrank: '0|200000:', subject: 'Fit out the store', due: '2027-03-19', percentcomplete: 0 },
    { taskid: 'bologna-counter', parentid: under('bologna-fitout'), stackrank: '0|100000:', subject: 'Build the counter and seating', due: '2027-02-05', percentcomplete: 0 },
    { taskid: 'bologna-machines', parentid: under('bologna-fitout'), stackrank: '0|200000:', subject: 'Install the coffee machines', due: '2027-03-19', percentcomplete: 0 },
    { taskid: 'bologna-team', parentid: under('bologna'), stackrank: '0|300000:', subject: 'Hire and train the team', due: '2027-04-09', percentcomplete: 0 },

    { taskid: 'gothenburg', parentid: null, stackrank: '0|600000:', subject: 'Open Gothenburg Haga' },
    { taskid: 'gothenburg-lease', parentid: under('gothenburg'), stackrank: '0|100000:', subject: 'Sign the lease', due: '2026-12-18', percentcomplete: 30 },
    { taskid: 'gothenburg-fitout', parentid: under('gothenburg'), stackrank: '0|200000:', subject: 'Fit out the store', due: '2027-05-07', percentcomplete: 0 },
    { taskid: 'gothenburg-counter', parentid: under('gothenburg-fitout'), stackrank: '0|100000:', subject: 'Build the counter and seating', due: '2027-03-26', percentcomplete: 0 },
    { taskid: 'gothenburg-machines', parentid: under('gothenburg-fitout'), stackrank: '0|200000:', subject: 'Install the coffee machines', due: '2027-05-07', percentcomplete: 0 },
    { taskid: 'gothenburg-team', parentid: under('gothenburg'), stackrank: '0|300000:', subject: 'Hire and train the team', due: '2027-05-28', percentcomplete: 0 },
]

//statecode 0 marks a task active
export const plans = new MemoryTaskDatabase({ records: TASKS.map(task => ({ ...task, statecode: 0 })), metadata: { PrimaryIdAttribute: 'taskid', LogicalName: 'storetask' } })
`,
}

export const StoreOpeningsExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: STORE_OPENINGS_CODE }, STORE_FORM_FILE, STORES_FILE, PLANS_FILE]} tabs={['preview', 'code']} />
