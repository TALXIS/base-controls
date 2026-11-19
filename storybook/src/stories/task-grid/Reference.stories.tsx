import type { Meta, StoryObj } from '@storybook/react'
import { gridDocsPage } from '../../grid/gridDocsPage'

const DESCRIPTION = `
Every prop, module parameter, runtime member, field mapping key and slot of the task grid, in one place to look up.

## TaskDatasetControl props

Every other prop works as on a [**DatasetControl**](?path=/docs/controls-datasetcontrol-overview--overview).

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`onLoad\` | \`(taskRuntime) => ITaskGridLoadResult\` | Required | At mount | Gets the \`ITaskRuntime\` and returns the store, the field mapping and the views, or a promise of them, on every mount. See *What onLoad returns* below. |
| \`modules\` | \`IDatasetControlModule[]\` | None | At mount | Task modules, and DatasetControl modules such as user views. |
| \`enableCreation\` | \`boolean\` | \`false\` | At mount | *New* in the ribbon, and the **+** on each active task's row. |
| \`enableEditing\` | \`boolean\` | \`false\` | At mount | *Edit* for the selected tasks, editing in the cells and on the timeline, and dragging. Without it, forms open read-only. |
| \`enableDeletion\` | \`boolean\` | \`false\` | At mount | *Delete* for the selected tasks. |
| \`defaultCreatePosition\` | \`'first' \\| 'last'\` | \`'first'\` | At mount | Where among its siblings a new task goes when the call names no place of its own. |
| \`onSetup\` | \`(control: IDatasetControl) => void\` | None | At mount | Gets the DatasetControl of each mount, before it loads its modules and tasks. |
| \`onReady\` | \`(control: IDatasetControl) => void\` | None | At mount | Called once per mount, when the control has loaded and is drawn. |

## TaskDatasetControl parts

\`TaskDatasetControl.Ribbon\` takes every prop of \`DatasetControl.Ribbon\`, and its items pass through \`hooks.ribbonCommandUi\` of the task runtime; what DatasetControl adds to the ribbon is on [**Act on deals**](?path=/docs/controls-datasetcontrol-guide-features-act-on-deals--overview). \`TaskDatasetControl.PageSizeSwitcher\` takes every prop of \`DatasetControl.PageSizeSwitcher\` but \`pageSizes\`: it shows how many tasks the tree holds, and is always disabled, as a task grid loads every task at once.

\`TaskDatasetControl.Settings\` takes these:

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`enableShowHierarchy\` | \`boolean\` | \`true\` | Live | The *Show hierarchy* toggle, which turns the flat list off and on. |
| \`enableHideInactiveTasks\` | \`boolean\` | \`true\` | Live | The *Hide inactive tasks* toggle. |
| \`components\` | \`Partial<ITaskGridUiSettingsMenuComponents>\` | Defaults | Live | See *Slots* below. |

It provides the \`taskSettings\` part, so \`control.parts.get('taskSettings')\` reaches it while it is drawn.

| Member | Description |
|---|---|
| \`hooks.settings.add(hook, priority?)\` | Adds to or changes the toggles in place, each \`{ key, label, isChecked, onChange }\`; returns its remover. |
| \`getSettings()\` | The toggles as the menu shows them, every hook applied. |

## TaskGrid props

Every other prop works as on a Grid: see *Grid props* on Grid's [**Reference**](?path=/docs/controls-grid-reference--overview).

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`modules\` | \`ITaskGridGridModule[]\` | None | At mount | Grid modules, loaded after the tree. \`createTaskEditingModule()\` takes the place of the Grid's editing module; grouping and totals are left out. |
| \`defaultExpandedLevel\` | \`number\` | \`-1\` | At mount | How many levels of tasks start open while the view has none saved: \`0\` opens the top tasks, \`1\` their subtasks too, \`-1\` none. |
| \`components\` | \`IGridComponents\` | Defaults | Live | The Grid's overlays and rows. The task grid's own cells take theirs through \`cellRendererParams\`: see *Slots* below. |
| \`enableZebra\` | \`boolean\` | \`false\` | At mount | Shades every other row. |
| \`enableOptionSetColors\` | \`boolean\` | \`true\` | At mount | Draws options that have a colour as tags. |

## Gantt props

\`TaskGantt\` and its parts come from \`@talxis/base-controls/gantt\`.

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| **\`TaskGantt\`** | | | | |
| \`modules\` | \`IGanttModule[]\` | Required | At mount | The Gantt's modules, a library module among them. |
| \`stateKey\` | \`string\` | None | At mount | Where the zoom is kept in each view. |
| \`timelineLimits\` | \`{ start?: Dayjs, end?: Dayjs }\` | Today ± 25 years | Live | How far the timeline scrolls, widened to fit the tasks. |
| \`components\` | \`ITaskGanttComponents\` | Defaults | Live | See *Slots* below. |
| \`onSetup\` | \`(gantt: IGantt) => void\` | None | At mount | Gets the Gantt of each mount, before its modules load; add hooks here. |
| \`onReady\` | \`(gantt: IGantt) => void\` | None | At mount | Called once per mount, when the chart is drawn. |
| **\`TaskGantt.Split\`** | | | | |
| \`children\` | Two elements | Required | Live | The \`TaskGrid\`, then the \`TaskGantt\`. |
| \`defaultGanttSize\` | \`number\` | \`60\` | At mount | The Gantt's share of the width, in percent, until the user drags the handle. |
| \`stateKey\` | \`string\` | None | At mount | Where the user's width is kept in each view. |
| \`components\` | \`Partial<IGridGanttUiSplitComponents>\` | Defaults | Live | See *Slots* below. |
| **\`TaskGantt.ZoomSlider\`** | | | | |
| \`components\` | \`Partial<IGanttUiZoomSliderComponents>\` | Defaults | Live | See *Slots* below. |

## What onLoad returns

\`onLoad\` on \`TaskDatasetControl\` returns an \`ITaskGridLoadResult\`.

| Key | Type | Default | Description |
|---|---|---|---|
| \`store\` | \`ITaskStore\` | Required | Where the tasks are kept. See *Stores* below. |
| \`fieldMapping\` | \`IFieldMapping\` | Required | The columns that make the tree. See *Field mapping* below. |
| \`views\` | \`ITaskGridView[]\` | None | The views to switch between; the first one opens first. A view's columns and the mapped ones are the columns that load, so \`DataverseTaskStore\` reads only those of the FetchXML's attributes. Without views, the grid shows the columns the store returns: for \`DataverseTaskStore\`, the FetchXML's attributes. |
| \`rootTaskId\` | \`string\` | None | Shows only the tasks under this task, which the store loads too. |
| \`hoursPerDay\` | \`number\` | \`24\` | How many hours a day of a task's duration holds, unless the duration column's metadata says otherwise. |

## Field mapping

The mapped columns load whether a view lists them or not.

| Key | Default | Description |
|---|---|---|
| \`parentId\` | Required | The lookup to the parent task, empty for a top-level task. |
| \`subject\` | Required | The task's name, drawn with the tree's indent and chevron. |
| \`stackRank\` | Required | The task's place among its siblings, a LexoRank text such as \`0\\|hzzzzz:\`. |
| \`stateCode\` | \`'statecode'\` | \`0\` is active; any other value, or none, is inactive. |
| \`startDate\`, \`endDate\` | None | The task's dates. The Gantt needs both. |
| \`duration\` | None | Minutes, as a duration column holds them. |
| \`percentComplete\` | None | Drawn as a progress bar. |

## Stores

Create a new store in every \`onLoad\`, with the task runtime it gets.

### MemoryTaskStore

| Parameter | Type | Description |
|---|---|---|
| \`taskRuntime\` | \`ITaskRuntime\` | Required. The task runtime \`onLoad\` gets. |
| \`tasks\` | \`MemoryTable<IRawRecord>\` | Required. The tasks, keyed by the metadata's \`PrimaryIdAttribute\`. |
| \`metadata\` | \`IMemoryProviderEntityMetadata\` | Required. Its \`PrimaryIdAttribute\` is the table's \`idKey\`. |
| \`columns\` | \`IColumn[]\` | Required. Every column a view or *Edit columns* may use. |

### MemoryTable

| Member | Description |
|---|---|
| \`new MemoryTable({ idKey, rows? })\` | A table whose rows are found by their \`idKey\` column, starting with copies of \`rows\`. |
| \`getRows(predicate?)\` | Copies of every row, or of the rows \`predicate\` keeps. |
| \`getRow(id)\` | A copy of one row, or \`undefined\`. |
| \`insert(rows)\` | Adds copies of the rows, replacing any with the same id. |
| \`update(id, values)\` | Merges \`values\` into a row; does nothing when there is no such row. |
| \`delete(ids)\` | Removes the rows. |

### DataverseTaskStore

| Parameter | Type | Description |
|---|---|---|
| \`taskRuntime\` | \`ITaskRuntime\` | Required. The task runtime \`onLoad\` gets. |
| \`fetchXml\` | \`string\` | Required. Selects the tasks: a Liquid template over \`project\`, from the project module, and \`hostRecord\`. |
| \`hostRecord\` | \`{ entityName, id?, data? }\` | The record the grid sits on, such as the one the form shows. A new task gets the lookup to it that the FetchXML filters by. |
| \`form\` | \`{ editId?, bulkEditId?, getParameters? }\` | The forms *Edit* opens one task and several tasks in, and \`getParameters(operation, defaults)\` to change what \`Xrm.Navigation.navigateTo\` gets. |

### ITaskStore

| Method | Description |
|---|---|
| \`load(provider)\` | Returns \`{ rawData, metadata, columns }\`: every task of the view, the metadata with its \`PrimaryIdAttribute\`, and the columns. |
| \`getAvailableColumns(options?)\`, \`getAvailableRelatedColumns()\` | What views and *Edit columns* can show. |
| \`createTask({ parentRecord, stackRank, data, taskId })\` | Creates the task the grid already shows. Returns \`{ record }\` as the backend saved it, or \`null\` to drop it. |
| \`saveTask(task)\` | Saves what changed on a task, its parent and rank included. |
| \`deleteTasks({ taskIds, tree })\` | Deletes the tasks, called level by level, the deepest first. Returns the ones deleted and the ones that failed, or \`null\` when cancelled. |
| \`openTasks(taskIds)\` | Opens the tasks outside the grid, such as in a form. Returns \`null\` when nothing changed. |
| \`openRelatedRecord(reference, columnName)\` | Opens the record a lookup points to. |
| \`canDeleteTask(task)\` | Optional. \`false\` keeps a task, and every task above it, from being deleted. |
| \`synchronize()\` | Optional. Returns \`{ updatedRecords }\`, the tasks the backend changed since the last read. |

## Task modules

Task modules go in \`TaskDatasetControl\`'s \`modules\`; \`modules.get(name)\` and \`useDatasetControlModule(name)\` find one by its name.

| Module | Name | Memory | Your own store |
|---|---|---|---|
| Row dragging | \`dragging\` | \`createTaskDraggingModule()\`, for every store | |
| Project | \`project\` | \`createMemoryProjectModule\` | \`createProjectModule\` |
| Custom columns | \`customColumns\` | \`createMemoryCustomColumnsModule\` | \`createCustomColumnsModule\` |
| Lookup many | \`lookupMany\` | \`createMemoryLookupManyModule\` | \`createLookupManyModule\` |
| Templates | \`templates\` | \`createMemoryTemplatesModule\` | \`createTemplatesModule\` |
| Checklist | \`taskChecklist\` | \`createMemoryTaskChecklistModule\` | \`createTaskChecklistModule\` |
| Dependencies | \`dependencies\` | \`createMemoryDependenciesModule\` | \`createDependenciesModule\` |

| Module | Dataverse | TALXIS |
|---|---|---|
| Project | \`createDataverseProjectModule\` | The Dataverse one |
| Custom columns | None | \`createTalxisCustomColumnsModule\` |
| Lookup many | \`createDataverseLookupManyModule\` | The Dataverse one |
| Templates | None | None |
| Checklist | None | \`createTalxisTaskChecklistModule\` |
| Dependencies | \`createDataverseDependenciesModule\` | \`createTalxisDependenciesModule\` |

User views, \`userQueries\`, come from DatasetControl's factories, under *User views* on its [**Reference**](?path=/docs/controls-datasetcontrol-reference--overview): \`createLocalStorageUserQueriesModule\`, \`createDataverseUserQueriesModule\`, \`createTalxisUserQueriesModule\` and \`createUserQueriesModule\`. \`createTaskEditingModule()\` goes in \`TaskGrid\`'s \`modules\` and takes no parameters.

### Project

| Parameter | Type | Default | Description |
|---|---|---|---|
| **\`createMemoryProjectModule\`** | | | |
| \`projects\` | \`MemoryTable<IMemoryProject>\` | Required | The projects, keyed by \`id\`, their dates as ISO strings. |
| \`projectId\` | \`string\` | Required | The project the grid shows. |
| **\`createDataverseProjectModule\`** | | | |
| \`entityName\` | \`string\` | Required | The project's table. |
| \`id\` | \`string\` | Required | The project record's id. |
| \`startDateColumn\`, \`endDateColumn\` | \`string\` | None | The columns holding its start and end. |
| \`columns\` | \`string[]\` | None | More columns to read into \`data\`. |
| **\`createProjectModule\`** | | | |
| \`createStore\` | \`(taskRuntime) => IProjectStore\` | Required | Called on every mount; the store's \`loadProject()\` returns the project, before the tasks load, and its optional \`destroy()\` runs when the mount goes. |

| Project field | Type | Description |
|---|---|---|
| \`id\` | \`string\` | Required. |
| \`name\` | \`string\` | The project's name. |
| \`entityName\` | \`string\` | The table the project lives in. \`DataverseTaskStore\` fills in the project lookup on new tasks only when it is set. |
| \`startDate\`, \`endDate\` | \`Dayjs\` | The project's dates. |
| \`data\` | \`object\` | Anything else; in FetchXML, its keys are fields of \`project\`. |

### Custom columns

| Parameter | Type | Default | Description |
|---|---|---|---|
| **Every factory** | | | |
| \`enableCreation\` | \`boolean\` | \`false\` | *Add custom column* in *Edit columns*. |
| \`enableEditing\` | \`boolean\` | \`false\` | The edit command beside each custom column. Not on the memory factory. |
| \`enableDeletion\` | \`boolean\` | \`false\` | The delete command beside each custom column. |
| **\`createMemoryCustomColumnsModule\`** | | | |
| \`columns\` | \`MemoryTable<ICustomColumnRow>\` | Required | The columns, keyed by \`name\`. |
| \`values\` | \`MemoryTable<ICustomColumnValuesRow>\` | Required | Each task's values, as \`{ taskId, values }\` keyed by \`taskId\`. |
| **\`createTalxisCustomColumnsModule\`** | | | |
| \`entityName\` | \`string\` | Required | The table the columns are defined for. |
| \`recordId\` | \`string\` | None | Also loads the columns defined for this record, such as the project, and defines new columns for it. |
| \`navigationPropertyName\` | \`string\` | None | The relationship from the task table to \`talxis_attributevalue\`, when there are several. |
| **\`createCustomColumnsModule\`** | | | |
| \`createStore\` | \`(taskRuntime) => ICustomColumnsStore\` | Required | Called on every mount. |

| Column row field | Description |
|---|---|
| \`name\` | Required. The column's name; \`DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX\` is added where it is missing. |
| \`displayName\` | Required. The header's text. |
| \`dataType\` | Required. Such as \`'SingleLine.Text'\`, \`'Decimal'\`, \`'Currency'\`, \`'OptionSet'\`, \`'TwoOptions'\` or \`'DateAndTime.DateOnly'\`. |
| \`isRequired\` | Whether a value is required. |
| \`precision\` | The decimal places of a decimal or currency column. |
| \`options\` | The labels of a choice column's options, in order; their values count from \`1\`. |
| \`createdOn\` | Orders the columns; a row without it comes first. |

| ICustomColumnsStore method | Description |
|---|---|
| \`loadColumns()\` | Every custom column, as an \`IColumn\` whose name ends in the suffix. Called before the tasks load, and after a column changes. |
| \`loadValues(taskIds)\` | The tasks' values, by task id and column name. |
| \`saveValue(record, column, value)\` | Saves one value and returns the save result. |
| \`createColumn()\`, \`updateColumn(columnName)\`, \`deleteColumn(columnName)\` | Create, change and delete a column; each returns its name, or \`null\` when the user cancelled. |
| \`destroy()\` | Optional. Called when the mount goes. |

### Lookup many

| Parameter | Type | Default | Description |
|---|---|---|---|
| **Every factory** | | | |
| \`columns\` | \`{ [columnName]: ILookupManyColumn }\` | Required | The lookup-many columns by name. |
| \`components\` | \`ILookupManyComponents\` | Defaults | See *Slots* below. |
| **\`createMemoryLookupManyModule\`** | | | |
| \`sources\` | \`{ [entityName]: IMemoryLookupManySource }\` | Required | The records to pick from, by table name: a \`MemoryTable\` of \`records\`, with their \`metadata\` and \`columns\`. |
| \`values\` | \`MemoryTable<IMemoryLookupManyValues>\` | Required | Each task's picks, keyed by \`taskId\`, with its \`values\` by column name. |
| **\`createDataverseLookupManyModule\`** | | | |
| \`hostRecord\` | \`{ entityName, id?, data? }\` | None | The record the grid sits on, as \`hostRecord\` in each column's FetchXML. |
| **\`createLookupManyModule\`** | | | |
| \`createStore\` | \`(taskRuntime) => ILookupManyStore\` | Required | Called on every mount. |

| Column key | Description |
|---|---|
| \`displayName\` | Required. The header's text. |
| \`entityName\` | Required. The table of the records it holds. |
| \`appearance\` | \`{ type: 'plain' }\` by default; \`{ type: 'colorful', colorPropertyName? }\` tints each pill with the record's \`color\`; \`{ type: 'people', imageUrlPropertyName? }\` draws an avatar from the record's \`imageurl\`. |
| \`navigationPropertyName\` | Dataverse only, required. The navigation property of the relationship, from either side. |
| \`fetchXml\` | Dataverse only, required. The records offered, as a Liquid template over \`task\`, \`project\` and \`hostRecord\`. |
| \`select\` | Dataverse only. The related records' columns to read, comma separated. |
| \`customIntersection\` | Dataverse only. \`{ navigationPropertyName }\` of a link table of your own to the related record. |

| ILookupManyStore method | Description |
|---|---|
| \`loadValues(taskIds)\` | Every column's references of these tasks, by task id and column name. |
| \`saveValue(taskId, columnName, value)\` | Saves a task's references in one column. |
| \`createOptionsProvider({ record, column, settings, taskRuntime })\` | A provider over the records the column can take; \`record\` is missing for the filter, and \`undefined\` disables the editor. |
| \`destroy()\` | Optional. Called when the mount goes. |

### Templates

| Parameter | Type | Default | Description |
|---|---|---|---|
| **Every factory** | | | |
| \`components\` | \`ITemplatesComponents\` | Defaults | See *Slots* below. |
| **\`createMemoryTemplatesModule\`** | | | |
| \`templates\` | \`MemoryTable<IMemoryTemplate>\` | Required | The templates, keyed by \`id\`: \`{ id, name, data?, children? }\`, each child \`{ data?, children? }\`. |
| \`tasks\` | \`MemoryTable<IRawRecord>\` | Required | The table the template's tasks are created in, the one \`MemoryTaskStore\` reads. |
| **\`createTemplatesModule\`** | | | |
| \`createStore\` | \`(taskRuntime) => ITemplatesStore\` | Required | Called on every mount. |

| ITemplatesStore method | Description |
|---|---|
| \`createTemplatesProvider()\` | A provider over the templates, searched by the picker; made each time it opens. |
| \`createTasks({ templateId, parentRecord, stackRank })\` | Creates the template's tasks, its own at \`stackRank\` under \`parentRecord\` and the rest under it. Returns \`{ records }\`, or \`null\` when there were none or the user cancelled. |
| \`createTemplate({ name, tree })\` | Optional. Saves a task and its subtasks as a template; without it, there is no *Save as template*. |
| \`destroy()\` | Optional. Called when the mount goes. |

### Checklist

| Parameter | Type | Default | Description |
|---|---|---|---|
| **Every factory** | | | |
| \`reloadOnEditorClosed\` | \`boolean\` | \`false\`; \`true\` for TALXIS | Reads a task's items again once its form closes. |
| \`components\` | \`ITaskChecklistComponents\` | Defaults | See *Slots* below. |
| **\`createMemoryTaskChecklistModule\`** | | | |
| \`items\` | \`MemoryTable<IMemoryTaskChecklistItem>\` | Required | The items, keyed by \`id\`, each with a \`taskId\`, a \`name\` and \`isCompleted\`. |
| **\`createTaskChecklistModule\`** | | | |
| \`createStore\` | \`(taskRuntime) => ITaskChecklistStore\` | Required | Called on every mount; the store's \`loadItems(taskIds)\` returns the items by task id, and its optional \`destroy()\` runs when the mount goes. |

\`createTalxisTaskChecklistModule\` takes only the parameters of every factory, and reads each task's \`talxis_checklistjson\`, a JSON array of \`{ id, name, isCompleted }\`.

### Dependencies

| Parameter | Type | Default | Description |
|---|---|---|---|
| **Every factory** | | | |
| \`reloadOnEditorClosed\` | \`boolean\` | \`false\`; \`true\` for Dataverse and TALXIS | Reads a task's dependencies again once its form closes. |
| \`components\` | \`IDependenciesComponents\` | Defaults | See *Slots* below. |
| **\`createMemoryDependenciesModule\`** | | | |
| \`dependencies\` | \`MemoryTable<ITaskDependency>\` | Required | The dependencies, keyed by \`id\`. |
| **\`createDataverseDependenciesModule\`** | | | |
| \`entityName\` | \`string\` | Required | The dependency table. |
| \`predecessorAttribute\`, \`successorAttribute\` | \`string\` | Required | Its two lookups to the task table. |
| \`typeAttribute\` | \`string\` | Required | Its option set of the type. |
| \`dependencyTypeCodes\` | \`{ [value: number]: TaskDependencyType }\` | Required | Every value of that option set, and the type it stands for; a value left out fails the load. |
| **\`createDependenciesModule\`** | | | |
| \`createStore\` | \`(taskRuntime) => IDependenciesStore\` | Required | Called on every mount. |

\`createTalxisDependenciesModule\` takes only the parameters of every factory: it is the Dataverse factory with \`talxis_taskdependency\` mapped.

| Dependency field | Description |
|---|---|
| \`id\` | The dependency's id, given by the store. |
| \`predecessorTaskId\` | The task that comes first. |
| \`successorTaskId\` | The task that waits on it. |
| \`type\` | \`'finishToStart'\`, \`'startToStart'\`, \`'finishToFinish'\` or \`'startToFinish'\`. |

| IDependenciesStore method | Description |
|---|---|
| \`loadDependencies(taskIds)\` | Every dependency with any of these tasks at either end. |
| \`createDependency({ predecessorTaskId, successorTaskId, type })\` | Creates a dependency and returns it with its \`id\`. |
| \`updateDependency(dependency)\` | Saves a dependency whose type changed. |
| \`deleteDependency(dependencyId)\` | Deletes a dependency. |
| \`destroy()\` | Optional. Called when the mount goes. |

## Gantt modules

Gantt modules come from \`@talxis/base-controls/gantt\` and go in \`TaskGantt\`'s \`modules\`; every parameter is read at mount.

| Module | Name | Factory | Needs |
|---|---|---|---|
| Library | \`library\` | \`createLibraryModule()\`, or \`createProLibraryModule({ Gantt })\` with your DHTMLX Gantt PRO build | Required. |
| Bar dragging | \`barDragging\` | \`createBarDraggingModule()\` | \`enableEditing\`, and \`createTaskEditingModule()\` in \`TaskGrid\`. |
| Task drawing | \`taskDrawing\` | \`createTaskDrawingModule()\` | \`enableCreation\` for new tasks; for dates, what bar dragging needs. |
| Task selection | \`taskSelection\` | \`createTaskSelectionModule()\` | \`createRowSelectionModule()\` in \`TaskGrid\`, for the grid to show the selection. |
| Tooltip | \`taskTooltip\` | \`createTaskTooltipModule()\` | |
| Markers | \`markers\` | \`createMarkersModule()\`, \`createMemoryMarkersModule()\` | A project module, for the project's start and end. |
| Non-working days | \`nonWorkingDays\` | \`createNonWorkingDaysModule()\`, \`createMemoryNonWorkingDaysModule()\` | \`TaskDatasetControl.Settings\`, for the user to hide them. |
| Links | \`links\` | \`createLinksModule()\` | A dependencies module; without one, the Gantt fails. |

### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| **\`createProLibraryModule\`** | | | |
| \`Gantt\` | \`GanttEnterprise\` | Required | The PRO build's \`Gantt\` export. |
| **\`createBarDraggingModule\`** | | | |
| \`enableMove\` | \`boolean\` | \`true\` | Dragging a bar to other dates. |
| \`enableResize\` | \`boolean\` | \`true\` | Dragging a bar's ends. |
| **\`createTaskDrawingModule\`** | | | |
| \`components\` | \`ITaskDrawingComponents\` | Defaults | See *Slots* below. |
| **\`createTaskSelectionModule\`** | | | |
| \`enableSelectionBox\` | \`boolean\` | \`true\` | Shift+drag selects the bars under a band. |
| **\`createTaskTooltipModule\`** | | | |
| \`statusColumnName\` | \`string\` | None | An option set column the header shows as a pill in its option's colour. The column has to load, such as by being in the view, or the tooltip fails. |
| \`components\` | \`ITaskTooltipComponents\` | Defaults | See *Slots* below. |
| **\`createLinksModule\`** | | | |
| \`components\` | \`ILinksComponents\` | Defaults | See *Slots* below. |
| **\`createMarkersModule\`, \`createMemoryMarkersModule\`** | | | |
| \`today\` | \`ITodayMarkerParameters\` | Shown | Today's marker: \`enableMarker\`, \`color\` and \`lineStyle\`. |
| \`project\` | \`IProjectMarkersParameters\` | Shown | The project's start and end: \`enableMarkers\`, \`color\` and \`lineStyle\`. |
| \`components\` | \`IMarkersComponents\` | Defaults | See *Slots* below. |
| **\`createMarkersModule\`** | | | |
| \`createStore\` | \`(taskRuntime) => IMarkersStore\` | None | A store whose \`loadMarkers()\` returns markers of your own. |
| **\`createMemoryMarkersModule\`** | | | |
| \`markers\` | \`MemoryTable<IMemoryMarker>\` | Required | The markers, their dates as ISO strings. |
| **\`createNonWorkingDaysModule\`, \`createMemoryNonWorkingDaysModule\`** | | | |
| \`enableWeekends\` | \`boolean\` | \`true\` | Saturdays and Sundays are non-working days. |
| \`isVisibleByDefault\` | \`boolean\` | \`true\` | Shows the days until the user hides them. |
| \`enableDropOnNonWorkingDays\` | \`boolean\` | \`false\` | Lets a dragged or drawn bar start or end on a non-working day. |
| \`components\` | \`INonWorkingDaysComponents\` | Defaults | See *Slots* below. |
| **\`createNonWorkingDaysModule\`** | | | |
| \`createStore\` | \`(taskRuntime) => INonWorkingDaysStore\` | None | A store whose \`loadNonWorkingDays()\` returns days of your own. |
| **\`createMemoryNonWorkingDaysModule\`** | | | |
| \`nonWorkingDays\` | \`MemoryTable<IMemoryNonWorkingDay>\` | Required | The days, their dates as ISO strings. |

### A marker

| Field | Default | Description |
|---|---|---|
| \`id\` | Required | Unique among the markers. |
| \`text\` | Required | What the chip on the scale says. |
| \`date\` | Required | A \`Dayjs\`, or an ISO string in a memory table. |
| \`color\` | The theme's primary colour | The colour of the line and the chip. |
| \`lineStyle\` | \`'dotted'\` | \`'solid'\` or \`'dotted'\`. |

### A non-working day

| Field | Default | Description |
|---|---|---|
| \`id\` | Required | Unique among the days. |
| \`date\` | Required | A \`Dayjs\`, or an ISO string in a memory table: the first day, or that of the first occurrence when it recurs. |
| \`endDate\` | The \`date\` | The last day, included. |
| \`description\` | None | What the scale says when the day is pointed at. |
| \`recurrence\` | None | An RRULE starting at \`date\`, such as \`FREQ=YEARLY\`. |
| \`data\` | None | Anything else the day carries. |

## The task runtime

\`onLoad\` gets the task runtime; inside the control, \`useTaskRuntime()\` returns it.

| Member | Description |
|---|---|
| \`tasks\` | The task actions. See *Task actions* below. |
| \`execute(operation, parameters?)\` | Runs your own work behind the loading overlay, its failure shown in a dialog. |
| \`loading\`, \`executor\` | What the overlay waits on, and what \`execute\` runs through, as on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
| \`getProvider()\` | The task provider. See *The task provider* below. |
| \`getView()\` | The open view, with its \`data\`. |
| \`getFieldMapping()\` | The field mapping \`onLoad\` returned. |
| \`getHoursPerDay()\` | How many hours a day of a duration holds: the duration column's \`HoursPerDay\`, else the \`hoursPerDay\` \`onLoad\` returned, else \`24\`. |
| \`getLabels(set)\` | A label set as the control translates it. |
| \`isFlatList()\`, \`setFlatList(isFlatList)\` | Whether the tasks show without the tree. |
| \`isCreationEnabled()\`, \`isEditingEnabled()\`, \`isDeletionEnabled()\` | The control's \`enable…\` props. |
| \`isTaskLocked(taskId)\` | Whether the task is closed to changes: locked in the grid, or inactive while no grid is drawn. |
| \`hooks.ribbonCommandUi\` | Changes every item \`TaskDatasetControl.Ribbon\` draws, those in its menus too. |
| \`getRibbonCommandItems(items)\` | Copies of \`items\` with every ribbon command UI hook applied. |
| \`lifecycle\` | The mount's status and events. See [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
| \`parts\`, \`notifications\` | The DatasetControl's parts, and its \`notifications\` part while \`DatasetControl.Notifications\` is drawn. See *Parts* and *Messages* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
| \`services\` | \`get\`, \`find\` and \`observe\` by key. See *Services* below. |

### Task actions

\`taskRuntime.tasks\` runs each action behind the loading overlay and shows its failure in a dialog before it rejects; \`create\` shows the wait in the new row and resolves \`null\` on a failure.

| Member | Description |
|---|---|
| \`create(parentId?, { position?, data? })\` | Creates a task under \`parentId\`, or where *New* would. \`position\` is \`'first'\`, \`'last'\` or \`{ before: siblingId }\`. Returns the task, or \`null\`, such as while \`enableCreation\` is off. |
| \`move(taskId, targetTaskId, position)\` | Moves a task \`'above'\` or \`'below'\` another, or makes it the first \`'child'\` of it, and saves it. Returns \`true\`, or \`null\` when it cannot go there. |
| \`delete(taskIds)\` | Asks the user, then deletes the tasks with their subtasks. Does nothing while \`enableDeletion\` is off. |
| \`open(taskIds)\` | Opens the tasks outside the grid, such as in their form. |
| \`openRecord(reference, columnName?)\` | Opens the task, or the record a lookup points to, as a link in the grid does. |
| \`openRelatedRecord(reference, columnName)\` | Opens the record the task's lookup in \`columnName\` points to. |

### Services

| Key | Holds |
|---|---|
| \`datasetControl\` | The DatasetControl of the mount: its views, parts and modules. |
| \`pcfContext\` | The PCF context the control is under. |
| \`provider\` | The task provider, once \`onLoad\` has returned. |
| \`taskTree\` | The grid's tree, while \`TaskGrid\` is drawn: \`isFlatList()\` and \`setFlatList(isFlatList)\`, \`revealTask(taskId)\`, which scrolls a task into view, and \`editTaskSubject(taskId)\`, which opens its name for typing. |
| \`savingChains\` | The tasks a save can reach: \`isTaskSaving(taskId)\`, \`isTaskLocked(taskId)\`, \`track(taskIds, operation)\` for a write of your own, \`hooks.links\` to add the tasks a change to one task moves, and \`events\` with \`onChainsChanged(taskIds)\`. |

### Inside the grid

Inside anything \`TaskGrid\` draws, such as a cell, \`useTaskGridService(key)\` returns one of its services.

| Key | Holds |
|---|---|
| \`provider\` | The task provider. See *The task provider* below. |
| \`taskExpansion\` | Which tasks are open: \`isExpanded(taskId)\`, \`setExpanded(taskId, expanded)\`, \`toggle(taskId)\`, \`expandLevel()\` and \`collapseLevel()\` with \`canExpandLevel()\` and \`canCollapseLevel()\`, \`getExpandedIds()\`, and \`events\` with \`onExpansionChanged({ recordIds, expanded })\`. |

## The task provider

\`getProvider()\` returns an \`ITaskDataProvider\`, a [**data provider**](?path=/docs/concepts-data-providers--overview) with these members of its own.

| Member | Description |
|---|---|
| \`taskEvents\` | The events every change raises. See *Task provider events* below. |
| \`getRecordTree()\` | \`view\`, the tree as the grid shows it, and \`structure\`, the whole tree: \`getChildren(parentId?)\`, \`getParent(taskId)\`, \`getAncestorIds(taskId)\`, \`getDescendants(taskId)\`, \`getNeighbours(taskId)\`. |
| \`getAllRecords()\` | Every loaded task, whatever the view shows. |
| \`getFieldMapping()\`, \`getRootTaskId()\`, \`getStore()\`, \`getHoursPerDay()\` | What \`onLoad\` returned. |
| \`setQuickFindColumns(columnNames)\` | The columns quick find searches. |
| \`isRecordActive(taskId)\` | Whether the task is active. |
| \`areInactiveTasksHidden()\`, \`setInactiveTasksHidden(isHidden)\` | *Hide inactive tasks*. |
| \`createTask(parentId?, { position?, data? })\` | Shows a new task at once and has the store create it. Returns the task, or \`null\` under a task the store has not created yet. |
| \`getNewTaskPosition(taskId)\` | The place a task created since the view loaded asked for: \`'first'\`, \`'last'\` or \`{ before: siblingId }\`. |
| \`isTaskPending(taskId)\`, \`whenTaskCreated(taskId)\` | Whether the store is still creating a task, and a promise of \`true\` once it has, \`false\` when it dropped it; it rejects when the store failed. |
| \`createTasksWith(parentId, create, { position? })\` | Adds the tasks \`create\` makes in your backend: \`create\` gets \`{ parentRecord, stackRank }\` and returns \`{ records }\`. |
| \`moveTask(taskId, targetTaskId, position)\` | Places a task without saving it; \`null\` when it cannot go there. |
| \`getDeletion(taskIds)\` | What deleting the tasks would remove: \`deletableTaskIds\`, the tasks and their subtasks less those the store refuses and the tasks above them, and \`refusedTaskIds\`. |
| \`deleteTasks(taskIds)\` | Deletes the tasks and their subtasks through the store, the deepest first; \`tasks.delete\` asks the user first. |
| \`openTasks(taskIds)\`, \`openRelatedRecord(reference, columnName)\` | What the store does for them. |
| \`updateTaskData(rawRecords)\` | Merges values into the loaded tasks by their id, keeping the user's unsaved edits, and raises \`onTasksUpdated\`. |
| \`synchronize()\` | Asks the store what the backend changed and merges it in. |
| \`hooks.availableColumns\` | Adds columns that views and *Edit columns* can show. |
| \`addColumnHandler(handler)\` | Loads and saves the columns the handler claims in place of the store; returns its remover. |
| \`addColumnMatcher(matcher)\` | Answers filters and quick find for the columns the matcher claims; returns its remover. |
| \`addRequiredColumn(column)\` | Loads a column with the tasks, whatever the view shows; returns its remover. |
| \`addLoadWaiter(waiter)\` | Holds the tasks back from the tree until it resolves; returns its remover. |
| \`isColumnQueried(columnName)\` | Whether the sorting, filtering or quick find reads the column. |

### Task provider events

| Event | Fires |
|---|---|
| \`onTasksCreated(records, parentId?)\` | When new tasks join the tree, before the store has created a new one. |
| \`onTasksDeleted(taskIds)\` | When tasks leave the tree: deleted, or dropped or failed by the store as it created them. |
| \`onTaskMoved({ movingRecord, targetRecord, position, parentRecord, stackRank })\` | When a task is placed, before its move saves. |
| \`onTasksUpdated(records)\` | When values are merged into loaded tasks through \`updateTaskData\`: what \`synchronize()\` brings, a new task as the store saved it, and the values a module loads. An edit in a cell does not raise it. |
| \`onEditorClosed(taskIds)\` | When the form the tasks were opened in closes. |
| \`onTreeChanged()\` | When the tree as shown changes without new data: a task is added, moved or deleted. |

## Slots

\`TaskGrid\` and the Gantt's parts take \`components\` as a prop. How slots work is on [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview). \`TaskDatasetControl.Ribbon\` and \`TaskDatasetControl.PageSizeSwitcher\` take the slots of their DatasetControl parts, under *Slots* on DatasetControl's [**Reference**](?path=/docs/controls-datasetcontrol-reference--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| **\`TaskGrid\`** | | | |
| \`overlays\`, \`rows\` | The Grid's, under *The grid's own pieces* on Grid's [**Reference**](?path=/docs/controls-grid-reference--overview) | | |
| **\`TaskDatasetControl.Settings\`** | | | |
| Top level | \`onRender\`, \`onRenderButton\` | \`TaskGridUiSettingsMenuComponents\` | The tooltip around the settings button, and the button with its menu |
| **\`TaskGantt\`** | | | |
| \`chart\` | \`onRender\`, \`onRenderChart\` | \`GanttUiChartComponents\` | The chart's box; \`onRenderChart\` has to pass on its \`ref\` |
| \`overlay\` | \`onRender\` | \`GanttUiOverlayComponents\` | The cover the Gantt's \`overlay\` service shows over the chart |
| \`skeleton\` | \`onRender\`, \`onRenderSkeleton\` | \`GanttUiSkeletonComponents\` | The placeholder until the chart is drawn |
| **\`TaskGantt.Split\`** | | | |
| Top level | \`onRender\`, \`onRenderGridPane\`, \`onRenderGanttPane\`, \`onRenderHandle\` | \`GridGanttUiSplitComponents\` | The two panes and the handle between them |
| **\`TaskGantt.ZoomSlider\`** | | | |
| Top level | \`onRender\`, \`onRenderSlider\`, \`onRenderZoomButton\` | \`GanttUiZoomSliderComponents\` | The slider and its two zoom buttons |

The modules that draw something take \`components\` in their factory's parameters, read at mount:

| Key | Slots | Default | Draws |
|---|---|---|---|
| **Checklist module** | | | |
| \`progress\` | \`onRender\`, \`onRenderIcon\`, \`onRenderText\` | \`TaskChecklistUiProgressComponents\` | The *done/total* in a cell |
| **Dependencies module** | | | |
| \`count\` | \`onRender\`, \`onRenderIcon\`, \`onRenderArrow\`, \`onRenderCount\` | \`DependenciesUiCountComponents\` | The count in a *Predecessors* or *Successors* cell |
| **Lookup-many module** | | | |
| \`cell\` | \`onRenderPill\` | \`LookupManyUiPillsComponents\` | A record in a cell |
| \`editor\` | \`onRender\`, \`onRenderPill\`, \`onRenderOption\` | \`LookupManyUiSelectComponents\` | The picker, a picked record and a record offered |
| \`editorPopup\` | \`onRender\` | \`LookupManyUiEditorPopupComponents\` | The box the editor pops out in |
| \`filter\` | \`onRenderContainer\`, \`onRenderValue\`, \`onRenderButtons\`, \`onRenderApplyButton\`, \`onRenderClearButton\`; \`callout\` and \`select\` | \`LookupManyUiFilterComponents\`, \`FilteringUiCalloutComponents\`, \`LookupManyUiSelectComponents\` | The column's filter, its callout and its picker |
| **Templates module** | | | |
| \`selector\` | \`onRender\` | \`TemplatesUiRecordSelectorFrameComponents\` | The box the template picker is drawn in |
| \`list\` | \`onRenderRecord\` | \`TemplatesUiRecordListComponents\` | A template in the picker |
| **Task drawing module** | | | |
| \`preview\` | \`onRenderRow\`, \`onRenderSpan\`, \`onRenderCallout\`, \`onRenderText\` | \`TaskDrawingUiPreviewComponents\` | The row drawn on, the span and the callout with its dates |
| **Markers module** | | | |
| \`chip\` | \`onRender\`, \`onRenderChip\` | \`MarkerUiChipComponents\` | The chip on the scale; \`useMarker()\` returns its \`marker\` and \`left\` |
| \`line\`, \`scale\`, \`track\`, \`column\`, \`layer\` | \`onRender\` | \`MarkerUiLineComponents\`, \`MarkerUiScaleComponents\`, \`MarkerUiTrackComponents\`, \`MarkerUiColumnComponents\`, \`MarkerUiLayerComponents\` | The line down the chart, and the boxes the chips and lines sit in |
| **Non-working days module** | | | |
| \`tooltip\` | \`onRender\`, \`onRenderContainer\`, \`onRenderDescription\` | \`NonWorkingDaysUiTooltipComponents\` | The tooltip of a shaded day on the scale |
| **Tooltip module** | | | |
| \`onRender\` | The whole tooltip, of \`TaskTooltip\`'s parts; \`useTaskTooltip()\` reads the task | \`TaskTooltip.Renderer\` | What a bar says under the pointer |
| \`callout\` | \`onRender\`, \`onRenderContainer\` | \`TooltipUiCalloutComponents\` | The callout beside the pointer |
| \`header\` | \`header\`, \`headerStart\`, \`headerEnd\`, \`title\` (\`onRender\`); \`status\` (\`onRender\`, \`onRenderLabel\`) | \`CardHeaderComponents\`, \`CardHeaderStartComponents\`, \`CardHeaderEndComponents\`, \`CardTitleComponents\`, \`FieldOptionSetComponents\` | The name and the status pill |
| \`body\`, \`footer\` | \`onRender\` | \`CardBodyComponents\`, \`CardFooterComponents\` | The box under the header, and the band at the bottom |
| \`fieldList\` | \`onRender\` | \`FieldListComponents\` | The box that holds the fields, in the body and in the footer |
| \`progress\` | \`onRender\`, \`onRenderTrack\`, \`onRenderFill\`, \`onRenderText\` | \`FieldProgressComponents\` | The progress bar |
| \`dateRange\` | \`onRender\`, \`onRenderIcon\`, \`onRenderRange\`, \`onRenderDuration\` | \`FieldDateRangeComponents\` | The dates and the duration |
| **Links module** | | | |
| \`tooltip.onRender\` | A link's whole tooltip, of \`LinkTooltip\`'s parts; \`useLinkTooltip()\` reads the link | \`LinkTooltip.Renderer\` | What a link says under the pointer |
| \`tooltip.callout\`, \`tooltip.header\`, \`tooltip.body\`, \`tooltip.footer\`, \`tooltip.fieldList\`, \`tooltip.dateRange\` | As the tooltip module's keys of the same name; \`header\` has no \`status\` | | The callout, the type of the link, the body and footer, the lists, and the dates it joins |
| \`tooltip.predecessor\`, \`tooltip.successor\` | \`onRender\`, \`onRenderIcon\`, \`onRenderLabel\` | \`FieldValueComponents\` | The task on each end of the link |

The task grid's own cells take their slots like every grid cell: through \`cellRendererParams\`, or \`headerComponentParams\` for a header, set from a column definitions hook at \`TASK_GRID_PRIORITY.tree + 1\`, after the task tree gives the columns their cells. How to add such a hook is on [**Cells and headers of your own**](?path=/docs/controls-grid-guide-make-it-yours-cells-and-headers-of-your-own--overview).

| Cell | Slots | Default | Draws |
|---|---|---|---|
| \`TaskGrid.TreeCell\`, in the subject column | A cell's keys, plus \`indent\` (\`onRender\`) and \`toggle\` (\`onRender\`, \`onRenderButton\`) | \`TaskGridUiTreeCellIndentComponents\`, \`GroupingUiToggleComponents\` | The subject cell, its indent and its chevron |
| \`TaskGrid.PercentCompleteCell\`, in the \`percentComplete\` column | A cell's keys, plus \`progress\` (\`onRender\`) | \`TaskGridUiPercentCompleteComponents\` | The progress bar |
| \`TaskGrid.TaskCommandsCell\`, in the \`TASK_COMMANDS_COLUMN_KEY\` column | \`resizeGrip\`, \`container\` and \`loading\`, as in any cell, and \`commands\` (\`onRender\`, \`onRenderCommandBar\`) | \`TaskGridUiCommandsContainerComponents\`, \`TaskGridUiCommandBarComponents\` | The **+** and a row's other commands |
| \`TaskGrid.ExpansionHeader\`, the header of that column | \`expandCollapse\` (\`onRender\`, \`onRenderExpandButton\`, \`onRenderCollapseButton\`) | \`GroupingUiExpandCollapseComponents\` | The buttons that open and close a level |

To change the task grid's and the Gantt's strings, see [**Localization**](?path=/docs/concepts-localization--overview).
`

const meta = {
    title: 'Controls/TaskGrid/Reference',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

//a docs page needs a story, and this one has nothing to show
export const Overview: Story = {
    name: 'Overview',
    tags: ['!dev'],
    render: () => <></>,
}
