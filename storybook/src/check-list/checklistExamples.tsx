import React from 'react'
import { GridExampleRunner } from '../grid/GridExampleRunner'
import { createLaunchPlanProvider } from '../grid/data'

const FIELD_MAPPING = `const FIELD_MAPPING: IChecklistFieldMapping = {
    name: 'name',
    stackRank: 'stackrank',
    completed: 'completed',
}`

export const LAUNCH_PLAN_CODE = `${FIELD_MAPPING}

//provider holds the launch plan, as the Data tab shows
const GridExample = () => <DatasetControl onLoad={async () => ({ provider: sortChecklistProvider(provider, FIELD_MAPPING) })}>
    <DatasetControl.Body>
        <Checklist fieldMapping={FIELD_MAPPING} />
    </DatasetControl.Body>
</DatasetControl>
`

export const BASIC_USAGE_CODE = `//names the columns for the item's name, its position and whether it is finished
${FIELD_MAPPING}

const createLaunchPlan = () => new MemoryDataProvider({
    //stackrank holds ranks as StackRank.between makes them
    dataSource: [
        { itemid: '1', name: 'Sketch the layout', completed: true, stackrank: '0|100000:' },
        { itemid: '2', name: 'Ship the first version', completed: false, stackrank: '0|200000:' },
    ],
    metadata: { PrimaryIdAttribute: 'itemid', PrimaryNameAttribute: 'name', LogicalName: 'launchitem' },
    columns: [
        { name: 'name', displayName: 'Item', dataType: DataTypes.SingleLineText },
        { name: 'completed', displayName: 'Done', dataType: DataTypes.TwoOptions },
        { name: 'stackrank', displayName: 'Rank', dataType: DataTypes.SingleLineText },
    ],
})

//the checklist draws items in the order the provider loaded them
const GridExample = () => <DatasetControl onLoad={async () => ({ provider: sortChecklistProvider(createLaunchPlan(), FIELD_MAPPING) })}>
    <DatasetControl.Body>
        <Checklist fieldMapping={FIELD_MAPPING} />
    </DatasetControl.Body>
</DatasetControl>
`

export const READ_ONLY_CODE = `${FIELD_MAPPING}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: sortChecklistProvider(provider, FIELD_MAPPING) })}>
    <DatasetControl.Body>
        <Checklist fieldMapping={FIELD_MAPPING} modules={[]} />
    </DatasetControl.Body>
</DatasetControl>
`

export const RELEASE_BOARD_CODE = `${FIELD_MAPPING}

const onSetup = (grid: IGrid) => {
    //the checklist tells its items from the row that adds one
    const checklist = () => grid.modules.find('checklist')
    const isDone = (record: IRecord) => !!checklist()?.isCompleted(record)
    //each hook runs for every cell
    const cells = grid.services.get('cells')
    cells.hooks.commands.add((result, { record, columnName }) => {
        if (columnName === 'owner' && checklist()?.isItem(record) && !isDone(record) && !record.getValue('owner')) {
            //a grid field saves at once, as the editing module auto-saves
            result.items.push({ key: 'assign', text: 'Assign to me', iconProps: { iconName: 'AddFriend' }, onClick: () => grid.services.get('fields').get(record, 'owner').setValue('Anna Novak') })
        }
    })
    //an unfinished item past its due date
    cells.hooks.theme.add((builder, { record, columnName }) => {
        if (columnName === 'duedate' && !isDone(record) && dayjs(record.getValue('duedate')).isBefore(dayjs(), 'day')) {
            builder.tint('#d13438')
        }
    })
    //a finished item's name and due date cannot be edited
    grid.modules.observe('editing', editing => editing.locks.hooks.lock.add((result: IGridLock, { record, columnName }: IGridLockHookParameters) => {
        if (record && (columnName === 'name' || columnName === 'duedate') && isDone(record)) {
            result.isLocked = true
        }
    }))
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: sortChecklistProvider(provider, FIELD_MAPPING) })}>
    <DatasetControl.Body>
        <Checklist
            fieldMapping={FIELD_MAPPING}
            //the default editing, plus totals for the estimates
            modules={[createEditingModule({ enableAutoSave: true }), createAggregationModule()]}
            onSetup={onSetup} />
    </DatasetControl.Body>
</DatasetControl>
`

export const CUSTOM_CHECK_CODE = `${FIELD_MAPPING}

const onSetup = (grid: IGrid) => {
    grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
        const completed = columnDefs.find(colDef => colDef.colId === FIELD_MAPPING.completed)!
        const components: ICompletionCellComponents = {
            //a star in place of Fluent's round check; className animates a fresh tick
            checkbox: { onRenderCheck: props => <Icon iconName={props.checked ? 'FavoriteStarFill' : 'FavoriteStar'} className={props.className} /> },
        }
        //only the check is replaced: ticking and saving work as before
        completed.cellRendererParams = { ...completed.cellRendererParams, components }
    })
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: sortChecklistProvider(provider, FIELD_MAPPING) })}>
    <DatasetControl.Body>
        <Checklist fieldMapping={FIELD_MAPPING} onSetup={onSetup} />
    </DatasetControl.Body>
</DatasetControl>
`

export const SAVE_LOG_CODE = `${FIELD_MAPPING}

const GridExample = () => {
    const [log, setLog] = React.useState<string[]>([])
    const write = (line: string) => setLog(lines => [line, ...lines].slice(0, 10))

    //the provider reports every save and delete the checklist asks of it
    React.useEffect(() => {
        const removeSaved = provider.addEventListener('onAfterRecordSaved', result => write(\`Saved \${provider.getRecordsMap()[result.recordId]?.getValue('name')}: \${result.fields.join(', ')}\`))
        const removeDeleted = provider.addEventListener('onAfterRecordsDeleted', results => write(\`Deleted \${results.length} item\`))
        return () => {
            removeSaved()
            removeDeleted()
        }
    }, [])

    return <>
        <DatasetControl onLoad={async () => ({ provider: sortChecklistProvider(provider, FIELD_MAPPING) })}>
            <DatasetControl.Body>
                <Checklist fieldMapping={FIELD_MAPPING} />
            </DatasetControl.Body>
        </DatasetControl>
        <Text style={{ whiteSpace: 'pre-line' }}>{log.join('\\n')}</Text>
    </>
}
`

export const ITEM_PANEL_CODE = `${FIELD_MAPPING}

const GridExample = () => {
    const [openedItem, setOpenedItem] = React.useState<IRecord>()

    const onSetup = (grid: IGrid) => {
        grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
            const name = columnDefs.find(colDef => colDef.colId === FIELD_MAPPING.name)!
            //draws the names as links
            name.context = { ...name.context, isPrimary: true }
        })
        grid.hooks.openRecord.add(request => {
            request.isHandled = true
            setOpenedItem(request.record)
        })
    }

    return <>
        <DatasetControl onLoad={async () => ({ provider: sortChecklistProvider(provider, FIELD_MAPPING) })}>
            <DatasetControl.Body>
                <Checklist fieldMapping={FIELD_MAPPING} onSetup={onSetup} />
            </DatasetControl.Body>
        </DatasetControl>
        <Panel isOpen={!!openedItem} headerText={openedItem?.getValue('name')} onDismiss={() => setOpenedItem(undefined)}>
            {/* the checklist's own record, saved through its provider as it changes */}
            {/* a new key mounts a new form for another item */}
            {openedItem && <Form.Root key={openedItem.getRecordId()} onLoad={async () => ({ record: openedItem })} enableAutoSave>
                <Form.Section label='Item'>
                    <Form.Field name='name'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                    <Form.Field name='owner'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                    <Form.Field name='duedate'><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                </Form.Section>
            </Form.Root>}
        </Panel>
    </>
}
`

/** A product launch's checklist. */
export const LaunchPlanExample = () => <GridExampleRunner seedCode={LAUNCH_PLAN_CODE} onCreateProvider={createLaunchPlanProvider} />

/** The least a checklist needs: two items and a field mapping. */
export const BasicUsageExample = () => <GridExampleRunner seedCode={BASIC_USAGE_CODE} tabs={['preview', 'code']} />

/** The same list without the editing module. */
export const ReadOnlyExample = () => <GridExampleRunner seedCode={READ_ONLY_CODE} onCreateProvider={createLaunchPlanProvider} />

/** A checklist whose grid adds themes, locks, commands and totals. */
export const ReleaseBoardExample = () => <GridExampleRunner seedCode={RELEASE_BOARD_CODE} onCreateProvider={createLaunchPlanProvider} />

/** Every save and delete the checklist asks of its provider, logged under it. */
export const SaveLogExample = () => <GridExampleRunner seedCode={SAVE_LOG_CODE} onCreateProvider={createLaunchPlanProvider} />

/** A star in place of the completion cell's check. */
export const CustomCheckExample = () => <GridExampleRunner seedCode={CUSTOM_CHECK_CODE} onCreateProvider={createLaunchPlanProvider} />

/** Item names as links that open the item in a form. */
export const ItemPanelExample = () => <GridExampleRunner seedCode={ITEM_PANEL_CODE} onCreateProvider={createLaunchPlanProvider} />
