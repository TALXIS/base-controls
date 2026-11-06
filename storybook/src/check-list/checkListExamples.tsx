import React from 'react'
import { GridExampleRunner } from '../grid/GridExampleRunner'
import { createLaunchPlanProvider } from '../grid/data'

const FIELD_MAPPING = `const FIELD_MAPPING: ICheckListFieldMapping = {
    name: 'name',
    stackRank: 'stackrank',
    completed: 'completed',
}`

export const LAUNCH_PLAN_CODE = `${FIELD_MAPPING}

//provider holds the launch plan, as the Data tab shows
const GridExample = () => <DatasetControl onLoad={async () => ({ provider: sortCheckListProvider(provider, FIELD_MAPPING) })}>
    <DatasetControl.Body>
        <CheckList fieldMapping={FIELD_MAPPING} />
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
const GridExample = () => <DatasetControl onLoad={async () => ({ provider: sortCheckListProvider(createLaunchPlan(), FIELD_MAPPING) })}>
    <DatasetControl.Body>
        <CheckList fieldMapping={FIELD_MAPPING} />
    </DatasetControl.Body>
</DatasetControl>
`

export const READ_ONLY_CODE = `${FIELD_MAPPING}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: sortCheckListProvider(provider, FIELD_MAPPING) })}>
    <DatasetControl.Body>
        <CheckList fieldMapping={FIELD_MAPPING} modules={[]} />
    </DatasetControl.Body>
</DatasetControl>
`

export const RELEASE_BOARD_CODE = `${FIELD_MAPPING}

const OVERDUE = '#d13438'
//the signed-in user
const CURRENT_USER = 'Anna Novak'

const GridExample = () => {
    const gridRef = React.useRef<IGrid>()
    //the checklist tells its items from the row that adds one
    const checkList = () => gridRef.current?.modules.find('checkList')
    const isDone = (record: IRecord) => !!checkList()?.isCompleted(record)
    const isOverdue = (record: IRecord) => !isDone(record) && !!record.getValue('duedate') && dayjs(record.getValue('duedate')).isBefore(dayjs(), 'day')

    //a finished item's name and due date cannot be edited
    const lockWhenDone = (result: IGridLock, { record }: { record: IRecord }) => {
        if (isDone(record)) {
            result.isLocked = true
        }
    }

    const assignToMe = (record: IRecord) => {
        //a grid field saves at once, as the editing module auto-saves
        gridRef.current?.services.get('fields').get(record, 'owner').setValue(CURRENT_USER)
    }

    return <DatasetControl onLoad={async () => ({ provider: sortCheckListProvider(provider, FIELD_MAPPING) })}>
        <DatasetControl.Body>
            <CheckList
                fieldMapping={FIELD_MAPPING}
                //the default editing, plus totals for the estimates
                modules={[createEditingModule({ autoSave: true }), createAggregationModule()]}
                colDefs={{
                    name: { context: { cell: { onGetLock: lockWhenDone } } },
                    owner: {
                        context: {
                            cell: {
                                onGetCommands: (result, { record }) => {
                                    if (checkList()?.isItem(record) && !isDone(record) && !record.getValue('owner')) {
                                        result.items.push({ key: 'assign', text: 'Assign to me', iconProps: { iconName: 'AddFriend' }, onClick: () => assignToMe(record) })
                                    }
                                },
                            },
                        },
                    },
                    duedate: {
                        context: {
                            cell: {
                                onGetLock: lockWhenDone,
                                onGetTheme: (builder, { record }) => {
                                    if (isOverdue(record)) {
                                        builder.tint(OVERDUE)
                                    }
                                },
                            },
                        },
                    },
                }}
                onSetup={grid => gridRef.current = grid} />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const CUSTOM_CHECK_CODE = `${FIELD_MAPPING}

//a star in place of Fluent's round check; className animates a fresh tick
const StarCheck = (props: ICheckProps) => {
    const theme = useTheme()
    return <Icon
        iconName={props.checked ? 'FavoriteStarFill' : 'FavoriteStar'}
        className={props.className}
        styles={{ root: { fontSize: 18, color: props.checked ? theme.palette.yellowDark : theme.palette.neutralSecondary } }} />
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: sortCheckListProvider(provider, FIELD_MAPPING) })}>
    <DatasetControl.Body>
        <CheckList
            fieldMapping={FIELD_MAPPING}
            colDefs={{
                //only the check is replaced: ticking and saving work as before
                completed: { cellRendererParams: { components: { checkbox: { onRenderCheck: props => <StarCheck {...props} /> } } } },
            }} />
    </DatasetControl.Body>
</DatasetControl>
`

export const SAVE_LOG_CODE = `${FIELD_MAPPING}

const GridExample = () => {
    const [log, setLog] = React.useState<string[]>([])
    //a deleted item is gone from the provider by the time its delete is reported
    const names = React.useRef<{ [recordId: string]: string }>({})
    const write = (line: string) => setLog(lines => [line, ...lines].slice(0, 10))

    React.useEffect(() => {
        const remember = () => provider.getRecords().forEach(record => names.current[record.getRecordId()] = record.getValue('name'))
        const onSaved = (result: IRecordSaveOperationResult) => {
            remember()
            write(\`Saved \${names.current[result.recordId]}: \${result.fields.join(', ')}\`)
        }
        const onDeleted = (results: IRecordDeleteOperationResult[]) => results.forEach(result => write(\`Deleted \${names.current[result.recordId]}\`))
        remember()
        //the provider reports every save and delete the checklist asks of it
        provider.addEventListener('onNewDataLoaded', remember)
        provider.addEventListener('onAfterRecordSaved', onSaved)
        provider.addEventListener('onAfterRecordsDeleted', onDeleted)
        return () => {
            provider.removeEventListener('onNewDataLoaded', remember)
            provider.removeEventListener('onAfterRecordSaved', onSaved)
            provider.removeEventListener('onAfterRecordsDeleted', onDeleted)
        }
    }, [])

    return <Stack horizontal tokens={{ childrenGap: 24 }}>
        <Stack.Item grow>
            <DatasetControl onLoad={async () => ({ provider: sortCheckListProvider(provider, FIELD_MAPPING) })}>
                <DatasetControl.Body>
                    <CheckList fieldMapping={FIELD_MAPPING} />
                </DatasetControl.Body>
            </DatasetControl>
        </Stack.Item>
        <Stack styles={{ root: { width: 280 } }} tokens={{ childrenGap: 4 }}>
            <Text variant='mediumPlus'>What the provider was asked to save</Text>
            {log.length === 0 && <Text variant='small'>Tick, rename, drag, add or delete an item.</Text>}
            {log.map((line, index) => <Text key={index} variant='small'>{line}</Text>)}
        </Stack>
    </Stack>
}
`

export const ITEM_PANEL_CODE = `${FIELD_MAPPING}

const SECTIONS = [
    { label: 'Item', columnNames: ['name', 'completed', 'priority'] },
    { label: 'Planning', columnNames: ['owner', 'duedate', 'estimate'] },
]

//edits the checklist's own record and saves each change through its provider
const ItemForm = (props: { item: IRecord }) => {
    return <Form.Root onLoad={async () => ({ record: props.item })} autoSave>
        {SECTIONS.map(section => <Form.Section key={section.label} label={section.label} cellLabelPosition='Top'>
            {section.columnNames.map(columnName => <Form.Field key={columnName} name={columnName}>
                <Form.Cell>
                    <Form.Control />
                </Form.Cell>
            </Form.Field>)}
        </Form.Section>)}
    </Form.Root>
}

const GridExample = () => {
    const [openedItem, setOpenedItem] = React.useState<IRecord>()
    const close = () => setOpenedItem(undefined)

    return <>
        <DatasetControl onLoad={async () => ({ provider: sortCheckListProvider(provider, FIELD_MAPPING) })}>
            <DatasetControl.Body>
                <CheckList
                    fieldMapping={FIELD_MAPPING}
                    //draws the names as links
                    colDefs={{ name: { context: { isPrimary: true } } }}
                    onOpenRecord={({ record }) => setOpenedItem(record)} />
            </DatasetControl.Body>
        </DatasetControl>
        <Panel isOpen={!!openedItem} headerText={openedItem?.getValue('name')} type={PanelType.medium} isLightDismiss onDismiss={close} onRenderFooterContent={() => <DefaultButton text='Close' onClick={close} />}>
            {/* a new key mounts a new form for another item */}
            {openedItem && <ItemForm key={openedItem.getRecordId()} item={openedItem} />}
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

/** Every save and delete the checklist asks of its provider, logged beside it. */
export const SaveLogExample = () => <GridExampleRunner seedCode={SAVE_LOG_CODE} onCreateProvider={createLaunchPlanProvider} />

/** A star in place of the completion cell's check. */
export const CustomCheckExample = () => <GridExampleRunner seedCode={CUSTOM_CHECK_CODE} onCreateProvider={createLaunchPlanProvider} />

/** Item names as links that open the item in a form. */
export const ItemPanelExample = () => <GridExampleRunner seedCode={ITEM_PANEL_CODE} onCreateProvider={createLaunchPlanProvider} />
