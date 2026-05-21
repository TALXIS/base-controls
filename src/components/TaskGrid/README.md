# TaskGrid

A hierarchical task-management grid built on [AG Grid](https://www.ag-grid.com/). It renders tasks in a parent–child tree structure and supports drag-and-drop reordering, inline editing, saved views, custom columns, and template-based task creation.

The control is headless by design: all data access and business logic is supplied by you through a **descriptor** and a set of **strategies**. A ready-made Dataverse implementation is included in `extensions/dataverse`.

---

## Usage

```tsx
import { TaskGrid } from '@talxis/base-controls';
import { Descriptor } from '@talxis/base-controls/dist/components/TaskGrid/extensions/dataverse';

const descriptor = new Descriptor({ /* see Dataverse strategy section */ });

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
| `pcfContext` | ✅ | A `ComponentFramework.Context` instance. Used for navigation, error dialogs and environment utilities. |
| `taskGridDescriptor` | ✅ | Your `ITaskGridDescriptor` implementation. The single entry point for all business logic and configuration. |
| `labels?` | — | Partial `ITaskGridLabels` map. Any key you supply replaces the English default for that label. |
| `components?` | — | Partial `ITaskGridComponents` map. Lets you replace the skeleton loader or the command bar. |

---

## The Descriptor (`ITaskGridDescriptor`)

The descriptor wires your data and configuration into the grid. Create a class that implements `ITaskGridDescriptor`.

### Interface

| Method | Required | Description |
|--------|:--------:|-------------|
| `onGetNativeColumns()` | ✅ | Maps logical column roles to physical attribute names in your schema. |
| `onCreateSavedQueryStrategy()` | ✅ | Returns the strategy that loads and persists saved views. |
| `onCreateTaskStrategy(deps)` | ✅ | Returns the strategy handling all task CRUD, move and template operations. |
| `onCreateUserQueryDataProvider()` | ✅ | Returns an `IDataProvider` that backs the save-view dialog. |
| `onCreateCustomColumnsStrategy?()` | — | Enables user-defined columns. Return a `ICustomColumnsStrategy` implementation. |
| `onCreateTemplateDataProvider?()` | — | Enables template-based task creation. Return an `IDataProvider` whose records represent templates. |
| `onCreateGridCustomizerStrategy?()` | — | Deep-customizes AG Grid column definitions, cell renderers, editors and row class rules. |
| `onGetAgGridLicenseKey?()` | — | Returns the AG Grid Enterprise license key. |
| `onGetControlId?()` | — | Returns a stable DOM identifier. Auto-generated as a UUID when omitted. |
| `onLoadDependencies?()` | — | Async hook called once before any provider is created. Use for pre-loading or authentication. |
| `onGetGridParameters?()` | — | Returns `ITaskGridParameters` UI feature flags. All flags default to `true` when omitted. |

### Example

The quickest way to get started is to use the built-in `Descriptor` from `extensions/dataverse`, which handles all Dataverse wiring for you:

```ts
import { TaskGrid } from '@talxis/base-controls';
import { Descriptor } from '@talxis/base-controls/dist/components/TaskGrid/extensions/dataverse';

const descriptor = new Descriptor({
    baseFetchXml: `
        <fetch>
          <entity name="talxis_projecttask">
            {% if projectId %}
            <filter>
              <condition attribute="talxis_projectid" operator="eq" value="{{ projectId }}" />
            </filter>
            {% endif %}
          </entity>
        </fetch>`,
    fieldMapping: {
        subject:   'talxis_name',
        parentId:  'talxis_parentprojecttaskid',
        stackRank: 'talxis_stackrankstring',
        stateCode: 'statecode',
        path:      'talxis_path',
        projectId: 'talxis_projectid',
    },
    systemQueries: [
        {
            id: '00000000-0000-0000-0000-000000000001',
            name: 'All Tasks',
            columns: [
                { name: 'talxis_name' },
                { name: 'statecode' },
                { name: 'talxis_stackrankstring', isHidden: true },
                { name: 'talxis_parentprojecttaskid', isHidden: true },
            ],
            sorting: [{ name: 'talxis_stackrankstring', sortDirection: 0 }],
        },
    ],
    project: { etn: 'talxis_project', id: { guid: projectId }, name: projectName },
    userId:       currentUserId,
    createFormId: '<form-guid>',
    editFormId:   '<form-guid>',
    gridParameters: { enableInlineCreation: true },
});

<TaskGrid pcfContext={pcfContext} taskGridDescriptor={descriptor} />
```

See the [Dataverse strategy](#dataverse-strategy-pre-made) section for the full `Descriptor` params reference and how to extend it.

---

## `INativeColumns`

Maps logical roles to physical attribute names in your entity schema.

| Property | Required | Role |
|----------|:--------:|------|
| `subject` | ✅ | Display name / title. Always pinned left; never hidden. |
| `parentId` | ✅ | Self-referential parent lookup — drives the tree hierarchy. |
| `stackRank` | ✅ | Numeric or string ordering attribute. Used for default sort and drag-and-drop reordering. |
| `stateCode` | ✅ | Active/inactive status. Used by the *Hide inactive tasks* filter. |
| `path` | — | Virtual breadcrumb column computed from ancestor names. Marked read-only automatically. Does not need to be a real schema attribute. |
| `percentComplete?` | — | Numeric completion percentage. When present, rendered with a progress-bar cell renderer. |

---

## `ITaskGridParameters`

Feature flags returned by `onGetGridParameters`. All properties are optional and default to `true` unless noted.

| Property | Default | Description |
|----------|:-------:|-------------|
| `height` | `null` | CSS height for the grid container. Omit to size the grid to its parent. |
| `enableRowDragging` | `true` | Show drag handles and allow rows to be reordered by dragging. Suppressed automatically in flat-list mode or when sorted by a non-stack-rank column. |
| `enableEditColumns` | `true` | Show the *Edit Columns* ribbon button. |
| `enableTaskEditing` | `true` | Allow inline cell editing. |
| `enableTaskCreation` | `true` | Show the *New* button. |
| `enableTaskDeletion` | `true` | Show the *Delete* button. |
| `enableQuickFind` | `true` | Show the quick-find search input. |
| `enableViewSwitcher` | `true` | Show the view-switcher dropdown. |
| `enableShowHierarchyToggle` | `true` | Show the *Show hierarchy* toggle. |
| `enableHideInactiveTasksToggle` | `true` | Show the *Hide inactive tasks* toggle. |
| `enableEditColumnsScopeSelector` | `true` | Show the personal/system scope selector inside the Edit Columns panel. |
| `enableUserQueries` | `true` | Allow users to create and manage personal saved views. |
| `enableQueryManager` | `true` | Show the query manager panel. |
| `enableSaveAsNewQuery` | `true` | Show the *Save as new* button in the query manager. |
| `enableSaveQueryChanges` | `true` | Show the *Save changes* button in the query manager. |
| `enableCustomColumnCreation` | `true` | Allow users to create custom columns. |
| `enableCustomColumnEditing` | `true` | Allow users to edit custom column definitions. |
| `enableCustomColumnDeletion` | `true` | Allow users to delete custom columns. |
| `enableInlineCreation` | `true` | Create new task records inline (in the grid row) instead of opening a form. |

---

## `ITaskDataProviderStrategy`

Handles all data access and mutation for tasks. Return an instance from `onCreateTaskStrategy(deps)`.

`deps` contains:
- `deps.templateDataProvider` — present when `onCreateTemplateDataProvider` is implemented.
- `deps.customColumnsDataProvider` — present when `onCreateCustomColumnsStrategy` is implemented.

### Interface reference

| Method | Description |
|--------|-------------|
| `onInitialize(provider)` | Called once on first load. Return `{ columns, rawData, metadata }`. Store the `provider` reference for use in other methods. |
| `onGetRawRecords(ids)` | Fetch raw records by id. |
| `onGetAvailableColumns(options?)` | Return all columns that can be displayed (native + custom). |
| `onGetAvailableRelatedColumns()` | Return linked-entity columns available for filtering and sorting. |
| `onGetQuickFindColumns()` | Return attribute names searched by the quick-find input. |
| `onCreateTask(parentTaskId?)` | Create a task, optionally as a child. Return the raw record or `null` for user cancellation. |
| `onDeleteTasks(taskIds)` | Delete tasks. Return a per-task success/failure result. |
| `onEditTasks(taskIds)` | Open edit form(s) or handle bulk edit. Return updated records or `null` for user cancellation. |
| `onMoveTask(movingId, targetId, position)` | Move a task `'above'`, `'below'`, or as `'child'` of target. Return updated records or `null` for cancellation. |
| `onRecordSave(record)` | Persist an inline cell edit. Return `IRecordSaveOperationResult`. |
| `onIsRecordActive(recordId)` | Return `false` for completed/cancelled tasks. Inactive rows receive a greyed-out style. |
| `onOpenDatasetItem(entityReference, context?)` | Called on non-subject cell clicks. Open the record form or a related record. |
| `onCreateTemplateFromTask(taskId)` | Create a template from a task. Return raw record or `null`. |
| `onCreateTasksFromTemplate(templateId, parentId?)` | Instantiate tasks from a template. Return created raw records or `null`. |
| `onGetRootTaskId?()` | Scope the tree to a subtree by returning the root task id. |

### Dataverse example

When targeting Dataverse, use `DataProviderStrategy` from `extensions/dataverse`. The base class implements the full `ITaskDataProviderStrategy` interface against the Xrm Web API — subclass it to override only what you need.

See the [Dataverse strategy](#dataverse-strategy-pre-made) section for a full subclassing example.

---

## `ISavedQueryStrategy`

Controls how system and user saved views are loaded and persisted.

| Method | Description |
|--------|-------------|
| `onGetSystemQueries()` | Return built-in (non-deletable) views. **At least one is required.** |
| `onGetUserQueries()` | Return views saved by the current user. |
| `onDeleteUserQueries(queryIds)` | Delete user views. Return a per-query success/failure result. |
| `onUpdateUserQuery(currentQuery)` | Persist changes to an existing view. Return `null` for user cancellation; throw on unexpected failure. |
| `onCreateUserQuery(newQuery, currentQuery)` | Create a new view from the current state. Return `null` for user cancellation; throw on unexpected failure. |
| `onEnableUserQueries?()` | Return `false` to disable personal views entirely. Defaults to `true`. |

**Built-in implementation:** `TalxisSavedQueryStrategy` — stores user views as `talxis_userquery` records in Dataverse, scoped to a `recordId` and `ownerId`.

### `ISavedQuery` shape

| Property | Required | Description |
|----------|:--------:|-------------|
| `id` | ✅ | Stable UUID for this view. |
| `name` | ✅ | Display name shown in the view-switcher. |
| `columns` | ✅ | Array of `IColumn` descriptors. |
| `sorting?` | — | Array of `{ name, sortDirection }`. `0` = ascending, `1` = descending. |
| `filtering?` | — | `FilterExpression` object `{ filterOperator, conditions[], filters[] }`. `0` = OR, `1` = AND. |
| `isFlatListEnabled?` | — | Start this view in flat-list mode. |
| `quickFindColumns?` | — | Attribute names searched by the quick-find input when this view is active. |

---

## `IGridCustomizerStrategy`

Return this from `onCreateGridCustomizerStrategy` to customize the underlying AG Grid instance.

| Method | Description |
|--------|-------------|
| `onInitialize(customizer)` | Called once after the grid is ready. Store the `customizer` reference. Subscribe to data provider events here. |
| `onGetColumnDefinitions?(colDefs)` | Receives computed column definitions. Return a modified array. |
| `onGetRowClassRules?(rules)` | Receives the default row CSS class rules. Extend or override and return. |
| `onGetCellRenderer?(colDef)` | Return a custom AG Grid cell renderer component, or `undefined` for the default. |
| `onGetCellEditor?(colDef)` | Return a custom AG Grid cell editor component, or `undefined` for the default. |
| `onRetrieveGridApi?(gridApi)` | Receive the raw `GridApi` instance for a persistent reference. |

The `IGridCustomizer` passed to `onInitialize` exposes:

| Method | Description |
|--------|-------------|
| `getGridApi()` | The raw AG Grid `GridApi`. |
| `getTaskDataProvider()` | The `ITaskDataProvider` — use for `getRecordTree()`, `fetchRawRecords()`, `updateTaskData()`, etc. |
| `getDatasetControl()` | The `ITaskGridDatasetControl` runtime interface. |
| `registerExpressionDecorator(columnName, fn)` | Calls `fn()` only when the column exists in the current view. Safe to call unconditionally — no-ops when the column is absent. |

### Example

```ts
export class MyGridCustomizer implements IGridCustomizerStrategy {
    private _customizer!: IGridCustomizer;

    public onInitialize(customizer: IGridCustomizer): void {
        this._customizer = customizer;

        customizer.getTaskDataProvider().addEventListener('onRecordLoaded', (record) => {
            // Highlight overdue due-dates in red.
            this._customizer.registerExpressionDecorator('scheduledend', () => {
                record.expressions.ui.setCustomFormattingExpression('scheduledend', (theme) => {
                    const raw = record.getValue('scheduledend');
                    if (!raw) return undefined;
                    const date  = new Date(raw);  date.setHours(0, 0, 0, 0);
                    const today = new Date();     today.setHours(0, 0, 0, 0);
                    return date < today
                        ? { backgroundColor: theme.semanticColors.errorBackground }
                        : undefined;
                });
            });
        });
    }

    public onGetColumnDefinitions(colDefs: ColDef[]): ColDef[] {
        for (const colDef of colDefs) {
            if (colDef.colId === 'my_priority') {
                colDef.cellRenderer = PriorityCellRenderer;
            }
        }
        return colDefs;
    }
}
```

---

## `ICustomColumnsStrategy`

> **⚠️ WIP — not yet implemented in the Dataverse strategy.** Custom columns must be handled by a custom `DataProviderStrategy` subclass and a custom `ICustomColumnsStrategy` implementation if needed.

Enables user-defined (dynamic) column definitions. Return an instance from `onCreateCustomColumnsStrategy`.

| Method | Description |
|--------|-------------|
| `onRefresh()` | Fetch/reload all custom column definitions. Returns `IColumn[]`. |
| `onGetColumns()` | Return currently cached columns synchronously. |
| `onCreateColumn()` | Open column-creation UI. Return the new column name or `null`. |
| `onDeleteColumn(name)` | Delete the column. Return the column name or `null`. |
| `onUpdateColumn(name)` | Open column-edit UI. Return the updated column name or `null`. |
| `onGetRawRecords()` | Fetch raw records for the custom column values. |
| `onGetRawRecord(recordId)` | Fetch a single raw record by id. |

**Built-in implementation:** `TalxisCustomColumnsStrategy` — stores definitions in `talxis_attributedefinition` and values in `talxis_attributevalue`.

---

## Dataverse strategy (pre-made)

> **⚠️ WIP:** Template-based task creation (`onCreateTemplateFromTask` / `onCreateTasksFromTemplate`) is not yet implemented in the Dataverse strategy. Calling either method will throw. Templating must be handled by a custom `DataProviderStrategy` subclass if needed.

`extensions/dataverse` provides a ready-to-use `ITaskGridDescriptor` + `ITaskDataProviderStrategy` implementation that works against any Dataverse entity via the Xrm Web API and FetchXML.

### Classes

| Class | Role |
|-------|------|
| `Descriptor` | Drop-in `ITaskGridDescriptor` for Dataverse. Accepts a params object — no subclassing needed for the common case. |
| `DataProviderStrategy` | `ITaskDataProviderStrategy` that talks to the Xrm Web API. Used internally by `Descriptor` but can be extended independently. |

### Using `Descriptor` as-is

```ts
import { Descriptor } from '@talxis/base-controls/dist/components/TaskGrid/extensions/dataverse';

const descriptor = new Descriptor({
    baseFetchXml: `
        <fetch>
          <entity name="talxis_projecttask">
            {% if projectId %}
            <filter>
              <condition attribute="talxis_projectid" operator="eq" value="{{ projectId }}" />
            </filter>
            {% endif %}
          </entity>
        </fetch>`,
    fieldMapping: {
        subject:   'talxis_name',
        parentId:  'talxis_parentprojecttaskid',
        stackRank: 'talxis_stackrankstring',
        stateCode: 'statecode',
        path:      'talxis_path',
        projectId: 'talxis_projectid',
    },
    systemQueries: [
        {
            id: '00000000-0000-0000-0000-000000000001',
            name: 'All Tasks',
            columns: [
                { name: 'talxis_name' },
                { name: 'statecode' },
                { name: 'talxis_stackrankstring', isHidden: true },
                { name: 'talxis_parentprojecttaskid', isHidden: true },
            ],
            sorting: [{ name: 'talxis_stackrankstring', sortDirection: 0 }],
        },
    ],
    project: {
        etn:  'talxis_project',
        id:   { guid: projectId },
        name: projectName,  // omit to let Descriptor fetch it via the API
    },
    userId:         currentUserId,
    editFormId:     '<form-guid>',
    createFormId:   '<form-guid>',
    bulkEditFormId: '<form-guid>',
    gridParameters: {
        height:               '600px',
        enableInlineCreation: true,
    },
});

<TaskGrid pcfContext={pcfContext} taskGridDescriptor={descriptor} />
```

The `baseFetchXml` supports [Liquid](https://shopify.github.io/liquid/) templates. The variable `{{ projectId }}` is automatically injected when a project reference is present.

### `IDescriptorParams` reference

| Property | Required | Description |
|----------|:--------:|-------------|
| `baseFetchXml` | ✅ | FetchXML string, optionally with Liquid template variables. |
| `fieldMapping` | ✅ | `INativeColumns` (+ optional `projectId`) mapping roles to Dataverse attribute names. |
| `systemQueries` | ✅ | `ISavedQuery[]`. At least one required. |
| `project?` | — | `{ etn, id, name? }`. When `name` is omitted, the descriptor fetches it via the API. |
| `userId?` | — | Current user GUID. Required for `TalxisSavedQueryStrategy` (user query persistence). |
| `agGridLicenseKey?` | — | AG Grid Enterprise license key. |
| `gridParameters?` | — | `ITaskGridParameters` feature flags. |
| `rootTaskId?` | — | Scope the tree to a subtree by providing the root task GUID. |
| `editFormId?` | — | Form GUID for single-task edit. |
| `createFormId?` | — | Form GUID for task creation. |
| `bulkEditFormId?` | — | Form GUID for bulk task edit. |

### `IDataverseEntityNativeColumns`

Extends `INativeColumns` with one additional field used by the Dataverse strategy:

| Property | Description |
|----------|-------------|
| `projectId?` | Attribute name of the project lookup on the task entity (e.g. `"talxis_projectid"`). When provided, new tasks are pre-filled with the current project reference. |

### Extending `DataProviderStrategy`

Subclass `DataProviderStrategy` to override individual operations while keeping everything else intact.

```ts
import {
    DataProviderStrategy,
    IDataProviderStrategyParams,
} from '@talxis/base-controls/dist/components/TaskGrid/extensions/dataverse';
import { IDeleteTasksResult } from '@talxis/base-controls';

export class MyTaskStrategy extends DataProviderStrategy {
    constructor(params: IDataProviderStrategyParams) {
        super({
            ...params,
            // Intercept any form navigation call to inject extra parameters.
            formStrategy: {
                onGetFormParameters: (operation, defaults) => {
                    if (operation === 'create') {
                        return {
                            ...defaults,
                            pageInput: {
                                ...defaults.pageInput,
                                data: {
                                    ...defaults.pageInput.data,
                                    my_customfield: 'default-value',
                                },
                            },
                        };
                    }
                    return defaults;
                },
            },
        });
    }

    // Override: block deletion when the task has time entries.
    public async onDeleteTasks(taskIds: string[]): Promise<IDeleteTasksResult | null> {
        for (const id of taskIds) {
            const { entities } = await window.Xrm.WebApi.retrieveMultipleRecords(
                'talxis_timeentry',
                `?$filter=talxis_projecttaskid eq '${id}'&$top=1&$select=talxis_timeentryid`
            );
            if (entities.length > 0) {
                return {
                    success: false,
                    deletedTaskIds: [],
                    errors: [{ id, error: 'Task has time entries and cannot be deleted.' }],
                };
            }
        }
        return super.onDeleteTasks(taskIds);
    }
}
```

To use a custom strategy with `Descriptor`, subclass it and override `onCreateTaskStrategy`:

```ts
import { Descriptor, IDataProviderStrategyParams } from '@talxis/base-controls/dist/components/TaskGrid/extensions/dataverse';
import { ITaskStrategyDeps } from '@talxis/base-controls';
import { MyTaskStrategy } from './MyTaskStrategy';

export class MyDescriptor extends Descriptor {
    public onCreateTaskStrategy(deps: ITaskStrategyDeps) {
        return new MyTaskStrategy(this.getStrategyParams());
    }
}
```

### `IDataProviderStrategyParams` reference

| Property | Description |
|----------|-------------|
| `fetchXml` | The FetchXML string (Liquid already rendered at this point). |
| `projectReference?` | Resolved `ComponentFramework.EntityReference` for the project. |
| `rootTaskId?` | Root task GUID for subtree scoping. |
| `editFormId?` | Form GUID for single-task edit. |
| `createFormId?` | Form GUID for task creation. |
| `bulkEditFormId?` | Form GUID for bulk task edit. |
| `isInlineCreateEnabled?` | When `true` (default), tasks are created inline via the Web API instead of opening a create form. |
| `isEditingEnabled?` | When `false`, disables inline cell editing at the strategy level. |
| `formStrategy?.onGetFormParameters` | `(operation, defaults) => params` — intercept and modify any form navigation call (`'create'`, `'edit'`, `'bulkEdit'`, `'open'`). |

---

## Localization

Pass a `labels` prop to override any subset of UI strings. Some strings support Liquid-style variable interpolation (`{{ variableName }}`):

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

The full set of label keys is defined in `ITaskGridLabels`.

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

