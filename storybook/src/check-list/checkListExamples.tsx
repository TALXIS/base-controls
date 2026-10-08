import React from 'react'
import { GridExampleRunner } from '../grid/GridExampleRunner'
import { createLaunchPlanProvider } from '../grid/data'

const FIELD_MAPPING = `const FIELD_MAPPING: ICheckListFieldMapping = {
    name: 'name',
    stackRank: 'stackrank',
    completed: 'completed',
}`

export const LAUNCH_PLAN_CODE = `${FIELD_MAPPING}

const GridExample = () => <CheckList provider={provider} fieldMapping={FIELD_MAPPING} />
`

export const READ_ONLY_CODE = `${FIELD_MAPPING}

const GridExample = () => <CheckList provider={provider} fieldMapping={FIELD_MAPPING} modules={{ editing: undefined }} />
`

export const RELEASE_BOARD_CODE = `${FIELD_MAPPING}

const OVERDUE = '#fde7e9'

//the row at the bottom that adds an item belongs to a provider of its own
const isItem = (record: IRecord) => record.getDataProvider() === provider
const isDone = (record: IRecord) => record.getValue('completed') === '1'
const isOverdue = (record: IRecord) => !isDone(record) && !!record.getValue('duedate') && dayjs(record.getValue('duedate')).isBefore(dayjs(), 'day')

const lockWhenDone = (result: IGridLock, { record }: { record: IRecord }) => {
    if (isDone(record)) {
        result.isLocked = true
    }
}

const GridExample = () => {
    const runtime = React.useRef<IGridRuntime>()

    const assignToMe = (record: IRecord) => {
        runtime.current?.services.get('fields').get(record, 'owner').setValue('John Doe')
    }

    return <CheckList
        provider={provider}
        fieldMapping={FIELD_MAPPING}
        modules={{ aggregation: createAggregationModule() }}
        colDefs={{
            name: { context: { cell: { onGetLock: lockWhenDone } } },
            owner: {
                context: {
                    cell: {
                        onGetCommands: (result, { record }) => {
                            if (isItem(record) && !isDone(record) && !record.getValue('owner')) {
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
        onGridReady={gridRuntime => runtime.current = gridRuntime} />
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
        <CheckList
            provider={provider}
            fieldMapping={FIELD_MAPPING}
            colDefs={{ name: { context: { isPrimary: true } } }}
            onOpenRecord={({ record }) => setOpenedItem(record)} />
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

/** Item names as links that open the item in a form. */
export const ItemPanelExample = () => <GridExampleRunner seedCode={ITEM_PANEL_CODE} onCreateProvider={createLaunchPlanProvider} />
