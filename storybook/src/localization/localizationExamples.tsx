import React from 'react'
import { GridExampleRunner } from '../grid/GridExampleRunner'
import { TASKS_FILE } from '../task-grid/examples/shared'

const SWITCH_LANGUAGE_CODE = `import { createTaskDatabase, fieldMapping, loadTaskViews } from './tasks'
import { JAPANESE_LABELS } from './japanese'
import { getCustomColumns, translateColumns, translateLookupManyColumns, translateViews } from './columns'

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
    language: string
    lcid: number
    culture: string
    labels: { [key: string]: string }
}

//without a displayName, these take their name from the module that adds them
const MODULE_COLUMNS = [...LOOKUP_MANY_VIEW_COLUMNS, CHECKLIST_COLUMN, ...DEPENDENCY_COLUMNS].map(({ displayName, ...column }) => column)

const withModuleColumns = (views: IDatasetControlView<ITaskViewData>[]) => views.map(view => view.id !== 'all' ? view : {
    ...view,
    resolve: async provider => {
        const definition = await view.resolve(provider)
        return { ...definition, columns: [...definition.columns, ...MODULE_COLUMNS], data: { quickFindColumns: ['subject', 'assignedto', 'tags'] } }
    },
})

//memoized, so typing a wording does not draw the plan again
const Plan = React.memo((props: IPlanProps) => {
    const database = React.useMemo(createTaskDatabase, [])
    const columns = React.useMemo(() => translateColumns(TASK_COLUMNS, props.language), [])
    const loadViews = async () => translateViews(withModuleColumns(await loadTaskViews()), props.language)
    const loadTasks = async ({ taskRuntime }: ITaskGridLoadParameters): Promise<ITaskGridLoadResult> => ({
        provider: createMemoryTaskDataSource({ taskRuntime, onCreateStore: () => new MemoryTaskStore({ taskRuntime, database, columns }) }),
        fieldMapping,
    })
    const gridModules = React.useMemo(() => [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule(), createSortingModule(), createFilteringModule()], [])
    const controlModules = React.useMemo(() => [
        createLocalStorageUserQueriesModule<ITaskViewData>({ storageKey: 'docs.localization.views.' + props.language }),
        createMemoryProjectModule({ project: { id: 'website', name: 'Website Redesign', startDate: dayjs('2025-10-01'), endDate: dayjs('2026-01-31') } }),
        createTaskDraggingModule(),
        createIndexedDbCustomColumnsModule({ databaseName: 'docs.localization.customColumns.' + props.language, columns: getCustomColumns(props.language), enableCreation: true, enableDeletion: true }),
        createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: translateLookupManyColumns(LOOKUP_MANY_COLUMNS, props.language), values: LOOKUP_MANY_VALUES }),
        createMemoryTemplatesModule({ database, templates: TEMPLATES }),
        createMemoryChecklistModule({ items: CHECKLIST_ITEMS }),
        createMemoryDependenciesModule({ dependencies: DEPENDENCIES }),
    ], [database])
    const ganttModules = React.useMemo(() => [
        createLibraryModule(),
        createMarkersModule(),
        createMemoryNonWorkingDaysModule({ nonWorkingDays: NON_WORKING_DAYS }),
        createBarDraggingModule(),
        createTaskDrawingModule(),
        createTaskSelectionModule(),
        createTaskTooltipModule({ statusColumnName: 'statuscode' }),
        createLinksModule(),
    ], [])

    return <PcfContextProvider userSettings={{ lcid: props.lcid, formatInfoCultureName: props.culture }}>
        <LocalizationProvider labels={props.labels}>
            <TaskDatasetControl modules={controlModules} enableCreation enableEditing enableDeletion onLoadViews={loadViews} onLoad={loadTasks} height='560px'>
                <DatasetControl.Header>
                    <DatasetControl.Header.Start>
                        <DatasetControl.ViewSwitcher>
                            <DatasetControl.UserQueries />
                        </DatasetControl.ViewSwitcher>
                        <TaskGantt.ZoomSlider />
                    </DatasetControl.Header.Start>
                    <DatasetControl.Header.End>
                        <TaskDatasetControl.Ribbon />
                        <DatasetControl.EditColumns />
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
                <DatasetControl.Footer>
                    <DatasetControl.Footer.Start>
                        <TaskDatasetControl.PageSizeSwitcher />
                    </DatasetControl.Footer.Start>
                </DatasetControl.Footer>
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
        <Plan key={languageKey + JSON.stringify(ownWording)} language={languageKey} lcid={language.lcid} culture={language.culture} labels={labels} />
    </Stack>
}
`

const COLUMNS_FILE = {
    name: 'columns.ts',
    code: `interface IColumnWording {
    views: { [viewId: string]: string }
    names: { [columnName: string]: string }
    options: { [columnName: string]: { [value: number]: string } }
    customColumns: ICustomColumnDefinition[]
}

const CUSTOM_COLUMNS: ICustomColumnDefinition[] = [{ displayName: 'Risk', dataType: 'OptionSet', options: ['Low', 'Medium', 'High'] }]

//view, column and option names come from the data, so the data carries them per language
const WORDINGS: { [language: string]: IColumnWording } = {
    cs: {
        views: { all: 'Všechny úkoly', planning: 'Plánování', flat: 'Každý úkol zvlášť' },
        names: { subject: 'Předmět', description: 'Popis', statuscode: 'Stav', priority: 'Priorita', scheduledstart: 'Začátek', scheduledend: 'Termín', scheduleddurationminutes: 'Trvání', estimatedeffort: 'Odhad (h)', actualeffort: 'Skutečnost (h)', percentcomplete: '% hotovo', assignedto: 'Řešitelé', tags: 'Štítky', teams: 'Týmy' },
        options: {
            statuscode: { 1: 'Nezahájeno', 2: 'Probíhá', 3: 'Čeká', 4: 'Odloženo', 5: 'Dokončeno', 6: 'Zrušeno' },
            priority: { 0: 'Nízká', 1: 'Normální', 2: 'Vysoká', 3: 'Kritická' },
        },
        customColumns: [{ displayName: 'Riziko', dataType: 'OptionSet', options: ['Nízké', 'Střední', 'Vysoké'] }],
    },
    ja: {
        views: { all: 'すべてのタスク', planning: '計画', flat: 'タスクを個別に表示' },
        names: { subject: '件名', description: '説明', statuscode: '状態', priority: '優先度', scheduledstart: '開始日', scheduledend: '期日', scheduleddurationminutes: '期間', estimatedeffort: '見積工数 (時間)', actualeffort: '実績工数 (時間)', percentcomplete: '進捗率', assignedto: '担当者', tags: 'タグ', teams: 'チーム' },
        options: {
            statuscode: { 1: '未着手', 2: '進行中', 3: '待機中', 4: '延期', 5: '完了', 6: '取り消し' },
            priority: { 0: '低', 1: '標準', 2: '高', 3: '重大' },
        },
        customColumns: [{ displayName: 'リスク', dataType: 'OptionSet', options: ['低', '中', '高'] }],
    },
}

const translateColumn = (column: IColumn, wording: IColumnWording): IColumn => {
    const optionSet = TASK_COLUMNS.find(taskColumn => taskColumn.name === column.name)?.metadata?.OptionSet
    return {
        ...column,
        displayName: wording.names[column.name] ?? column.displayName,
        ...(optionSet && { metadata: { ...column.metadata, OptionSet: optionSet.map(option => ({ ...option, Label: wording.options[column.name]?.[option.Value] ?? option.Label })) } }),
    }
}

/** The columns the store offers, which Edit columns lists. */
export const translateColumns = (columns: IColumn[], language: string): IColumn[] => {
    const wording = WORDINGS[language]
    return wording ? columns.map(column => translateColumn(column, wording)) : columns
}

/** The columns each view shows, and the views' names. */
export const translateViews = (views: IDatasetControlView<ITaskViewData>[], language: string): IDatasetControlView<ITaskViewData>[] => {
    const wording = WORDINGS[language]
    return wording ? views.map(view => ({
        ...view,
        name: wording.views[view.id] ?? view.name,
        resolve: async provider => {
            const definition = await view.resolve(provider)
            return { ...definition, columns: definition.columns.map(column => column.displayName ? translateColumn(column as IColumn, wording) : column) }
        },
    })) : views
}

export const translateLookupManyColumns = (columns: { [columnName: string]: ILookupManyColumn }, language: string) => {
    const wording = WORDINGS[language]
    return wording ? Object.fromEntries(Object.entries(columns).map(([name, column]) => [name, { ...column, displayName: wording.names[name] ?? column.displayName }])) : columns
}

/** The custom columns a new database starts with. */
export const getCustomColumns = (language: string): ICustomColumnDefinition[] => WORDINGS[language]?.customColumns ?? CUSTOM_COLUMNS
`,
}

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
    'userQueries.myViewsHeader': 'マイ ビュー',
    'userQueries.saveChanges': '変更を保存',
    'userQueries.saveAsNewView': '新しいビューとして保存',
    'userQueries.manageViews': 'ビューの管理',
    'userQueries.viewName': '名前',
    'userQueries.save': '保存',
    'userQueries.delete': '削除',
    'userQueries.confirmDeleteViews': '選択したビューを削除しますか?',
    'userQueries.close': '閉じる',
    'userQueries.saveFailed': 'ビューを保存できませんでした。',
    'userQueries.deleteFailed': 'ビューを削除できませんでした。',
    'editColumns.editColumns': '列の編集',
    'editColumns.save': '保存',
    'editColumns.cancel': 'キャンセル',
    'editColumns.scopeSelectorLabel': '列のソース',
    'editColumns.columnSelectorPlaceholder': '列を追加...',
    'editColumns.customColumnTooltip': 'ユーザー列',
    'editColumns.unnamed': '(名前なし)',
    'editColumns.noResults': '結果が見つかりません。',
    'editColumns.loading': '読み込んでいます...',
    'customColumns.addCustomColumn': 'カスタム列を追加',
    'customColumns.editCustomColumn': 'カスタム列を編集',
    'customColumns.deleteCustomColumn': 'カスタム列を削除',
    'customColumns.confirmColumnDelete': 'この列と、すべてのタスクにあるその値を削除しますか?',
    'customColumns.customColumnsFailed': 'カスタム列を変更できませんでした。',
    'customColumns.loadCustomColumnsFailed': 'カスタム列の値を読み込めませんでした。',
    'customColumns.newColumnName': 'カスタム列 {{ number }}',
    'customColumns.yes': 'はい',
    'customColumns.no': 'いいえ',
    'lookupMany.noRecordsFound': 'レコードが見つかりません。',
    'lookupMany.loading': '読み込んでいます...',
    'lookupMany.loadLookupManyFailed': '関連レコードを読み込めませんでした。',
    'lookupMany.remove': '{{ name }} を削除',
    'templates.task': 'タスク',
    'templates.fromTemplate': 'テンプレートから',
    'templates.saveAsTemplate': 'テンプレートとして保存',
    'templates.searchTemplates': 'テンプレートを検索',
    'templates.noTemplates': 'テンプレートが見つかりません',
    'templates.name': '名前',
    'templates.creatingTasksFromTemplate': 'テンプレートからタスクを作成しています...',
    'templates.savingTemplate': 'テンプレートを保存しています...',
    'templates.templatesFailed': 'テンプレートを使用できませんでした。',
    'checklist.checklist': 'チェックリスト',
    'checklist.loadChecklistFailed': 'チェックリストを読み込めませんでした。',
    'pageSizeSwitcher.recordRange': '{{ start }} - {{ end }}',
    'pageSizeSwitcher.recordTotal': '/ {{ total }}',
    'pageSizeSwitcher.pageSizeTooltip': 'ページあたりのレコード数',
    'emptyRecords.noRecordsFound': 'レコードが見つかりません。',
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
    'taskGrid.projectLookupAmbiguous': 'プロジェクトにリンクするタスク列が複数あります ({{ columns }})。FetchXML をいずれかで絞り込んでください。',
    'markers.loadMarkersFailed': 'マーカーを読み込めませんでした。',
    'nonWorkingDays.loadNonWorkingDaysFailed': '非稼働日を読み込めませんでした。',
    'dependencies.loadDependenciesFailed': '依存関係を読み込めませんでした。',
    'quickFind.columnsHintStart': '次の列に',
    'quickFind.columnsHintOperator': '前方一致',
    'quickFind.columnsHintEnd': 'のフィルターを適用します:',
    'gridSorting.sortTwoOptionsJoint': '→',
    'filterOperators.contains': '次を含む',
    'filterOperators.doesNotContain': '次を含まない',
    'filterOperators.equals': '次と等しい',
    'filterOperators.doesNotEqual': '次と等しくない',
    'filterOperators.containsData': 'データあり',
    'filterOperators.doesNotContainData': 'データなし',
    'filterOperators.yesterday': '昨日',
    'filterOperators.today': '今日',
    'filterOperators.tomorrow': '明日',
    'filterOperators.lastSevenDays': '過去 7 日間',
    'filterOperators.nextSevenDays': '今後 7 日間',
    'filterOperators.lastWeek': '先週',
    'filterOperators.thisWeek': '今週',
    'filterOperators.lastMonth': '先月',
    'filterOperators.thisMonth': '今月',
    'filterOperators.on': '次の日付',
    'filterOperators.onOrBefore': '次の日付以前',
    'filterOperators.onOrAfter': '次の日付以降',
    'filterOperators.lastYear': '昨年',
    'filterOperators.thisYear': '今年',
    'filterOperators.lastXDays': '過去 X 日間',
    'filterOperators.nextXDays': '今後 X 日間',
    'filterOperators.lastXMonths': '過去 X か月',
    'filterOperators.nextXMonths': '今後 X か月',
    'filterOperators.greaterThan': '次より大きい',
    'filterOperators.greaterThanOrEqual': '次以上',
    'filterOperators.lessThanOrEqual': '次以下',
    'filterOperators.lessThan': '次より小さい',
    'filterOperators.containValues': '次の値を含む',
    'filterOperators.doesNotContainValues': '次の値を含まない',
    'filterOperators.beginsWith': '次で始まる',
    'filterOperators.doesNotBeginWith': '次で始まらない',
    'filterOperators.endsWith': '次で終わる',
    'filterOperators.doesNotEndWith': '次で終わらない',
    'filterOperators.in': '次のいずれか',
    'filterOperators.notIn': '次のいずれでもない',
    'filterOperators.between': '次の範囲内',
    'filterOperators.notBetween': '次の範囲外',
    'notificationMessageBar.groupedNotificationsSummary': '{{ count }} 件の通知があります。選択して表示します。',
    'twoOptions.yes': 'はい',
    'twoOptions.no': 'いいえ',
    'dateTime.goToToday': '今日に移動',
    'dateTime.time': '時刻',
}
`,
}

export const SwitchLanguageExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: SWITCH_LANGUAGE_CODE }, JAPANESE_FILE, COLUMNS_FILE, TASKS_FILE]} />
