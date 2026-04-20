# TaskGrid

A hierarchical task management grid built on [AG Grid](https://www.ag-grid.com/). It renders tasks in a parent-child tree structure with support for drag-and-drop reordering, inline editing, saved views, custom columns, and template-based task creation.

---

## Usage

Import and render the `<TaskGrid />` React component, passing it a `pcfContext` and your `ITaskGridDescriptor` implementation:

```tsx
import { TaskGrid } from '@talxis/base-controls';
import { MyDescriptor } from './MyDescriptor';

const descriptor = new MyDescriptor();

export const MyTaskGridPage = ({ pcfContext }) => (
    <TaskGrid
        pcfContext={pcfContext}
        taskGridDescriptor={descriptor}
    />
);
```

### `<TaskGrid />` props

| Prop | Required | Description |
|------|:--------:|-------------|
| `pcfContext` | ✅ | The PCF `ComponentFramework.Context` instance. Used for navigation, error dialogs, and environment utilities. |
| `taskGridDescriptor` | ✅ | Your implementation of `ITaskGridDescriptor`. The single configuration entry point for all business logic. |
| `labels?` | — | Partial `ITaskGridLabels` override. Any key you supply replaces the English default for that label. |
| `components?` | — | Partial `ITaskGridComponents` override. Allows replacing the skeleton loader (`onRenderSkeleton`) or the command bar (`onRenderCommandBar`). |

The component manages its own `ITaskGridState` (active view, filters, sorting, column widths, flat-list toggle) internally using a React ref. State survives remounts triggered by view changes.

---

## The Descriptor

The descriptor is where you wire all business logic into the grid. Create a class that implements `ITaskGridDescriptor`.

### Minimal example

```ts
import {
    ITaskGridDescriptor,
    INativeColumns,
    ITaskStrategyDeps,
} from '@talxis/base-controls';
import { ISavedQueryStrategy, ISavedQuery } from '@talxis/base-controls/dist/components/TaskGrid/data-providers';
import { MyTaskStrategy } from './MyTaskStrategy';

export class MyDescriptor implements ITaskGridDescriptor {

    public onGetNativeColumns(): INativeColumns {
        return {
            subject:         'subject',
            parentId:        'my_parenttaskid',
            stackRank:       'my_stackrank',
            stateCode:       'statecode',
            path:            'talxis_path',  // virtual — computed by the grid
            percentComplete: 'percentcomplete',
        };
    }

    public onCreateTaskStrategy(deps: ITaskStrategyDeps) {
        return new MyTaskStrategy(deps);
    }

    public onCreateSavedQueryStrategy(): ISavedQueryStrategy {
        return {
            onGetSystemQueries: async (): Promise<ISavedQuery[]> => [
                {
                    id: '00000000-0000-0000-0000-000000000000',
                    name: 'All Tasks',
                    isFlatListEnabled: false,
                    columns: MY_DEFAULT_COLUMNS,
                },
            ],
            onEnableUserQueries: () => true,
            onGetUserQueries:    async () => [],
            onCreateUserQuery:   async () => null,
            onUpdateUserQuery:   async () => null,
            onDeleteUserQueries: async () => ({ success: true, deletedQueryIds: [] }),
        };
    }

    public onCreateUserQueryDataProvider() {
        return new MyUserQueryProvider();
    }
}
```

### Full example — all optional features (in-memory)

The `MemoryDescriptor` pattern shows every optional hook in action using in-memory data, making it ideal as a reference or for testing:

```ts
export class MemoryDescriptor implements ITaskGridDescriptor {

    private _userQueries: ISavedQuery[] = [
        {
            id: 'uq-default-01-0000-0000-000000000000',
            name: 'My Open Tasks',
            isFlatListEnabled: false,
            columns: COLUMNS.filter(c =>
                c.isHidden ||
                ['subject', 'statuscode', 'priority', 'scheduledend', 'assignedto'].includes(c.name)
            ),
            filtering: {
                filterOperator: 1, // And
                conditions: [{ attributeName: 'statecode', conditionOperator: 0, value: '0' }],
            },
        },
    ];

    public onGetNativeColumns(): INativeColumns {
        return {
            subject: SUBJECT_COL, parentId: PARENT_ID_COL, stackRank: STACK_RANK_COL,
            path: PATH_COL, stateCode: STATE_CODE_COL, percentComplete: PERCENT_COMPLETE_COL,
        };
    }

    public onCreateTaskStrategy(deps: ITaskStrategyDeps) {
        // deps.templateDataProvider is non-null because onCreateTemplateDataProvider is defined.
        return new MemoryTaskStrategy(deps.templateDataProvider);
    }

    public onCreateSavedQueryStrategy(): ISavedQueryStrategy {
        return {
            onGetSystemQueries: async () => [{
                id: '00000000-0000-0000-0000-000000000000',
                name: 'All Tasks',
                isFlatListEnabled: false,
                columns: COLUMNS.filter(c =>
                    c.isHidden || ['subject', 'statuscode', 'priority', 'scheduledend', 'percentcomplete', 'assignedto', 'tags'].includes(c.name)
                ),
            }],
            onEnableUserQueries: () => true,
            onGetUserQueries: async () => [...this._userQueries],

            onCreateUserQuery: async (newQuery, currentQuery) => {
                const id = crypto.randomUUID();
                this._userQueries.push({ ...currentQuery, id, name: newQuery.name });
                return id;
            },
            onUpdateUserQuery: async (currentQuery) => {
                const idx = this._userQueries.findIndex(q => q.id === currentQuery.id);
                if (idx >= 0) this._userQueries[idx] = { ...currentQuery };
                return currentQuery.id;
            },
            onDeleteUserQueries: async (queryIds) => {
                const deleted: string[] = [];
                for (const id of queryIds) {
                    const idx = this._userQueries.findIndex(q => q.id === id);
                    if (idx >= 0) { this._userQueries.splice(idx, 1); deleted.push(id); }
                }
                return { success: true, deletedQueryIds: deleted };
            },
        };
    }

    public onCreateUserQueryDataProvider() {
        // The provider backs the rename / description fields in the save-view dialog.
        const provider = new MemoryDataProvider({
            dataSource: this._userQueries.map(q => ({ queryid: q.id, name: q.name })),
            metadata: { PrimaryIdAttribute: 'queryid', LogicalName: 'mem_userquery' },
        });
        provider.setColumns([
            { name: 'queryid', dataType: 'SingleLine.Text', displayName: 'ID', isHidden: true },
            { name: 'name',    dataType: 'SingleLine.Text', displayName: 'Name', visualSizeFactor: 200 },
        ]);
        provider.addEventListener('onAfterRecordSaved', (result) => {
            if (result.success) {
                const updated = this._userQueries.find(q => q.id === result.recordId);
                if (updated) updated.name = provider.getRecordsMap()[result.recordId].getValue('name');
            }
        });
        return provider;
    }

    // Optional: returning a non-null provider enables the "Task from Template" button.
    public onCreateTemplateDataProvider() {
        const provider = new MemoryDataProvider({ dataSource: SAMPLE_TEMPLATES, metadata: TEMPLATE_METADATA });
        provider.setColumns(TEMPLATE_COLUMNS);
        return provider;
    }

    public onGetGridParameters(): ITaskGridParameters {
        return {
            height: '600px',
            enableRowDragging: true,
            enableEditColumns: true,
            enableShowHierarchyToggle: true,
            enableHideInactiveTasksToggle: true,
            enableEditColumnsScopeSelector: false,
        };
    }
}
```

---

## Descriptor interface reference

| Method | Required | Description |
|--------|:--------:|-------------|
| `onGetNativeColumns()` | ✅ | Maps logical column roles to physical schema attribute names. |
| `onCreateSavedQueryStrategy()` | ✅ | Returns the strategy for loading and persisting saved views. |
| `onCreateTaskStrategy(deps)` | ✅ | Returns the strategy for all task CRUD, move, and template operations. `deps.templateDataProvider` and `deps.customColumnsDataProvider` are set when those features are enabled. |
| `onCreateUserQueryDataProvider()` | ✅ | Returns an `IDataProvider` that backs the save-view dialog. |
| `onCreateCustomColumnsStrategy?()` | — | Enables dynamic (user-defined) columns. Provide `TalxisCustomColumnsStrategy` for Dataverse or your own `ICustomColumnsStrategy`. |
| `onCreateTemplateDataProvider?()` | — | Enables template-based task creation. Return an `IDataProvider` whose records represent templates. |
| `onCreateGridCustomizerStrategy?()` | — | Deep-customizes AG Grid column definitions, cell renderers, cell editors, and row class rules. |
| `onGetAgGridLicenseKey?()` | — | Supplies the AG Grid Enterprise license key. |
| `onGetControlId?()` | — | Returns a stable DOM identifier for the control. Auto-generated if omitted. |
| `onLoadDependencies?()` | — | Async hook called once before providers are created. Use for authentication or data pre-loading. |
| `onGetGridParameters?()` | — | Returns `ITaskGridParameters` UI feature flags. All flags default to `true` when omitted. |

---

## `INativeColumns`

Maps logical roles to the actual attribute names in your entity schema. All fields except `percentComplete` are required.

| Property | Role |
|----------|------|
| `subject` | Display name / title. Always pinned left; the grid never hides it. |
| `parentId` | Lookup to the parent task — drives the tree hierarchy. |
| `stackRank` | Numeric ordering field. Used for default sort and drag-and-drop reordering. |
| `stateCode` | Active/inactive status. Used by the *Hide inactive tasks* filter. |
| `path` | Virtual breadcrumb computed from ancestor names. Marked read-only automatically; does not need to be a real schema field. |
| `percentComplete?` | (Optional) Numeric completion percentage. Rendered with a progress-bar cell renderer. |

---

## `ITaskGridParameters`

Feature flags returned by `onGetGridParameters`. All properties are optional and default to `true`.

| Property | Default | Description |
|----------|:-------:|-------------|
| `height` | `null` | CSS height for the grid container. Omit to size the grid to its parent. |
| `enableRowDragging` | `true` | Show drag handles and allow reordering. Suppressed automatically in flat-list mode or when sorted by a non-stack-rank column. |
| `enableEditColumns` | `true` | Show the *Edit Columns* ribbon button. |
| `enableQuickFind` | `true` | Show the quick-find search input. |
| `enableViewSwitcher` | `true` | Show the view-switcher dropdown. |
| `enableShowHierarchyToggle` | `true` | Show the *Show hierarchy* toggle. |
| `enableHideInactiveTasksToggle` | `true` | Show the *Hide inactive tasks* toggle. |
| `enableEditColumnsScopeSelector` | `true` | Show the personal/system scope selector inside the Edit Columns panel. |

---

## `ITaskDataProviderStrategy`

Handles all data access and mutation for tasks. Implement this and return it from `onCreateTaskStrategy`.

### Minimal in-memory implementation

```ts
export class MemoryTaskStrategy implements ITaskDataProviderStrategy {
    private _data = new Map<string, IRawRecord>(
        TASKS.map(t => [t[PRIMARY_ID] as string, { ...t }])
    );
    private _provider!: ITaskDataProvider;
    private _taskTree!: IRecordTree;

    public async onInitialize(provider: ITaskDataProvider) {
        // Store the provider — needed in other methods.
        this._provider = provider;
        this._taskTree = provider.getRecordTree();
        return {
            columns:  COLUMNS,
            rawData:  [...this._data.values()],
            metadata: { PrimaryIdAttribute: PRIMARY_ID, LogicalName: ENTITY_NAME },
        };
    }

    public async onGetRawRecords(ids: string[]): Promise<IRawRecord[]> {
        return ids.flatMap(id => { const r = this._data.get(id); return r ? [r] : []; });
    }

    public async onGetAvailableColumns() { return COLUMNS.filter(c => !c.isHidden); }
    public async onGetAvailableRelatedColumns() { return []; }
    public onGetQuickFindColumns() { return [SUBJECT_COL, 'assignedto', 'tags']; }

    public async onCreateTask(parentTaskId?: string): Promise<IRawRecord | null> {
        const id = crypto.randomUUID();
        const task: IRawRecord = {
            [PRIMARY_ID]: id,
            subject: 'New Task',
            [PARENT_ID_VALUE_KEY]: parentTaskId ?? null,
            [STACK_RANK_COL]: lexoRankBefore(minSiblingRank(parentTaskId, this._data)),
            statecode: 0, statuscode: 1, percentcomplete: 0,
        };
        this._data.set(id, task);
        return task;
    }

    public async onDeleteTasks(taskIds: string[]): Promise<IDeleteTasksResult> {
        // Recursively collect descendants so orphaned children are removed too.
        const toDelete = new Set<string>();
        for (const id of taskIds) this._collectDescendants(id, toDelete);
        for (const id of toDelete) this._data.delete(id);
        return { success: true, deletedTaskIds: [...toDelete] };
    }

    private _collectDescendants(id: string, result: Set<string>): void {
        result.add(id);
        for (const child of this._taskTree.getNode(id)?.directChildren ?? [])
            this._collectDescendants(child.getRecordId(), result);
    }

    public async onEditTasks(_ids: string[]) {
        // In-memory: editing happens inline — no modal needed.
        return null;
    }

    public async onMoveTask(movingId: string, targetId: string, position: 'above' | 'below' | 'child'): Promise<IRawRecord[] | null> {
        const moving = this._data.get(movingId)!;
        const target = this._data.get(targetId)!;
        if (position === 'child') {
            moving[PARENT_ID_VALUE_KEY] = targetId;
            moving[STACK_RANK_COL]      = lexoRankBefore(minChildRank(targetId, this._taskTree, this._data));
        } else {
            moving[PARENT_ID_VALUE_KEY] = target[PARENT_ID_VALUE_KEY];
            moving[STACK_RANK_COL]      = lexoRankBetweenSiblings(targetId, position, this._taskTree, this._data);
        }
        this._data.set(movingId, moving);
        return [moving];
    }

    public async onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult> {
        const existing = this._data.get(record.getRecordId());
        if (!existing) return { success: false, recordId: record.getRecordId(), fields: [], errors: [{ message: 'Not found' }] };
        for (const col of EDITABLE_COLUMNS) {
            const val = record.getValue(col);
            if (val !== undefined) existing[col] = val;
        }
        this._data.set(record.getRecordId(), existing);
        return { success: true, recordId: record.getRecordId(), fields: EDITABLE_COLUMNS };
    }

    public async onCreateTemplateFromTask(taskId: string): Promise<IRawRecord | null> {
        const task = this._data.get(taskId);
        if (!task) return null;
        const id = crypto.randomUUID();
        const template = { mem_templateid: id, subject: task.subject };
        SAMPLE_TEMPLATES.push(template);
        this._templateDataProvider?.setDataSource(SAMPLE_TEMPLATES);
        return template;
    }

    public async onCreateTasksFromTemplate(templateId: string, parentId?: string): Promise<IRawRecord[] | null> {
        const template = this._templateDataProvider?.getRecordsMap()[templateId]?.getRawData();
        if (!template) return null;
        const created: IRawRecord[] = [];
        this._createFromNodes(TEMPLATE_CHILDREN[templateId] ?? [], parentId, created);
        return created;
    }

    public onIsRecordActive(recordId: string): boolean {
        const statuscode = this._data.get(recordId)?.statuscode as number;
        return statuscode !== 5 && statuscode !== 6; // 5 = Completed, 6 = Cancelled
    }

    public onOpenDatasetItem(_ref: ComponentFramework.EntityReference): void { /* no-op */ }
}
```

### Strategy interface reference

| Method | Description |
|--------|-------------|
| `onInitialize(provider)` | Called once on first load. Return `{ columns, rawData, metadata }`. Store the `provider` reference for use in other methods. |
| `onGetRawRecords(ids)` | Fetch raw records by id. An empty array fetches all records. |
| `onGetAvailableColumns(options?)` | Return all columns that can be displayed (native + custom). |
| `onGetAvailableRelatedColumns()` | Return linked-entity columns for filtering/sorting. |
| `onGetQuickFindColumns()` | Return attribute names searched by the quick-find input. |
| `onCreateTask(parentTaskId?)` | Create a task (optionally as a child). Return raw record or `null` for cancellation. |
| `onDeleteTasks(taskIds)` | Delete tasks. Return a per-task success/failure result. |
| `onCreateTemplateFromTask(taskId)` | Create a template from a task. Return raw record or `null`. |
| `onCreateTasksFromTemplate(templateId, parentId?)` | Instantiate tasks from a template. Return raw records or `null`. |
| `onEditTasks(taskIds)` | Open edit form(s). Return updated records or `null` for cancellation. |
| `onMoveTask(movingId, targetId, position)` | Move a task above, below, or as a child. Return updated records or `null` for cancellation. |
| `onRecordSave(record)` | Persist inline cell edits. Return `IRecordSaveOperationResult`. |
| `onIsRecordActive(recordId)` | Return `false` for completed/cancelled tasks. Inactive rows receive a greyed-out style. |
| `onOpenDatasetItem(entityReference, context?)` | Called on non-subject cell clicks. Open the record form or a related record. |
| `onIsTaskAddingEnabled?()` | Defaults to `true`. Return `false` to hide the *New* button. |
| `onIsTaskEditingEnabled?()` | Defaults to `true`. Return `false` to disable inline editing. |
| `onIsTaskDeletingEnabled?()` | Defaults to `true`. Return `false` to hide the *Delete* button. |
| `onGetRootTaskId?()` | Scope the tree to a subtree by returning the root task id. |

---

## `IGridCustomizerStrategy`

Return this from `onCreateGridCustomizerStrategy` to deeply customize the AG Grid instance.

### Example — custom renderers, editors, and record expressions

```ts
export class YungoGridCustomizerStrategy implements IGridCustomizerStrategy {
    private _customizer!: IGridCustomizer;
    private _taskDataProvider!: ITaskDataProvider;
    private _loadingCells = new Map<string, Set<string>>();

    public onInitialize(customizer: IGridCustomizer): void {
        this._customizer = customizer;
        this._taskDataProvider = customizer.getTaskDataProvider();

        this._taskDataProvider.addEventListener('onRecordLoaded',     (record) => this._onRecordLoaded(record));
        this._taskDataProvider.addEventListener('onAfterRecordSaved', (result) => this._onAfterRecordSaved(result));
        this._taskDataProvider.taskEvents.addEventListener('onBeforeTasksEdited', (ids)    => this._snapshotBeforeEdit(ids));
        this._taskDataProvider.taskEvents.addEventListener('onAfterTasksEdited',  (result) => this._refreshAfterEdit(result));
    }

    public onGetColumnDefinitions(colDefs: ColDef<IRecord>[]): ColDef<IRecord>[] {
        for (const colDef of colDefs) {
            switch (colDef.colId) {
                case 'ntg_relatedfinancialmilestoneid':
                    colDef.cellEditor = MilestoneCellEditor;
                    break;
                case TagDataProvider.TAG_COLUMN_NAME:
                    colDef.cellRenderer = TagsCellRenderer;
                    colDef.editable = false;
                    colDef.suppressKeyboardEvent = () => true;
                    break;
                case AssigneeDataProvider.ASSIGNEE_COLUMN_NAME:
                    colDef.cellRenderer = AssigneesCellRenderer;
                    colDef.editable = false;
                    break;
            }
        }
        return colDefs;
    }

    private _onRecordLoaded(record: IRecord): void {
        // registerExpressionDecorator is a no-op when the column is absent — safe to call unconditionally.

        // Highlight overdue due-dates in red, today's due-date in yellow.
        this._customizer.registerExpressionDecorator('scheduledend', () => {
            record.expressions.ui.setCustomFormattingExpression('scheduledend', (cellTheme) => {
                const raw = record.getValue('scheduledend');
                if (!raw) return undefined;
                const date = new Date(raw); date.setHours(0, 0, 0, 0);
                const today = new Date(); today.setHours(0, 0, 0, 0);
                if (date < today)  return { backgroundColor: cellTheme.semanticColors.errorBackground };
                if (date.getTime() === today.getTime()) return { backgroundColor: cellTheme.semanticColors.warningBackground };
                return undefined;
            });
        });

        // Disable effort editing on parent tasks — values are server-aggregated.
        this._customizer.registerExpressionDecorator('ntg_estimatedeffort', () => {
            record.expressions.setDisabledExpression('ntg_estimatedeffort', () =>
                !record.isActive() ||
                this._taskDataProvider.getRecordTree().hasChildren(record.getRecordId())
            );
        });

        // Suppress navigation link on milestone lookups.
        this._customizer.registerExpressionDecorator('ntg_relatedfinancialmilestoneid', () => {
            record.expressions.ui.setControlParametersExpression('ntg_relatedfinancialmilestoneid', (defaults) => ({
                ...defaults, EnableNavigation: { raw: false }
            }));
        });

        // Show a loading spinner for cells being refreshed in the background.
        for (const col of this._taskDataProvider.getColumns()) {
            if (!col.isHidden) {
                this._customizer.registerExpressionDecorator(col.name, () => {
                    record.expressions.ui.setLoadingExpression(col.name, () =>
                        this._loadingCells.get(record.getRecordId())?.has(col.name) ?? false
                    );
                });
            }
        }
    }

    private async _onAfterRecordSaved(result: IRecordSaveOperationResult): Promise<void> {
        if (!result.success) return;
        const { recordId, fields } = result;

        if (['ntg_actualeffort', 'ntg_remainingeffort', 'ntg_estimatedeffort'].some(f => fields.includes(f))) {
            // Re-fetch ancestors so aggregated effort values update in the grid.
            const node = this._taskDataProvider.getRecordTree().getNode(recordId);
            await this._fetchAndShow([recordId, ...node.pathIds.slice(0, -1)], ['ntg_estimatedeffort', 'ntg_actualeffort', 'percentcomplete']);
        }

        if (fields.includes('statuscode')) {
            const status = this._taskDataProvider.getRecordsMap()[recordId].getValue('statuscode');
            if (status === CLOSED || status === CANCELLED) {
                const node = this._taskDataProvider.getRecordTree().getNode(recordId);
                await this._fetchAndShow([...node.allChildren.map(r => r.getRecordId()), recordId], ['statuscode', 'statecode']);
            }
        }
    }

    private async _fetchAndShow(ids: string[], columns: string[]): Promise<void> {
        const columnSet = new Set(columns);
        for (const id of ids) this._loadingCells.set(id, columnSet);
        this._taskDataProvider.requestRender();
        const rawData = await this._taskDataProvider.fetchRawRecords(ids);
        this._taskDataProvider.updateTaskData(rawData);
        this._loadingCells.clear();
        this._taskDataProvider.requestRender();
    }
}
```

### Strategy interface reference

| Method | Description |
|--------|-------------|
| `onInitialize(customizer)` | Called once after the grid is ready. Store the `customizer` reference for later. Subscribe to data provider events here. |
| `onGetColumnDefinitions?(colDefs)` | Receives the computed column definitions and may return a modified array. |
| `onGetRowClassRules?(rules)` | Receives the default row CSS class rules map and may extend or override it. |
| `onGetCellRenderer?(colDef)` | Return a custom AG Grid cell renderer component, or `undefined` for the default. |
| `onGetCellEditor?(colDef)` | Return a custom AG Grid cell editor component, or `undefined` for the default. |
| `onRetrieveGridApi?(gridApi)` | Receive the raw `GridApi` instance if you need a persistent reference. |

The `IGridCustomizer` passed to `onInitialize` exposes:

| Method | Description |
|--------|-------------|
| `getGridApi()` | The raw AG Grid `GridApi`. |
| `getTaskDataProvider()` | The `ITaskDataProvider` — use for `getRecordTree()`, `fetchRawRecords()`, `updateTaskData()`, etc. |
| `getDatasetControl()` | The `ITaskGridDatasetControl` runtime interface. |
| `registerExpressionDecorator(columnName, registrator)` | Calls `registrator()` only when the column exists in the current view. Safe to call for optional columns; no-ops when absent. |

---

## `ISavedQueryStrategy`

Controls how system and user saved views are loaded and persisted.

| Method | Description |
|--------|-------------|
| `onGetSystemQueries()` | Return built-in (non-deletable) views. **At least one must be returned or the control throws.** |
| `onGetUserQueries()` | Return views saved by the current user. |
| `onDeleteUserQueries(queryIds)` | Delete user views. Return a per-query success/failure result. |
| `onUpdateUserQuery(currentQuery)` | Persist changes to an existing view. Return `null` for user cancellation; throw on unexpected failure. |
| `onCreateUserQuery(newQuery, currentQuery)` | Create a new view. Return `null` for user cancellation; throw on unexpected failure. |
| `onEnableUserQueries?()` | Return `false` to disable personal views entirely. Defaults to `true`. |

**Built-in implementation:** `TalxisSavedQueryStrategy` — stores user views as `talxis_userquery` Dataverse records scoped to a `recordId` and `ownerId`.

---

## `ICustomColumnsStrategy`

Manages user-defined (dynamic) column definitions. Enable the feature by returning a strategy from `onCreateCustomColumnsStrategy`.

| Method | Description |
|--------|-------------|
| `onRefresh()` | Load/reload all custom column definitions. Returns `IColumn[]`. |
| `onGetColumns()` | Return cached columns synchronously. |
| `onCreateColumn()` | Open column-creation UI. Return the new column name or `null`. |
| `onDeleteColumn(name)` | Delete the column. Return the column name or `null`. |
| `onUpdateColumn(name)` | Open column-edit UI. Return the column name or `null`. |

**Built-in implementation:** `TalxisCustomColumnsStrategy` — stores definitions in `talxis_attributedefinition` and values in `talxis_attributevalue`. Column names are suffixed with a custom-column sentinel so the control can distinguish them from native columns.

---

## Localization

Pass a `labels` prop to override any subset of UI strings. The full key set is defined in `ITaskGridLabels`. Some strings support Liquid-style variable interpolation (`{{ variableName }}`):

```tsx
<TaskGrid
    pcfContext={pcfContext}
    taskGridDescriptor={descriptor}
    labels={{
        new:            'Add Task',
        deleteSelected: 'Remove',
        'reorderingTaskDialog.text.above':    'Move "{{ baseRecord }}" above "{{ overBaseRecord }}"?',
        'reorderingTaskDialog.text.below':    'Move "{{ baseRecord }}" below "{{ overBaseRecord }}"?',
        'reorderingTaskDialog.text.children': 'Make "{{ baseRecord }}" a child of "{{ overBaseRecord }}"?',
    }}
/>
```

---

## Replacing UI components

Pass a `components` prop to swap the skeleton loader or the command bar:

```tsx
<TaskGrid
    pcfContext={pcfContext}
    taskGridDescriptor={descriptor}
    components={{
        onRenderSkeleton:   (props) => <MySpinner height={props.height} />,
        onRenderCommandBar: (props) => <MyCommandBar {...props} />,
    }}
/>
```