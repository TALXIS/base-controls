import React from 'react'
import { GridExampleRunner } from '../grid/GridExampleRunner'
import { createLaunchPlanProvider } from '../grid/data'

const FIELD_MAPPING = `const FIELD_MAPPING: ICheckListFieldMapping = {
    name: 'name',
    stackRank: 'stackrank',
    completed: 'completed',
}`

export const LAUNCH_PLAN_CODE = `${FIELD_MAPPING}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: sortCheckListProvider(provider, FIELD_MAPPING) })}>
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

const OVERDUE = '#fde7e9'

const GridExample = () => {
    const gridRef = React.useRef<IGrid>()
    //the checklist tells its items from the row that adds one
    const checkList = () => gridRef.current?.modules.find('checkList')
    const isDone = (record: IRecord) => !!checkList()?.isCompleted(record)
    const isOverdue = (record: IRecord) => !isDone(record) && !!record.getValue('duedate') && dayjs(record.getValue('duedate')).isBefore(dayjs(), 'day')

    const lockWhenDone = (result: IGridLock, { record }: { record: IRecord }) => {
        if (isDone(record)) {
            result.isLocked = true
        }
    }

    const assignToMe = (record: IRecord) => {
        gridRef.current?.services.get('fields').get(record, 'owner').setValue('John Doe')
    }

    return <DatasetControl onLoad={async () => ({ provider: sortCheckListProvider(provider, FIELD_MAPPING) })}>
        <DatasetControl.Body>
            <CheckList
                fieldMapping={FIELD_MAPPING}
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
                                onGetTheme: (theme, { record }) => {
                                    if (isOverdue(record)) {
                                        theme.colors.background = OVERDUE
                                        theme.colors.text = getTextColorForBackground(OVERDUE)
                                    }
                                },
                            },
                        },
                    },
                }}
                onReady={grid => gridRef.current = grid} />
        </DatasetControl.Body>
    </DatasetControl>
}
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

const createItemStrategy = (item: IRecord) => new MemoryStrategy({
    onGetColumns: () => item.getDataProvider().getColumns(),
    onGetData: () => ({ ...item.getRawData() }),
    onGetMetadata: () => ({ PrimaryIdAttribute: 'itemid', PrimaryNameAttribute: 'name' }),
})

const ItemForm = (props: { item: IRecord }) => {
    const strategy = React.useMemo(() => createItemStrategy(props.item), [props.item])
    //every change is saved into the item the checklist shows
    const saveChange = async (columnName: string, value: unknown) => {
        props.item.setValue(columnName, value)
        await props.item.save()
    }

    return <Form.Root strategy={strategy} onFieldValueChanged={(columnName: string, value: unknown) => { saveChange(columnName, value) }}>
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
                    colDefs={{ name: { context: { isPrimary: true } } }}
                    onOpenRecord={({ record }) => setOpenedItem(record)} />
            </DatasetControl.Body>
        </DatasetControl>
        <Panel isOpen={!!openedItem} headerText={openedItem?.getValue('name')} type={PanelType.medium} isLightDismiss onDismiss={close} onRenderFooterContent={() => <DefaultButton text='Close' onClick={close} />}>
            {openedItem && <ItemForm key={openedItem.getRecordId()} item={openedItem} />}
        </Panel>
    </>
}
`

/** A product launch's checklist. */
export const LaunchPlanExample = () => <GridExampleRunner seedCode={LAUNCH_PLAN_CODE} onCreateProvider={createLaunchPlanProvider} />

/** The same list without the editing module. */
export const ReadOnlyExample = () => <GridExampleRunner seedCode={READ_ONLY_CODE} onCreateProvider={createLaunchPlanProvider} />

/** A checklist whose grid adds themes, locks, commands and totals. */
export const ReleaseBoardExample = () => <GridExampleRunner seedCode={RELEASE_BOARD_CODE} onCreateProvider={createLaunchPlanProvider} />

/** Every save and delete the checklist asks of its provider, logged beside it. */
export const SaveLogExample = () => <GridExampleRunner seedCode={SAVE_LOG_CODE} onCreateProvider={createLaunchPlanProvider} />

/** Item names as links that open the item in a form. */
export const ItemPanelExample = () => <GridExampleRunner seedCode={ITEM_PANEL_CODE} onCreateProvider={createLaunchPlanProvider} />
