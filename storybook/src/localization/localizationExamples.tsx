import React from 'react'
import { GridExampleRunner } from '../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from '../dataset-control/examples/shared'
import { TASKS_FILE } from '../task-grid/examples/shared'

const SWITCH_LANGUAGE_CODE = `import { IDealViewData, loadDeals, loadDealViews, saveDealViewData } from './views'

const LANGUAGES = [
    { key: 'en', text: 'English' },
    { key: 'cs', text: 'Čeština' },
    { key: 'own', text: 'Your own wording' },
]

const OWN_WORDING: { [key: string]: string } = {
    'quickFind.searchPlaceholder': 'Find a deal by name...',
    'viewSwitcher.ungroupedViewsHeader': 'Team views',
    'gridSorting.menuSection': 'Order by',
    'gridAggregation.menuSection': 'Summaries',
    'pagination.currentPage': 'Sheet {{ number }}',
    'grid.noRecordsFound': 'No deal matches your search.',
}

const styles = mergeStyleSets({
    wording: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8, padding: 12, border: '1px solid #edebe9', borderRadius: 4 },
})

const GridExample = () => {
    const [language, setLanguage] = React.useState('cs')
    const [draft, setDraft] = React.useState(OWN_WORDING)
    const [ownWording, setOwnWording] = React.useState(OWN_WORDING)
    const labels = React.useMemo(() => language === 'cs' ? CZECH_LABELS : language === 'own' ? ownWording : {}, [language, ownWording])
    const controlModules = React.useMemo(() => [createLocalStorageUserQueriesModule<IDealViewData>({ storageKey: 'docs.localizedDealViews' })], [])
    const gridModules = React.useMemo(() => [
        createClientSideRowModelModule(),
        createRowSelectionModule({ mode: 'multiple' }),
        createEditingModule(),
        createSortingModule(),
        createFilteringModule(),
        createAggregationModule(),
    ], [])

    return <Stack tokens={{ childrenGap: 12 }}>
        <ChoiceGroup selectedKey={language} options={LANGUAGES} onChange={(_, option) => setLanguage(String(option?.key))} styles={{ flexContainer: { display: 'flex', gap: 24 } }} />
        {language === 'own' && <Stack horizontal verticalAlign='end' tokens={{ childrenGap: 12 }}>
            <div className={styles.wording} style={{ flex: 1 }}>
                {Object.keys(draft).map(key => <TextField key={key} label={key} value={draft[key]} onChange={(_, value) => setDraft({ ...draft, [key]: value ?? '' })} />)}
            </div>
            <PrimaryButton text='Apply' onClick={() => setOwnWording(draft)} />
        </Stack>}
        <LocalizationProvider labels={labels}>
            {/* column menus and totals take their strings as the control mounts */}
            <DatasetControl key={language + JSON.stringify(ownWording)} modules={controlModules} onLoadViews={loadDealViews} onLoad={loadDeals} onMounted={saveDealViewData} height='460px'>
                <DatasetControl.Header>
                    <DatasetControl.Header.Start>
                        <DatasetControl.ViewSwitcher>
                            <DatasetControl.UserQueries />
                        </DatasetControl.ViewSwitcher>
                    </DatasetControl.Header.Start>
                    <DatasetControl.Header.End>
                        <DatasetControl.EditColumns />
                        <DatasetControl.QuickFind />
                    </DatasetControl.Header.End>
                </DatasetControl.Header>
                <DatasetControl.Body>
                    <Grid modules={gridModules} />
                </DatasetControl.Body>
                <DatasetControl.Footer>
                    <DatasetControl.Footer.Start>
                        <DatasetControl.PageSizeSwitcher />
                    </DatasetControl.Footer.Start>
                    <DatasetControl.Footer.End>
                        <DatasetControl.Pagination />
                    </DatasetControl.Footer.End>
                </DatasetControl.Footer>
            </DatasetControl>
        </LocalizationProvider>
    </Stack>
}
`

const CZECH_TASKS_CODE = `import { createLoadTasks, createTaskDatabase, loadTaskViews } from './tasks'

const labels = { ...CZECH_LABELS, 'taskGrid.addChild': 'Přidat podúkol' }

const GridExample = () => {
    const database = React.useMemo(createTaskDatabase, [])
    const loadTasks = React.useMemo(() => createLoadTasks(database), [database])
    const gridModules = React.useMemo(() => [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule(), createSortingModule()], [])
    const controlModules = React.useMemo(() => [
        createMemoryProjectModule({ project: { id: 'website', name: 'Website Redesign', startDate: dayjs('2025-10-01'), endDate: dayjs('2026-01-31') } }),
        createMemoryDependenciesModule({ dependencies: DEPENDENCIES }),
    ], [])
    const ganttModules = React.useMemo(() => [
        createLibraryModule(),
        createMarkersModule(),
        createMemoryNonWorkingDaysModule({ nonWorkingDays: NON_WORKING_DAYS }),
        createBarDraggingModule(),
        createTaskTooltipModule({ statusColumnName: 'statuscode' }),
        createLinksModule(),
    ], [])

    return <LocalizationProvider labels={labels}>
        <TaskDatasetControl modules={controlModules} enableCreation enableEditing enableDeletion onLoadViews={loadTaskViews} onLoad={loadTasks} height='520px'>
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <DatasetControl.ViewSwitcher />
                    <TaskGantt.ZoomSlider />
                </DatasetControl.Header.Start>
                <DatasetControl.Header.End>
                    <TaskDatasetControl.Ribbon />
                    <TaskDatasetControl.Settings />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <TaskGantt.Split>
                    <TaskGrid modules={gridModules} />
                    <TaskGantt modules={ganttModules} />
                </TaskGantt.Split>
            </DatasetControl.Body>
        </TaskDatasetControl>
    </LocalizationProvider>
}
`

export const SwitchLanguageExample = () => <GridExampleRunner seedCode={withFiles(SWITCH_LANGUAGE_CODE, VIEWS_FILE)} />
export const CzechTasksExample = () => <GridExampleRunner seedCode={withFiles(CZECH_TASKS_CODE, TASKS_FILE)} />
