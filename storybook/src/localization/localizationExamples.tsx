import React from 'react'
import { GridExampleRunner } from '../grid/GridExampleRunner'
import { TASKS_FILE } from '../task-grid/examples/shared'

const SWITCH_LANGUAGE_CODE = `import { createLoadTasks, createTaskDatabase, loadTaskViews } from './tasks'
import { JAPANESE_LABELS } from './japanese'

//the culture formats dates and numbers, the labels translate the strings
const LANGUAGES = [
    { key: 'en', text: 'English', lcid: 1033, culture: 'en-US' },
    { key: 'cs', text: 'Čeština', lcid: 1029, culture: 'cs-CZ' },
    { key: 'ja', text: '日本語', lcid: 1041, culture: 'ja-JP' },
    { key: 'own', text: 'Your own wording', lcid: 1033, culture: 'en-US' },
]

const OWN_WORDING: { [key: string]: string } = {
    'taskGrid.new': 'Add work',
    'taskGrid.addChild': 'Break it down',
    'taskGrid.showHierarchy': 'Show the plan as a tree',
    'gantt.zoomToFit': 'Show everything',
    'markers.today': 'Now',
    'taskTooltip.duration': 'Takes',
}

const styles = mergeStyleSets({
    wording: { flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8, padding: 12, border: '1px solid #edebe9', borderRadius: 4 },
})

interface IPlanProps {
    lcid: number
    culture: string
    labels: { [key: string]: string }
}

//memoized, so typing a wording does not draw the plan again
const Plan = React.memo((props: IPlanProps) => {
    const database = React.useMemo(createTaskDatabase, [])
    const loadTasks = React.useMemo(() => createLoadTasks(database), [database])
    const gridModules = React.useMemo(() => [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule(), createSortingModule(), createFilteringModule()], [])
    const controlModules = React.useMemo(() => [
        createMemoryProjectModule({ project: { id: 'website', name: 'Website Redesign', startDate: dayjs('2025-10-01'), endDate: dayjs('2026-01-31') } }),
        createTaskDraggingModule(),
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

    return <PcfContextProvider userSettings={{ lcid: props.lcid, formatInfoCultureName: props.culture }}>
        <LocalizationProvider labels={props.labels}>
            <TaskDatasetControl modules={controlModules} enableCreation enableEditing enableDeletion onLoadViews={loadTaskViews} onLoad={loadTasks} height='520px'>
                <DatasetControl.Header>
                    <DatasetControl.Header.Start>
                        <DatasetControl.ViewSwitcher />
                        <TaskGantt.ZoomSlider />
                    </DatasetControl.Header.Start>
                    <DatasetControl.Header.End>
                        <TaskDatasetControl.Ribbon />
                        <DatasetControl.QuickFind />
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
    </PcfContextProvider>
})

const GridExample = () => {
    const [languageKey, setLanguageKey] = React.useState('cs')
    const [draft, setDraft] = React.useState(OWN_WORDING)
    const [ownWording, setOwnWording] = React.useState(OWN_WORDING)
    const language = LANGUAGES.find(candidate => candidate.key === languageKey)!
    const labels = React.useMemo(() => ({ en: {}, cs: CZECH_LABELS, ja: JAPANESE_LABELS, own: ownWording }[languageKey] ?? {}), [languageKey, ownWording])

    return <Stack tokens={{ childrenGap: 12 }}>
        <ChoiceGroup selectedKey={languageKey} options={LANGUAGES} onChange={(_, option) => setLanguageKey(String(option?.key))} styles={{ flexContainer: { display: 'flex', gap: 24 } }} />
        {languageKey === 'own' && <Stack horizontal verticalAlign='end' tokens={{ childrenGap: 12 }}>
            <div className={styles.wording}>
                {Object.keys(draft).map(key => <TextField key={key} label={key} value={draft[key]} onChange={(_, value) => setDraft({ ...draft, [key]: value ?? '' })} />)}
            </div>
            <PrimaryButton text='Apply' onClick={() => setOwnWording(draft)} />
        </Stack>}
        {/* menus, the ribbon and the formatting are read as the plan mounts */}
        <Plan key={languageKey + JSON.stringify(ownWording)} lcid={language.lcid} culture={language.culture} labels={labels} />
    </Stack>
}
`

const JAPANESE_FILE = {
    name: 'japanese.ts',
    code: `//keys left out keep their English default
export const JAPANESE_LABELS: { [key: string]: string } = {
    'taskGrid.settings': '設定',
    'taskGrid.showHierarchy': '階層を表示',
    'taskGrid.hideInactiveTasks': '非アクティブなタスクを非表示',
    'taskGrid.expandLevel': '1 階層展開',
    'taskGrid.collapseLevel': '1 階層折りたたむ',
    'taskGrid.path': 'パス',
    'taskGrid.new': '新規',
    'taskGrid.edit': '編集',
    'taskGrid.delete': '削除',
    'taskGrid.addChild': 'サブタスクを追加',
    'taskGrid.confirmDeleteTasks': '選択したタスクを削除しますか?',
    'taskGrid.confirmDeleteTasksWithSubtasks': '選択したタスクと {{ count }} 件のサブタスクを削除しますか?',
    'taskGrid.tasksCannotBeDeleted': '選択したタスクは削除できません。',
    'taskGrid.taskCannotBeDeleted': 'このタスクは削除できません。',
    'taskGrid.deleteTasksFailed': '一部のタスクを削除できませんでした。',
    'taskGrid.openingTasks': 'タスクを開いています...',
    'taskGrid.deletingTasks': 'タスクを削除しています...',
    'taskGrid.movingTask': 'タスクを移動しています...',
    'taskGrid.openingRecord': 'レコードを開いています...',
    'taskGrid.createTaskFailed': 'タスクを作成できませんでした。',
    'taskGrid.openTasksFailed': 'タスクを開けませんでした。',
    'taskGrid.moveTaskFailed': 'タスクを移動できませんでした。',
    'taskGrid.openRecordFailed': 'レコードを開けませんでした。',
    'taskGrid.actionFailed': '操作を完了できませんでした。',
    'gantt.zoomSlider': 'ズーム',
    'gantt.zoomToFit': '全体を表示',
    'gantt.goToToday': '今日に移動',
    'gantt.showTask': 'タイムラインに表示',
    'markers.today': '今日',
    'markers.projectStart': 'プロジェクト開始',
    'markers.projectEnd': 'プロジェクト終了',
    'nonWorkingDays.hideNonWorkingDays': '非稼働日を非表示',
    'nonWorkingDays.weekend': '週末',
    'taskTooltip.duration': '期間',
    'links.confirmDeleteLink': 'この依存関係を削除しますか?',
    'links.linkStart': ' (開始)',
    'links.linkEnd': ' (終了)',
    'links.predecessor': '先行タスク',
    'links.successor': '後続タスク',
    'links.finishToStart': '終了 → 開始',
    'links.startToStart': '開始 → 開始',
    'links.finishToFinish': '終了 → 終了',
    'links.startToFinish': '開始 → 終了',
    'dependencies.predecessors': '先行タスク',
    'dependencies.successors': '後続タスク',
    'dependencies.creatingDependency': '依存関係を作成しています...',
    'dependencies.savingDependency': '依存関係を保存しています...',
    'dependencies.deletingDependency': '依存関係を削除しています...',
    'dependencies.dependenciesFailed': '依存関係を保存できませんでした。',
    'quickFind.searchPlaceholder': '{{ collection }}を検索...',
    'quickFind.defaultCollectionName': 'レコード',
    'quickFind.leadingWildcardWarning': '検索を速くするには、アスタリスク (*) で始めないでください',
    'viewSwitcher.ungroupedViewsHeader': 'システム ビュー',
    'gridSorting.sortTextAscending': '昇順 (A → Z)',
    'gridSorting.sortTextDescending': '降順 (Z → A)',
    'gridSorting.sortDateAscending': '古い順',
    'gridSorting.sortDateDescending': '新しい順',
    'gridSorting.sortNumberAscending': '小さい順',
    'gridSorting.sortNumberDescending': '大きい順',
    'gridSorting.clear': 'クリア',
    'gridSorting.menuSection': '並べ替え',
    'gridFiltering.filterMenuFilterBy': 'フィルター',
    'gridFiltering.apply': '適用',
    'gridFiltering.clear': 'クリア',
    'gridFiltering.menuSection': 'フィルター',
    'grid.noRecordsFound': 'レコードが見つかりません。',
    'grid.valueLocked': 'この値は編集できません。',
    'grid.recordLocked': 'このレコードは編集できません。',
    'grid.columnLocked': 'この列は編集できません。',
    'grid.recordSaveErrorTitle': '変更を保存できませんでした',
    'grid.recordSaveErrorDismiss': '閉じる',
    'errorMessageBar.details': '詳細',
    'errorMessageBar.tryAgain': '再試行',
    'loadingBoundary.loading': '読み込んでいます...',
    'dataset.unsavedChangesConfirmation': '保存されていない変更は破棄されます。続行しますか?',
    'dateTime.goToToday': '今日に移動',
    'dateTime.time': '時刻',
}
`,
}

export const SwitchLanguageExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: SWITCH_LANGUAGE_CODE }, JAPANESE_FILE, TASKS_FILE]} />
