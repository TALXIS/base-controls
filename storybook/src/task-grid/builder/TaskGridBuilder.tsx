import React from 'react'
import { Checkbox, ChoiceGroup, IChoiceGroupOption, Link, Text, Toggle, useTheme } from '@fluentui/react'
import { addons } from 'storybook/internal/preview-api'
import { NAVIGATE_URL } from 'storybook/internal/core-events'
import { GridExampleRunner, IRunnerTab } from '../../grid/GridExampleRunner'
import { createTaskGridFiles, ITaskGridChoices, STORE_FILE_NAMES, TaskGanttFeature, TaskGridFeature, TaskGridStore } from './createTaskGridFiles'
import { getTaskGridBuilderStyles } from './styles'

interface IGuidePage {
    title: string
    href: string
}

const GUIDE: { [page: string]: IGuidePage } = {
    data: { title: 'Connect your data', href: '?path=/docs/controls-taskgrid-guide-connect-your-data--overview' },
    editing: { title: 'Views, tree and editing', href: '?path=/docs/controls-taskgrid-guide-views-tree-and-editing--overview' },
    features: { title: 'Features', href: '?path=/docs/controls-taskgrid-guide-features--overview' },
    gantt: { title: 'The Gantt', href: '?path=/docs/controls-taskgrid-guide-the-gantt--overview' },
}

interface IStoreOption {
    key: TaskGridStore
    label: string
    description: string
}

const STORES: IStoreOption[] = [
    { key: 'memory', label: 'Memory', description: 'Tables you keep in the page, for prototypes and tests.' },
    { key: 'dataverse', label: 'Dataverse', description: 'Tables of your own in Dataverse, from a PCF control.' },
    { key: 'talxis', label: 'TALXIS', description: 'The TALXIS project tables, which its modules know.' },
    { key: 'api', label: 'Your own API', description: 'Stores you write over the API your app calls.' },
]

interface IFeatureOption<TKey> {
    key: TKey
    label: string
    description: string
    guide: IGuidePage
    /** The task feature this one does nothing without. */
    requires?: TaskGridFeature
    /** The stores it has a module for; every store when left out. */
    stores?: TaskGridStore[]
}

const FEATURES: IFeatureOption<TaskGridFeature>[] = [
    { key: 'editing', label: 'Editing', description: 'Edit opens the selected tasks, and cells edit in place.', guide: GUIDE.editing },
    { key: 'creation', label: 'Creation', description: 'New in the ribbon, and a + on each row for a subtask.', guide: GUIDE.editing },
    { key: 'deletion', label: 'Deletion', description: 'Delete removes the selected tasks with their subtasks.', guide: GUIDE.editing },
    { key: 'dragging', label: 'Row dragging', description: 'Moves a task by dragging its row. Needs editing.', guide: GUIDE.editing, requires: 'editing' },
    { key: 'userViews', label: 'User views', description: 'Users save views of their own, with sorting and filters.', guide: GUIDE.editing },
    { key: 'project', label: 'Project', description: 'Loads the project the tasks belong to.', guide: GUIDE.features },
    { key: 'customColumns', label: 'Custom columns', description: 'Users add columns of their own in Edit columns.', guide: GUIDE.features, stores: ['memory', 'talxis', 'api'] },
    { key: 'lookupMany', label: 'Lookup many', description: 'A column holding several people for each task.', guide: GUIDE.features },
    { key: 'templates', label: 'Templates', description: 'Creates a task with its subtasks in one go. Needs creation.', guide: GUIDE.features, requires: 'creation', stores: ['memory', 'api'] },
    { key: 'checklist', label: 'Checklist', description: 'How far each task\'s checklist has got, in a column.', guide: GUIDE.features, stores: ['memory', 'talxis', 'api'] },
    { key: 'dependencies', label: 'Dependencies', description: 'Counts what each task waits on, and what waits on it.', guide: GUIDE.features },
]

const GANTT_FEATURES: IFeatureOption<TaskGanttFeature>[] = [
    { key: 'timelineEditing', label: 'Editing on the timeline', description: 'Drag bars to new dates, and Ctrl+drag to draw a task. Needs editing.', guide: GUIDE.gantt, requires: 'editing' },
    { key: 'taskSelection', label: 'Task selection', description: 'Click bars to select their tasks.', guide: GUIDE.gantt },
    { key: 'tooltip', label: 'Tooltip', description: 'A task\'s name, progress and dates over its bar.', guide: GUIDE.gantt },
    { key: 'markers', label: 'Markers', description: 'Marks today, and the project\'s start and end.', guide: GUIDE.gantt },
    { key: 'nonWorkingDays', label: 'Non-working days', description: 'Shades weekends and leaves them out of durations.', guide: GUIDE.gantt },
    { key: 'links', label: 'Links', description: 'Draws dependencies as arrows the user can add. Needs dependencies.', guide: GUIDE.gantt, requires: 'dependencies' },
]

const TABS: IRunnerTab[] = ['preview', 'code']

//links open in the manager, not in the docs iframe
const onGuideClick = (event: React.MouseEvent<HTMLElement>, href: string) => {
    if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return
    }
    event.preventDefault()
    addons.getChannel().emit(NAVIGATE_URL, href)
}

const GuideLink = (props: { page: IGuidePage }) => <>See <Link href={props.page.href} onClick={event => onGuideClick(event, props.page.href)}>{props.page.title}</Link>.</>

const toggle = <T,>(items: T[], item: T, isChecked: boolean) => isChecked ? [...items, item] : items.filter(candidate => candidate !== item)

/** Builds a task grid from the store and features the reader picks, live beside its code. */
export const TaskGridBuilder = () => {
    const theme = useTheme()
    const styles = React.useMemo(() => getTaskGridBuilderStyles(theme), [theme])
    const [store, setStore] = React.useState<TaskGridStore>('memory')
    const [features, setFeatures] = React.useState<TaskGridFeature[]>(['editing', 'creation', 'deletion', 'dragging'])
    const [isGanttEnabled, setGanttEnabled] = React.useState(false)
    const [ganttFeatures, setGanttFeatures] = React.useState<TaskGanttFeature[]>(['timelineEditing', 'tooltip', 'markers'])
    const [tab, setTab] = React.useState<IRunnerTab>('preview')

    const isAvailable = (option: IFeatureOption<TaskGridFeature>) => !option.stores || option.stores.includes(store)
    const choices: ITaskGridChoices = {
        store,
        features: FEATURES.filter(option => features.includes(option.key) && isAvailable(option)).map(option => option.key),
        isGanttEnabled,
        ganttFeatures: isGanttEnabled ? GANTT_FEATURES.filter(option => ganttFeatures.includes(option.key)).map(option => option.key) : [],
    }
    const isRequired = (feature: TaskGridFeature) => [...FEATURES.filter(option => choices.features.includes(option.key)), ...GANTT_FEATURES.filter(option => choices.ganttFeatures.includes(option.key))].some(option => option.requires === feature)
    const files = React.useMemo(() => createTaskGridFiles(choices), [JSON.stringify(choices)])
    const storeLabel = STORES.find(option => option.key === store)!.label

    const addRequirement = (option: IFeatureOption<TaskGridFeature | TaskGanttFeature>, isChecked: boolean) => {
        if (isChecked && option.requires) {
            setFeatures(current => current.includes(option.requires!) ? current : [...current, option.requires!])
        }
    }

    const storeOptions: IChoiceGroupOption[] = STORES.map(option => ({
        key: option.key,
        text: option.label,
        onRenderField: (props, render) => <div className={styles.option}>
            {render!(props)}
            <Text className={styles.description}>{option.description}</Text>
        </div>,
    }))

    const renderFeature = (option: IFeatureOption<TaskGridFeature>) => {
        const isOptionAvailable = isAvailable(option)
        return <div key={option.key} className={styles.option}>
            <Checkbox
                label={option.label}
                checked={choices.features.includes(option.key)}
                disabled={!isOptionAvailable || isRequired(option.key)}
                onChange={(_, isChecked) => {
                    setFeatures(current => toggle(current, option.key, !!isChecked))
                    addRequirement(option, !!isChecked)
                }}
            />
            <Text className={styles.description}>
                {isOptionAvailable ? option.description : `No ${storeLabel} module.`} <GuideLink page={option.guide} />
            </Text>
        </div>
    }

    const renderGanttFeature = (option: IFeatureOption<TaskGanttFeature>) => <div key={option.key} className={styles.option}>
        <Checkbox
            label={option.label}
            checked={ganttFeatures.includes(option.key)}
            onChange={(_, isChecked) => {
                setGanttFeatures(current => toggle(current, option.key, !!isChecked))
                addRequirement(option, !!isChecked)
            }}
        />
        <Text className={styles.description}>{option.description} <GuideLink page={option.guide} /></Text>
    </div>

    return <div className={styles.root}>
        <div className={styles.section}>
            <Text className={styles.heading}>Where the tasks are kept</Text>
            <ChoiceGroup selectedKey={store} options={storeOptions} onChange={(_, option) => setStore(option!.key as TaskGridStore)} styles={{ flexContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px 20px' } }} />
            <Text className={styles.note}>
                {store === 'memory'
                    ? <>The preview and the code are the same. <GuideLink page={GUIDE.data} /></>
                    : <>{storeLabel} does not run here: the preview runs the same choices in memory, and <i>{STORE_FILE_NAMES[store]}</i> under Code holds the code for your app. <GuideLink page={GUIDE.data} /></>}
            </Text>
        </div>
        <div className={styles.section}>
            <Text className={styles.heading}>Features</Text>
            <div className={styles.options}>{FEATURES.map(renderFeature)}</div>
        </div>
        <div className={styles.section}>
            <Toggle inlineLabel label='Gantt beside the grid' checked={isGanttEnabled} onChange={(_, isChecked) => setGanttEnabled(!!isChecked)} />
            <Text className={styles.note}>The tasks on a timeline, row for row with the grid. <GuideLink page={GUIDE.gantt} /></Text>
            {isGanttEnabled && <div className={styles.options}>{GANTT_FEATURES.map(renderGanttFeature)}</div>}
        </div>
        <div className={styles.runner}>
            <GridExampleRunner key={JSON.stringify(choices)} seedCode={files} tabs={TABS} defaultTab={tab} onTabChange={setTab} />
        </div>
    </div>
}
