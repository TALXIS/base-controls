import type { Meta, StoryObj } from '@storybook/react'
import { gridDocsPage } from '../../grid/gridDocsPage'

const DESCRIPTION = `
Every prop, module parameter, runtime member and field mapping key of the task grid, in one place to look up.

## TaskDatasetControl props

Every other prop works as on a [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview).

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`onLoad\` | \`(taskRuntime: ITaskRuntime) => ITaskGridLoadResult \\| Promise<ITaskGridLoadResult>\` | Required | At mount | Returns the store, the field mapping and the views, on every mount. See *What onLoad returns* below. |
| \`modules\` | \`IDatasetControlModule[]\` | None | At mount | Task modules, and DatasetControl modules such as user views. |
| \`enableCreation\` | \`boolean\` | \`false\` | At mount | *New* in the ribbon, and the **+** on each active task's row. |
| \`enableEditing\` | \`boolean\` | \`false\` | At mount | *Edit* for the selected tasks, editing in the cells and on the timeline, and dragging. Without it, forms open read-only. |
| \`enableDeletion\` | \`boolean\` | \`false\` | At mount | *Delete* for the selected tasks. |
| \`defaultCreatePosition\` | \`'first' \\| 'last'\` | \`'first'\` | At mount | Where among its siblings a new task goes when the call names no place of its own. |
| \`onSetup\` | \`(control: IDatasetControl<ITaskViewData>) => void\` | None | At mount | Gets the DatasetControl of each mount, before its modules load. |

## TaskGrid props

Every other prop works as on a Grid: see [**Props and events**](?path=/docs/controls-grid-props-and-events--overview).

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`modules\` | \`ITaskGridGridModule[]\` | None | At mount | Grid modules, loaded after the tree. \`createTaskEditingModule()\` takes the place of the Grid's editing module; grouping and totals are left out. |
| \`components\` | \`IGridComponents\` | Defaults | Live | The Grid's overlays and rows. The task grid's own cells take theirs through \`cellRendererParams\`: see *Changing how it looks* on [**TaskGrid**](?path=/docs/controls-taskgrid-overview--overview). |
| \`enableZebra\` | \`boolean\` | \`false\` | At mount | Shades every other row. |
| \`enableOptionSetColors\` | \`boolean\` | \`true\` | At mount | Draws options that have a colour as tags. |

## Gantt props

\`TaskGantt\` and its parts come from \`@talxis/base-controls/gantt\`.

| Component | Prop | Type | Default | Timing | Description |
|---|---|---|---|---|---|
| \`TaskGantt\` | \`modules\` | \`IGanttModule[]\` | Required | At mount | The Gantt's modules, a library module among them. |
| | \`stateKey\` | \`string\` | None | At mount | Where the zoom is kept in each view. |
| | \`timelineLimits\` | \`{ start?: Dayjs, end?: Dayjs }\` | Today ± 25 years | Live | How far the timeline scrolls, widened to fit the tasks. |
| | \`components\` | \`ITaskGanttComponents\` | Defaults | Live | See *Changing how it looks* on [**TaskGrid**](?path=/docs/controls-taskgrid-overview--overview). |
| \`TaskGantt.Split\` | \`children\` | Two elements | Required | Live | The \`TaskGrid\`, then the \`TaskGantt\`. |
| | \`defaultGanttSize\` | \`number\` | \`60\` | At mount | The Gantt's share of the width, in percent, until the user drags the handle. |
| | \`stateKey\` | \`string\` | None | At mount | Where the user's width is kept in each view. |
| | \`components\` | \`Partial<IGridGanttUiSplitComponents>\` | Defaults | Live | See *Changing how it looks* on [**TaskGrid**](?path=/docs/controls-taskgrid-overview--overview). |
| \`TaskGantt.ZoomSlider\` | \`components\` | \`Partial<IGanttUiZoomSliderComponents>\` | Defaults | Live | See *Changing how it looks* on [**TaskGrid**](?path=/docs/controls-taskgrid-overview--overview). |

## What onLoad returns

\`onLoad\` on \`TaskDatasetControl\` returns an \`ITaskGridLoadResult\`.

| Key | Type | Default | Description |
|---|---|---|---|
| \`store\` | \`ITaskStore\` | Required | Where the tasks are kept. See *Stores* below. |
| \`fieldMapping\` | \`IFieldMapping\` | Required | The columns that make the tree. See *Field mapping* below. |
| \`views\` | \`ITaskGridView[]\` | None | The views to switch between. Without them, the grid shows the store's columns. |
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
| \`hostRecord\` | \`{ entityName, id?, data? }\` | The record the grid sits on, such as the one the form shows. |
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

| Module | Name | Memory | Dataverse | TALXIS | Your own store |
|---|---|---|---|---|---|
| Row dragging | \`dragging\` | \`createTaskDraggingModule()\` | The same | The same | The same |
| User views | \`userQueries\` | \`createLocalStorageUserQueriesModule\`, in the browser | \`createDataverseUserQueriesModule\` | \`createTalxisUserQueriesModule\` | \`createUserQueriesModule\` |
| Project | \`project\` | \`createMemoryProjectModule\` | \`createDataverseProjectModule\` | The Dataverse one | \`createProjectModule\` |
| Custom columns | \`customColumns\` | \`createMemoryCustomColumnsModule\` | None | \`createTalxisCustomColumnsModule\` | \`createCustomColumnsModule\` |
| Lookup many | \`lookupMany\` | \`createMemoryLookupManyModule\` | \`createDataverseLookupManyModule\` | The Dataverse one | \`createLookupManyModule\` |
| Templates | \`templates\` | \`createMemoryTemplatesModule\` | None | None | \`createTemplatesModule\` |
| Checklist | \`taskChecklist\` | \`createMemoryTaskChecklistModule\` | None | \`createTalxisTaskChecklistModule\` | \`createTaskChecklistModule\` |
| Dependencies | \`dependencies\` | \`createMemoryDependenciesModule\` | \`createDataverseDependenciesModule\` | \`createTalxisDependenciesModule\` | \`createDependenciesModule\` |

The parameters of the user views factories are on [**User views**](?path=/docs/controls-datasetcontrol-views-user-views--overview). \`createTaskEditingModule()\` goes in \`TaskGrid\`'s \`modules\` and takes no parameters.

### Project

| Factory | Parameter | Type | Default | Description |
|---|---|---|---|---|
| \`createMemoryProjectModule\` | \`projects\` | \`MemoryTable<IMemoryProject>\` | Required | The projects, keyed by \`id\`, their dates as ISO strings. |
| | \`projectId\` | \`string\` | Required | The project the grid shows. |
| \`createDataverseProjectModule\` | \`entityName\` | \`string\` | Required | The project's table. |
| | \`id\` | \`string\` | Required | The project record's id. |
| | \`startDateColumn\`, \`endDateColumn\` | \`string\` | None | The columns holding its start and end. |
| | \`columns\` | \`string[]\` | None | More columns to read into \`data\`. |
| \`createProjectModule\` | \`createStore\` | \`(taskRuntime) => IProjectStore\` | Required | Called on every mount; the store's \`loadProject()\` returns the project, before the tasks load. |

| Project field | Type | Description |
|---|---|---|
| \`id\` | \`string\` | Required. |
| \`name\` | \`string\` | The project's name. |
| \`entityName\` | \`string\` | The table the project lives in. \`DataverseTaskStore\` fills in the project lookup on new tasks only when it is set. |
| \`startDate\`, \`endDate\` | \`Dayjs\` | The project's dates. |
| \`data\` | \`object\` | Anything else; in FetchXML, its keys are fields of \`project\`. |

### Custom columns

| Factory | Parameter | Type | Default | Description |
|---|---|---|---|---|
| Every one | \`enableCreation\` | \`boolean\` | \`false\` | *Add custom column* in *Edit columns*. |
| | \`enableEditing\` | \`boolean\` | \`false\` | The edit command beside each custom column. Not on the memory factory. |
| | \`enableDeletion\` | \`boolean\` | \`false\` | The delete command beside each custom column. |
| \`createMemoryCustomColumnsModule\` | \`columns\` | \`MemoryTable<ICustomColumnRow>\` | Required | The columns, keyed by \`name\`. |
| | \`values\` | \`MemoryTable<ICustomColumnValuesRow>\` | Required | Each task's values, as \`{ taskId, values }\` keyed by \`taskId\`. |
| \`createTalxisCustomColumnsModule\` | \`entityName\` | \`string\` | Required | The table the columns are defined for. |
| | \`recordId\` | \`string\` | None | Also loads the columns defined for this record, such as the project. |
| | \`navigationPropertyName\` | \`string\` | None | The relationship from the task table to \`talxis_attributevalue\`, when there are several. |
| \`createCustomColumnsModule\` | \`createStore\` | \`(taskRuntime) => ICustomColumnsStore\` | Required | Called on every mount. |

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

| Factory | Parameter | Type | Default | Description |
|---|---|---|---|---|
| Every one | \`columns\` | \`{ [columnName]: ILookupManyColumn }\` | Required | The lookup-many columns by name. |
| | \`components\` | \`ILookupManyComponents\` | Defaults | See *Changing how it looks* on [**TaskGrid**](?path=/docs/controls-taskgrid-overview--overview). |
| \`createMemoryLookupManyModule\` | \`sources\` | \`{ [entityName]: { records, metadata, columns } }\` | Required | The records to pick from, by table name; \`records\` is a \`MemoryTable\`. |
| | \`values\` | \`MemoryTable<IMemoryLookupManyValues>\` | Required | Each task's picks, as \`{ taskId, values }\` keyed by \`taskId\`, \`values\` by column name. |
| \`createDataverseLookupManyModule\` | \`hostRecord\` | \`{ entityName, id?, data? }\` | None | The record the grid sits on, as \`hostRecord\` in each column's FetchXML. |
| \`createLookupManyModule\` | \`createStore\` | \`(taskRuntime) => ILookupManyStore\` | Required | Called on every mount. |

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

| Factory | Parameter | Type | Default | Description |
|---|---|---|---|---|
| Every one | \`components\` | \`ITemplatesComponents\` | Defaults | See *Changing how it looks* on [**TaskGrid**](?path=/docs/controls-taskgrid-overview--overview). |
| \`createMemoryTemplatesModule\` | \`templates\` | \`MemoryTable<IMemoryTemplate>\` | Required | The templates, keyed by \`id\`: \`{ id, name, data?, children? }\`, each child \`{ data?, children? }\`. |
| | \`tasks\` | \`MemoryTable<IRawRecord>\` | Required | The table the template's tasks are created in, the one \`MemoryTaskStore\` reads. |
| \`createTemplatesModule\` | \`createStore\` | \`(taskRuntime) => ITemplatesStore\` | Required | Called on every mount. |

| ITemplatesStore method | Description |
|---|---|
| \`createTemplatesProvider()\` | A provider over the templates, searched by the picker; made each time it opens. |
| \`createTasks({ templateId, parentRecord, stackRank })\` | Creates the template's tasks, its own at \`stackRank\` under \`parentRecord\` and the rest under it. Returns \`{ records }\`, or \`null\` when there were none or the user cancelled. |
| \`createTemplate({ name, tree })\` | Optional. Saves a task and its subtasks as a template; without it, there is no *Save as template*. |
| \`destroy()\` | Optional. Called when the mount goes. |

### Checklist

| Factory | Parameter | Type | Default | Description |
|---|---|---|---|---|
| Every one | \`reloadOnEditorClosed\` | \`boolean\` | \`false\`; \`true\` for TALXIS | Reads a task's items again once its form closes. |
| | \`components\` | \`ITaskChecklistComponents\` | Defaults | See *Changing how it looks* on [**TaskGrid**](?path=/docs/controls-taskgrid-overview--overview). |
| \`createMemoryTaskChecklistModule\` | \`items\` | \`MemoryTable<IMemoryTaskChecklistItem>\` | Required | The items, \`{ id, taskId, name, isCompleted }\`, keyed by \`id\`. |
| \`createTalxisTaskChecklistModule\` | | | | Reads each task's \`talxis_checklistjson\`, a JSON array of \`{ id, name, isCompleted }\`. |
| \`createTaskChecklistModule\` | \`createStore\` | \`(taskRuntime) => ITaskChecklistStore\` | Required | Called on every mount; the store's \`loadItems(taskIds)\` returns the items by task id, and its optional \`destroy()\` runs when the mount goes. |

### Dependencies

| Factory | Parameter | Type | Default | Description |
|---|---|---|---|---|
| Every one | \`reloadOnEditorClosed\` | \`boolean\` | \`false\`; \`true\` for Dataverse and TALXIS | Reads a task's dependencies again once its form closes. |
| | \`components\` | \`IDependenciesComponents\` | Defaults | See *Changing how it looks* on [**TaskGrid**](?path=/docs/controls-taskgrid-overview--overview). |
| \`createMemoryDependenciesModule\` | \`dependencies\` | \`MemoryTable<ITaskDependency>\` | Required | The dependencies, keyed by \`id\`. |
| \`createDataverseDependenciesModule\` | \`entityName\` | \`string\` | Required | The dependency table. |
| | \`predecessorAttribute\`, \`successorAttribute\` | \`string\` | Required | Its two lookups to the task table. |
| | \`typeAttribute\` | \`string\` | Required | Its option set of the type. |
| | \`dependencyTypeCodes\` | \`{ [value: number]: TaskDependencyType }\` | Required | Every value of that option set, and the type it stands for; a value left out fails the load. |
| \`createTalxisDependenciesModule\` | | | | The Dataverse factory with \`talxis_taskdependency\` mapped. |
| \`createDependenciesModule\` | \`createStore\` | \`(taskRuntime) => IDependenciesStore\` | Required | Called on every mount. |

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

| Factory | Parameter | Type | Default | Description |
|---|---|---|---|---|
| \`createProLibraryModule\` | \`Gantt\` | \`GanttEnterprise\` | Required | The PRO build's \`Gantt\` export. |
| \`createBarDraggingModule\` | \`enableMove\` | \`boolean\` | \`true\` | Dragging a bar to other dates. |
| | \`enableResize\` | \`boolean\` | \`true\` | Dragging a bar's ends. |
| \`createTaskDrawingModule\` | \`components\` | \`ITaskDrawingComponents\` | Defaults | See *Changing how it looks* on [**TaskGrid**](?path=/docs/controls-taskgrid-overview--overview). |
| \`createTaskSelectionModule\` | \`enableSelectionBox\` | \`boolean\` | \`true\` | Shift+drag selects the bars under a band. |
| \`createTaskTooltipModule\` | \`statusColumnName\` | \`string\` | None | An option set column the header shows as a pill in its option's colour. |
| | \`components\` | \`ITaskTooltipComponents\` | Defaults | See *Changing how it looks* on [**TaskGrid**](?path=/docs/controls-taskgrid-overview--overview). |
| \`createLinksModule\` | \`components\` | \`ILinksComponents\` | Defaults | See *Changing how it looks* on [**TaskGrid**](?path=/docs/controls-taskgrid-overview--overview). |
| \`createMarkersModule\`, \`createMemoryMarkersModule\` | \`today\` | \`{ enableMarker?, color?, lineStyle? }\` | \`{ enableMarker: true }\` | Today's marker. |
| | \`project\` | \`{ enableMarkers?, color?, lineStyle? }\` | \`{ enableMarkers: true }\` | The project's start and end. |
| | \`components\` | \`IMarkersComponents\` | Defaults | See *Changing how it looks* on [**TaskGrid**](?path=/docs/controls-taskgrid-overview--overview). |
| \`createMarkersModule\` | \`createStore\` | \`(taskRuntime) => IMarkersStore\` | None | A store whose \`loadMarkers()\` returns markers of your own. |
| \`createMemoryMarkersModule\` | \`markers\` | \`MemoryTable<IMemoryMarker>\` | Required | The markers, their dates as ISO strings. |
| \`createNonWorkingDaysModule\`, \`createMemoryNonWorkingDaysModule\` | \`enableWeekends\` | \`boolean\` | \`true\` | Saturdays and Sundays are non-working days. |
| | \`isVisibleByDefault\` | \`boolean\` | \`true\` | Shows the days until the user hides them. |
| | \`enableDropOnNonWorkingDays\` | \`boolean\` | \`false\` | Lets a dragged or drawn bar start or end on a non-working day. |
| | \`components\` | \`INonWorkingDaysComponents\` | Defaults | See *Changing how it looks* on [**TaskGrid**](?path=/docs/controls-taskgrid-overview--overview). |
| \`createNonWorkingDaysModule\` | \`createStore\` | \`(taskRuntime) => INonWorkingDaysStore\` | None | A store whose \`loadNonWorkingDays()\` returns days of your own. |
| \`createMemoryNonWorkingDaysModule\` | \`nonWorkingDays\` | \`MemoryTable<IMemoryNonWorkingDay>\` | Required | The days, their dates as ISO strings. |

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
| \`getProvider()\` | The task provider. See *The task provider* below. |
| \`getView()\` | The open view, with its \`data\`. |
| \`getFieldMapping()\` | The field mapping \`onLoad\` returned. |
| \`getHoursPerDay()\` | The \`hoursPerDay\` \`onLoad\` returned, \`24\` when it returned none. |
| \`getLabels(set)\` | A label set as the control translates it. |
| \`isFlatList()\`, \`setFlatList(isFlatList)\` | Whether the tasks show without the tree. |
| \`isCreationEnabled()\`, \`isEditingEnabled()\`, \`isDeletionEnabled()\` | The control's \`enable…\` props. |
| \`hooks.ribbonCommandUi\` | Changes every item \`TaskDatasetControl.Ribbon\` draws, those in its menus too. |
| \`getRibbonCommandItems(items)\` | Copies of \`items\` with every ribbon command UI hook applied. |
| \`lifecycle\` | The mount's status and events. See [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). |
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
| \`taskTree\` | The grid's tree, while \`TaskGrid\` is drawn: \`revealTask(taskId)\` scrolls a task into view. |
| \`savingChains\` | The tasks a save can reach: \`isTaskSaving(taskId)\`, \`isTaskLocked(taskId)\`, and \`track(taskIds, operation)\` for a write of your own. |

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
| \`isTaskPending(taskId)\`, \`whenTaskCreated(taskId)\` | Whether the store is still creating a task, and a promise of \`true\` once it has, \`false\` when it dropped it; it rejects when the store failed. |
| \`createTasksWith(parentId, create, { position? })\` | Adds the tasks \`create\` makes in your backend: \`create\` gets \`{ parentRecord, stackRank }\` and returns \`{ records }\`. |
| \`moveTask(taskId, targetTaskId, position)\` | Places a task without saving it; \`null\` when it cannot go there. |
| \`deleteTasks(taskIds)\` | Deletes the tasks and their subtasks through the store, the deepest first; \`tasks.delete\` asks the user first. |
| \`openTasks(taskIds)\`, \`openRelatedRecord(reference, columnName)\` | What the store does for them. |
| \`updateTaskData(rawRecords)\` | Merges values into the loaded tasks by their id, keeping the user's unsaved edits. |
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
| \`onTasksUpdated(records)\` | When tasks take new values in place, whatever changed them. |
| \`onEditorClosed(taskIds)\` | When the form the tasks were opened in closes. |
| \`onTreeChanged()\` | When the tree is worked out again, such as after a task is added, moved or deleted. |
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
