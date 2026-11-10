import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'

const STORE_OPENINGS_CODE = `import { ClientSideGrid, createAggregationModule, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl, IDatasetControlLoadResult, IDatasetControlView, IGrid, Panel, useDatasetControl } from '@talxis/base-controls'
import type { IRecord } from '@talxis/client-libraries'
import { PanelType } from '@fluentui/react'
import { createStoresProvider, VIEW_COLUMNS } from './stores'
import { StoresRibbon } from './StoresRibbon'
import { StoreMap } from './StoreMap'
import { StoreForm } from './StoreForm'

//the UI a view draws the stores with, read through getView().data
interface IStoreViewData {
    ui: 'grid' | 'map'
}

const VIEWS: IDatasetControlView<IStoreViewData>[] = [
    { id: 'all', name: 'All stores', resolve: () => ({ columns: VIEW_COLUMNS, data: { ui: 'grid' } }) },
    { id: 'map', name: 'On the map', resolve: () => ({ columns: VIEW_COLUMNS, data: { ui: 'map' } }) },
]

const loadStores = async (): Promise<IDatasetControlLoadResult<IStoreViewData>> => ({ provider: createStoresProvider(), views: VIEWS })

interface IStoresProps {
    onOpenStore: (store: IRecord) => void
}

//mounted anew by the control for every view
const Stores = (props: IStoresProps) => {
    const isMap = useDatasetControl<IStoreViewData>().getView()?.data?.ui === 'map'

    const onSetup = (grid: IGrid) => {
        //a click on a store's name opens it through this hook
        grid.hooks.openRecord.add(request => {
            //a handled request is not passed on to the provider
            request.isHandled = true
            props.onOpenStore(request.record)
        })
    }

    return <>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher />
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <StoresRibbon />
                {/* only the grid shows the columns it changes */}
                {!isMap && <DatasetControl.EditColumns />}
                <DatasetControl.QuickFind />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            {/* both draw the control's provider and follow its quick find */}
            {isMap
                ? <StoreMap onOpenStore={props.onOpenStore} />
                : <ClientSideGrid
                    onSetup={onSetup}
                    enableOptionSetColors
                    modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule(), createFilteringModule(), createAggregationModule()]} />}
        </DatasetControl.Body>
    </>
}

const GridExample = () => {
    const [openedStore, setOpenedStore] = React.useState<IRecord>()

    return <>
        <DatasetControl onLoad={loadStores} height='520px'>
            <Stores onOpenStore={setOpenedStore} />
        </DatasetControl>
        <Panel isOpen={!!openedStore} type={PanelType.extraLarge} headerText={openedStore?.getNamedReference().name} isLightDismiss onDismiss={() => setOpenedStore(undefined)}>
            {openedStore && <StoreForm key={openedStore.getRecordId()} store={openedStore} />}
        </Panel>
    </>
}
`

const STORES_RIBBON_FILE: IGridExampleFile = {
    name: 'StoresRibbon.tsx',
    code: `import { DatasetControl, IRibbonCommand, useDataProvider, useDatasetControl } from '@talxis/base-controls'
import { OPEN } from './stores'

//DatasetControl.Ribbon calls onLoad again on every selection
export const StoresRibbon = () => {
    const provider = useDataProvider()
    const control = useDatasetControl()

    const markOpen = async (storeIds: string[]) => {
        const stores = storeIds.map(id => provider.getRecordsMap()[id])
        stores.forEach(store => store.setValue('status', OPEN))
        await provider.save(stores)
        //the same selection now has other commands
        await control.parts.get('ribbon').reload()
    }

    const onLoad = (): IRibbonCommand[] => {
        const notOpenIds = provider.getSelectedRecordIds().filter(id => Number(provider.getRecordsMap()[id].getValue('status')) !== OPEN)
        return notOpenIds.length > 0 ? [{ id: 'markOpen', label: 'Mark ' + notOpenIds.length + ' as open', iconName: 'Shop', onExecute: () => markOpen(notOpenIds) }] : []
    }

    //Save and Discard changes act on the grid's edits and the form's alike
    return <DatasetControl.Ribbon enableSave enableDiscard onLoad={onLoad} />
}
`,
}

const STORE_MAP_FILE: IGridExampleFile = {
    name: 'StoreMap.tsx',
    code: `import { IMapUiMarkerPinProps, LeafletMap, Map, useMapRecord } from '@talxis/base-controls'
import type { IRecord } from '@talxis/client-libraries'
import { Link } from '@fluentui/react'
import { STATUSES } from './stores'

interface IStoreMapProps {
    onOpenStore: (store: IRecord) => void
}

//a pin in the colour of the store's status
const StorePin = (props: IMapUiMarkerPinProps) => {
    const status = Number(useMapRecord().getValue('status'))
    return <Map.Ui.MarkerPin {...props} color={STATUSES.find(option => option.Value === status)?.Color} />
}

//a pin's popup with an Open link, like the store's name in the grid
const StorePopup = (props: IStoreMapProps) => {
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

export const StoreMap = (props: IStoreMapProps) => <LeafletMap fieldMapping={{ latitude: 'lat', longitude: 'lng' }} components={{
    marker: {
        pin: { onRenderPin: pinProps => <StorePin {...pinProps} /> },
        popup: { onRender: () => <StorePopup {...props} /> },
    },
}} />
`,
}

const STORE_FORM_FILE: IGridExampleFile = {
    name: 'StoreForm.tsx',
    code: `import { Form } from '@talxis/base-controls'
import type { IRecord } from '@talxis/client-libraries'
import { OpeningPlan } from './OpeningPlan'

//edits the same record the grid or the map shows
export const StoreForm = (props: { store: IRecord }) => {
    //one field per column the list shows after Edit columns
    const columns = props.store.getColumns().filter(column => !column.isHidden)

    return <Form.Root onLoad={async () => ({ record: props.store })}>
        <Form.Ribbon />
        <Form.Section label='Details' layout={{ lg: 2 }} cellLabelPosition='Top'>
            {columns.map(column => <Form.Field key={column.name} name={column.name}>
                <Form.Cell><Form.Control /></Form.Cell>
            </Form.Field>)}
        </Form.Section>
        <Form.Section label='Opening plan'>
            <OpeningPlan store={props.store} />
        </Form.Section>
    </Form.Root>
}
`,
}

const OPENING_PLAN_FILE: IGridExampleFile = {
    name: 'OpeningPlan.tsx',
    code: `import { createMemoryCustomColumnsModule, createMemoryDependenciesModule, createMemoryLookupManyModule, createMemoryTaskChecklistModule, createMemoryTemplatesModule, createRowSelectionModule, createTaskDraggingModule, createTaskEditingModule, DatasetControl, ICustomColumnRow, ICustomColumnValuesRow, IMemoryTemplate, ITaskGridLoadResult, ITaskRuntime, MemoryTable, MemoryTaskStore, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createBarDraggingModule, createLibraryModule, createLinksModule, createMemoryMarkersModule, createMemoryNonWorkingDaysModule, createTaskDrawingModule, createTaskSelectionModule, createTaskTooltipModule, TaskGantt, TaskTooltip } from '@talxis/base-controls/gantt'
import type { IRecord } from '@talxis/client-libraries'
import { CHECKLIST_ITEMS, DEPENDENCIES, HOLIDAYS, LOOKUP_MANY_COLUMNS, LOOKUP_MANY_SOURCES, LOOKUP_MANY_VALUES, PLAN_FIELD_MAPPING, PLAN_METADATA, PLAN_VIEWS, PLANS, STANDARD_OPENING, TASK_COLUMNS } from './plans'

//one for every store, so a template the user saves is offered on all of them
const templates = new MemoryTable<IMemoryTemplate>({ idKey: 'id', rows: [STANDARD_OPENING] })

//the store's own TaskDatasetControl, with a Gantt beside its task grid
const PLAN_COLUMNS = new MemoryTable<ICustomColumnRow>({ idKey: 'name', rows: [{ name: 'budget', displayName: 'Budget', dataType: 'Currency', precision: 0 }, { name: 'supplier', displayName: 'Supplier', dataType: 'SingleLine.Text', createdOn: 1 }] })
const PLAN_COLUMN_VALUES = new MemoryTable<ICustomColumnValuesRow>({ idKey: 'taskId' })

export const OpeningPlan = (props: { store: IRecord }) => {
    const tasks = PLANS[props.store.getRecordId()]
    //the opening date as the form holds it, saved or not
    const openingDate = dayjs(props.store.getValue('openingdate'))

    const loadPlan = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({
        store: new MemoryTaskStore({ taskRuntime, tasks, metadata: PLAN_METADATA, columns: TASK_COLUMNS }),
        fieldMapping: PLAN_FIELD_MAPPING,
        views: PLAN_VIEWS,
    })

    const planModules = [
        createTaskDraggingModule(),
        createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: LOOKUP_MANY_COLUMNS, values: LOOKUP_MANY_VALUES }),
        createMemoryTaskChecklistModule({ items: CHECKLIST_ITEMS }),
        //the Gantt's links draw these
        createMemoryDependenciesModule({ dependencies: DEPENDENCIES }),
        //From template creates its tasks in the store's own table
        createMemoryTemplatesModule({ tasks, templates }),
        //Budget and Supplier in Edit columns
        createMemoryCustomColumnsModule({
            columns: PLAN_COLUMNS,
            values: PLAN_COLUMN_VALUES,
            enableCreation: true,
            enableDeletion: true,
        }),
    ]

    const ganttModules = [
        createLibraryModule(),
        //today is marked as well
        createMemoryMarkersModule({ markers: new MemoryTable({ idKey: 'id', rows: openingDate.isValid() ? [{ id: 'opening', text: 'Opening', date: openingDate.format('YYYY-MM-DD'), color: '#107c10' }] : [] }) }),
        //weekends are shaded as well
        createMemoryNonWorkingDaysModule({ nonWorkingDays: HOLIDAYS }),
        //a dropped bar saves its dates through the task editing module
        createBarDraggingModule(),
        //Ctrl+drag over a row without dates draws them
        createTaskDrawingModule(),
        createTaskSelectionModule(),
        createTaskTooltipModule({
            components: {
                onRender: () => <TaskTooltip.Callout>
                    <TaskTooltip.Header />
                    <TaskTooltip.ProgressRow />
                    <TaskTooltip.FieldRows>
                        <TaskTooltip.FieldRow columnName='assignedto' iconName='People' />
                    </TaskTooltip.FieldRows>
                    <TaskTooltip.DateRangeRow />
                </TaskTooltip.Callout>,
            },
        }),
        createLinksModule(),
    ]

    return <TaskDatasetControl modules={planModules} enableCreation enableEditing enableDeletion onLoad={loadPlan} height='500px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <TaskGantt.ZoomSlider />
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                {/* New, From template, Edit, Delete, Zoom to fit and Go to today */}
                <TaskDatasetControl.Ribbon />
                <DatasetControl.EditColumns />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <TaskGantt.Split defaultGanttSize={60}>
                <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule()]} />
                <TaskGantt modules={ganttModules} />
            </TaskGantt.Split>
        </DatasetControl.Body>
    </TaskDatasetControl>
}
`,
}

const STORES_FILE: IGridExampleFile = {
    name: 'stores.ts',
    code: `import { DataTypes, IColumn, MemoryDataProvider } from '@talxis/client-libraries'

export const OPEN = 3

//each option's colour is the colour of its tag and its pins
export const STATUSES = [
    { Value: 1, Label: 'Planned', Color: '#8764b8' },
    { Value: 2, Label: 'Fitting out', Color: '#ca5010' },
    { Value: OPEN, Label: 'Open', Color: '#107c10' },
]

//every column Edit columns offers, each as wide as the grid draws it
const COLUMNS: IColumn[] = [
    //the primary column, drawn as a link in the grid
    { name: 'name', displayName: 'Store', dataType: DataTypes.SingleLineText, isPrimary: true, visualSizeFactor: 160 },
    { name: 'country', displayName: 'Country', dataType: DataTypes.SingleLineText, visualSizeFactor: 100 },
    { name: 'manager', displayName: 'Manager', dataType: DataTypes.SingleLineText, visualSizeFactor: 140 },
    { name: 'status', displayName: 'Status', dataType: DataTypes.OptionSet, metadata: { OptionSet: STATUSES }, visualSizeFactor: 110 },
    { name: 'openingdate', displayName: 'Opening date', dataType: DataTypes.DateAndTimeDateOnly, visualSizeFactor: 120 },
    //summed in the row pinned under the grid
    { name: 'floorarea', displayName: 'Floor area (m²)', dataType: DataTypes.WholeNone, visualSizeFactor: 120, aggregation: { aggregationFunction: 'sum' } },
    { name: 'seats', displayName: 'Seats', dataType: DataTypes.WholeNone, visualSizeFactor: 80 },
]

//both views open without Seats and with the pins' position hidden
export const VIEW_COLUMNS = [
    ...COLUMNS.filter(column => column.name !== 'seats'),
    { name: 'lat', displayName: 'Latitude', dataType: DataTypes.Decimal, isHidden: true },
    { name: 'lng', displayName: 'Longitude', dataType: DataTypes.Decimal, isHidden: true },
]

//the new stores of a coffee chain, with latitude and longitude in decimal degrees
export const STORES = [
    { storeid: 'lyon', name: 'Lyon Part-Dieu', country: 'France', manager: 'Camille Durand', status: 3, openingdate: '2026-04-18', floorarea: 180, seats: 46, lat: 45.7606, lng: 4.8597 },
    { storeid: 'porto', name: 'Porto Ribeira', country: 'Portugal', manager: 'Inês Costa', status: 3, openingdate: '2026-09-05', floorarea: 140, seats: 38, lat: 41.1406, lng: -8.6132 },
    { storeid: 'krakow', name: 'Kraków Kazimierz', country: 'Poland', manager: 'Marta Nowak', status: 2, openingdate: '2026-12-12', floorarea: 210, seats: 54, lat: 50.0517, lng: 19.945 },
    { storeid: 'ghent', name: 'Ghent Korenmarkt', country: 'Belgium', manager: 'Pieter Claes', status: 2, openingdate: '2027-02-06', floorarea: 120, seats: 30, lat: 51.0545, lng: 3.7216 },
    { storeid: 'bologna', name: 'Bologna Santo Stefano', country: 'Italy', manager: 'Giulia Romano', status: 1, openingdate: '2027-04-17', floorarea: 160, seats: 42, lat: 44.4914, lng: 11.348 },
    { storeid: 'gothenburg', name: 'Gothenburg Haga', country: 'Sweden', manager: 'Erik Lindqvist', status: 1, openingdate: '2027-06-05', floorarea: 195, seats: 50, lat: 57.6985, lng: 11.9555 },
]

//each view's provider writes saved changes back into these rows
export const createStoresProvider = () => new MemoryDataProvider({
    dataSource: STORES,
    //a memory provider offers Edit columns the columns of its saved queries
    metadata: { PrimaryIdAttribute: 'storeid', PrimaryNameAttribute: 'name', LogicalName: 'store', QuickFindColumns: ['name', 'manager', 'country'], SavedQueries: [{ columns: COLUMNS }] },
})
`,
}

const PLANS_FILE: IGridExampleFile = {
    name: 'plans.ts',
    code: `import { ILookupManyColumn, IMemoryLookupManyValues, IMemoryTaskChecklistItem, IMemoryTemplate, ITaskDependency, ITaskGridView, MemoryTable } from '@talxis/base-controls'
import { IMemoryNonWorkingDay } from '@talxis/base-controls/gantt'
import { DataTypes, IColumn, IRawRecord } from '@talxis/client-libraries'
import { STORES } from './stores'

//the columns that make the tree, and the ones the Gantt draws
export const PLAN_FIELD_MAPPING = { parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', startDate: 'start', endDate: 'end', percentComplete: 'percentcomplete' }

//the tasks' own columns, the dates hidden from the grid
export const TASK_COLUMNS: IColumn[] = [
    { name: 'subject', displayName: 'Task', dataType: DataTypes.SingleLineText, isPrimary: true, visualSizeFactor: 210 },
    { name: 'percentcomplete', displayName: 'Progress', dataType: DataTypes.WholeNone, visualSizeFactor: 100 },
    { name: 'start', displayName: 'Start', dataType: DataTypes.DateAndTimeDateOnly, isHidden: true },
    { name: 'end', displayName: 'End', dataType: DataTypes.DateAndTimeDateOnly, isHidden: true },
    { name: 'taskid', displayName: 'ID', dataType: DataTypes.SingleLineText, isHidden: true },
    { name: 'parentid', displayName: 'Parent', dataType: DataTypes.LookupSimple, isHidden: true },
    { name: 'stackrank', displayName: 'Rank', dataType: DataTypes.SingleLineText, isHidden: true },
    { name: 'statecode', displayName: 'State', dataType: DataTypes.WholeNone, isHidden: true },
]

//the modules' columns as a view lists them
const MODULE_COLUMNS: IColumn[] = [
    { name: 'assignedto', displayName: 'Assigned to', dataType: DataTypes.LookupSimple, visualSizeFactor: 120 },
    { name: 'tags', displayName: 'Tags', dataType: DataTypes.LookupSimple, visualSizeFactor: 120 },
    { name: 'checklist__virtual', displayName: 'Checklist', dataType: DataTypes.LookupSimple, visualSizeFactor: 110 },
]

export const PLAN_VIEWS: ITaskGridView[] = [
    { id: 'plan', name: 'Opening plan', resolve: () => ({ columns: [TASK_COLUMNS[0], ...MODULE_COLUMNS, ...TASK_COLUMNS.slice(1)] }) },
]

const TAGS = [
    { tagid: 'legal', name: 'Legal', color: '#d13438' },
    { tagid: 'design', name: 'Design', color: '#8764b8' },
    { tagid: 'construction', name: 'Construction', color: '#ca5010' },
    { tagid: 'equipment', name: 'Equipment', color: '#038387' },
    { tagid: 'hiring', name: 'Hiring', color: '#0078d4' },
    { tagid: 'marketing', name: 'Marketing', color: '#107c10' },
    { tagid: 'operations', name: 'Operations', color: '#69797e' },
]

//the head office team, and every store's manager
const PEOPLE = ['Sofia Berg', 'Lukas Weber', 'Amélie Laurent', 'Jonas Peeters', 'Hana Kovač', ...STORES.map(store => store.manager)].map(name => ({ personid: name, name }))

//what the Assigned to and Tags pickers offer, by entity
export const LOOKUP_MANY_SOURCES = {
    person: {
        records: new MemoryTable({ idKey: 'personid', rows: PEOPLE }),
        metadata: { PrimaryIdAttribute: 'personid', PrimaryNameAttribute: 'name', LogicalName: 'person', QuickFindColumns: ['name'] },
        columns: [{ name: 'name', displayName: 'Name', dataType: DataTypes.SingleLineText, isPrimary: true }],
    },
    tag: {
        records: new MemoryTable({ idKey: 'tagid', rows: TAGS }),
        metadata: { PrimaryIdAttribute: 'tagid', PrimaryNameAttribute: 'name', LogicalName: 'tag', QuickFindColumns: ['name'] },
        columns: [{ name: 'name', displayName: 'Name', dataType: DataTypes.SingleLineText, isPrimary: true }, { name: 'color', displayName: 'Colour', dataType: DataTypes.SingleLineText, isHidden: true }],
    },
}

export const LOOKUP_MANY_COLUMNS: { [columnName: string]: ILookupManyColumn } = {
    assignedto: { displayName: 'Assigned to', entityName: 'person', appearance: { type: 'people' } },
    //each pill in its tag's colour
    tags: { displayName: 'Tags', entityName: 'tag', appearance: { type: 'colorful' } },
}

//public holidays in every country the chain opens in
export const HOLIDAYS = new MemoryTable<IMemoryNonWorkingDay>({ idKey: 'id', rows: [
    { id: 'newYear', date: '2025-01-01', description: "New Year's Day", recurrence: 'FREQ=YEARLY' },
    { id: 'labourDay', date: '2025-05-01', description: 'Labour Day', recurrence: 'FREQ=YEARLY' },
    { id: 'christmas', date: '2025-12-25', description: 'Christmas Day', recurrence: 'FREQ=YEARLY' },
] })

interface IStep {
    key: string
    subject: string
    parent?: string
    weeks: [number, number]
    //'manager' stands for the store's own manager
    people: string[]
    tags: string[]
    after?: string
    checklist?: string[]
}

//the standard opening, in weeks before the opening day, negative for weeks after it
const STEPS: IStep[] = [
    { key: 'lease', subject: 'Sign the lease', weeks: [30, 27], people: ['Sofia Berg'], tags: ['legal'] },
    { key: 'permits', subject: 'Get the permits', weeks: [26, 20], people: ['Sofia Berg', 'manager'], tags: ['legal'], after: 'lease', checklist: ['Building permit', 'Food hygiene licence', 'Signage permit'] },
    { key: 'fitout', subject: 'Fit out the store', weeks: [19, 3], people: ['Lukas Weber'], tags: ['construction'] },
    { key: 'design', parent: 'fitout', subject: 'Design the interior', weeks: [19, 16], people: ['Amélie Laurent'], tags: ['design'], after: 'permits' },
    { key: 'counter', parent: 'fitout', subject: 'Build the counter and seating', weeks: [15, 8], people: ['Lukas Weber'], tags: ['construction'], after: 'design' },
    { key: 'machines', parent: 'fitout', subject: 'Install the coffee machines', weeks: [7, 3], people: ['Lukas Weber'], tags: ['equipment', 'construction'], after: 'counter', checklist: ['Espresso machines', 'Grinders', 'Water filters'] },
    { key: 'team', subject: 'Hire and train the team', weeks: [10, 1], people: ['manager', 'Hana Kovač'], tags: ['hiring'], checklist: ['Post the jobs', 'Interview the candidates', 'Barista training'] },
    { key: 'launch', subject: 'Plan the opening day', weeks: [6, 0], people: ['manager', 'Jonas Peeters'], tags: ['marketing'], checklist: ['Send the invitations', 'Brief the local press', 'Opening offer'] },
    { key: 'review', subject: 'Review the first month', weeks: [-1, -5], people: ['manager', 'Sofia Berg'], tags: ['operations'], after: 'launch', checklist: ['Sales against the forecast', 'Customer feedback', 'Staff rota'] },
]

//From template adds these steps, without dates, under a task named after it
export const STANDARD_OPENING: IMemoryTemplate = {
    id: 'standardOpening',
    name: 'Standard store opening',
    children: STEPS.filter(step => !step.parent).map(step => ({
        data: { subject: step.subject },
        children: STEPS.filter(child => child.parent === step.key).map(child => ({ data: { subject: child.subject } })),
    })),
}

const today = dayjs().startOf('day')

//how far a task has come by today
const getProgress = (start: Dayjs, end: Dayjs) => today.isAfter(end) ? 100 : today.isBefore(start) ? 0 : Math.round(today.diff(start, 'day') / end.diff(start, 'day') * 10) * 10

const person = (name: string) => ({ id: { guid: name }, name, etn: 'person' })

//a tag's pill reads its colour from the reference's data
const tag = (tagid: string) => {
    const { name, color } = TAGS.find(candidate => candidate.tagid === tagid)!
    return { id: { guid: tagid }, name, etn: 'tag', data: { color } }
}

export const PLAN_METADATA = { PrimaryIdAttribute: 'taskid', LogicalName: 'storetask' }
//a table per store keeps the timeline on that store's tasks
export const PLANS: { [storeId: string]: MemoryTable<IRawRecord> } = {}
export const LOOKUP_MANY_VALUES = new MemoryTable<IMemoryLookupManyValues>({ idKey: 'taskId' })
export const CHECKLIST_ITEMS = new MemoryTable<IMemoryTaskChecklistItem>({ idKey: 'id' })
export const DEPENDENCIES = new MemoryTable<ITaskDependency>({ idKey: 'id' })

for (const store of STORES) {
    const opening = dayjs(store.openingdate)
    const taskId = (key: string) => store.storeid + '-' + key
    const tasks = STEPS.map((step, index) => {
        const id = taskId(step.key)
        //from the Monday of its first week to the Friday of its last
        const start = opening.subtract(step.weeks[0], 'week').subtract(5, 'day')
        const end = opening.subtract(step.weeks[1], 'week').subtract(1, 'day')
        const percentcomplete = getProgress(start, end)
        LOOKUP_MANY_VALUES.insert([{ taskId: id, values: { assignedto: step.people.map(name => person(name === 'manager' ? store.manager : name)), tags: step.tags.map(tag) } }])
        if (step.checklist) {
            //ticked as far as the task has come
            CHECKLIST_ITEMS.insert(step.checklist.map((name, item) => ({ id: id + '-' + item, taskId: id, name, isCompleted: item < Math.round(percentcomplete / 100 * step.checklist!.length) })))
        }
        if (step.after) {
            DEPENDENCIES.insert([{ id: taskId(step.after) + '-' + id, predecessorTaskId: taskId(step.after), successorTaskId: id, type: 'finishToStart' }])
        }
        //active (statecode 0), and ranked in the order of the steps
        return { taskid: id, parentid: step.parent ? [{ id: { guid: taskId(step.parent) }, etn: 'storetask' }] : null, stackrank: '0|' + (index + 1) + '00000:', statecode: 0, subject: step.subject, start: start.format('YYYY-MM-DD'), end: end.format('YYYY-MM-DD'), percentcomplete }
    })
    PLANS[store.storeid] = new MemoryTable<IRawRecord>({ idKey: 'taskid', rows: tasks })
}
`,
}

export const StoreOpeningsExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: STORE_OPENINGS_CODE }, STORES_RIBBON_FILE, STORE_MAP_FILE, STORE_FORM_FILE, OPENING_PLAN_FILE, STORES_FILE, PLANS_FILE]} tabs={['preview', 'code']} />
