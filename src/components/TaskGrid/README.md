# TaskGrid

> **Note:** For a minimal PCF wrapper and integration example, see [demo PCF](https://github.com/brYch97/task-pcf).


A hierarchical task-management grid built on [AG Grid](https://www.ag-grid.com/). It renders tasks in a parent–child tree structure and supports drag-and-drop reordering, inline editing, saved views, custom columns, and template-based task creation.

The control is headless by design: all data access and business logic is supplied by you through a **descriptor** and a set of **strategies**. A ready-made Dataverse implementation is included in `extensions/dataverse`, but you can create your own strategies to connect the grid to any data source.

---

## Usage

```tsx
import { TaskGrid } from '@talxis/base-controls';
import { DataverseTaskGridDescriptor } from '@talxis/base-controls/dist/components/TaskGrid/extensions/dataverse';

const descriptor = new DataverseTaskGridDescriptor({ /* see Dataverse strategy section */ });

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
| `onGetFieldMapping()` | ✅ | Maps logical column roles to physical attribute names in your schema. |
| `onCreateSavedQueryStrategy()` | ✅ | Returns the strategy that loads and persists saved views. |
| `onCreateTaskStrategy(deps)` | ✅ | Returns the strategy handling all task CRUD, move and template operations. |
| `onCreateUserQueryDataProvider()` | ✅ | Returns an `IDataProvider` that backs the save-view dialog. |
| `onGetHeight?()` | — | Returns the container height as a CSS string. Falls back to filling the parent when omitted. |
| `onCreateCustomColumnsStrategy?()` | — | Enables user-defined columns. Return a `ICustomColumnsStrategy` implementation. |
| `onCreateTemplateDataProvider?()` | — | Enables template-based task creation. Return an `IDataProvider` whose records represent templates. |
| `onCreateGridCustomizerStrategy?()` | — | Deep-customizes AG Grid column definitions, cell renderers, editors and row class rules. |
| `onGetControlId?()` | — | Returns a stable DOM identifier. Auto-generated as a UUID when omitted. |
| `onLoadDependencies?()` | — | Async hook called once before any provider is created. Use for pre-loading or authentication. |
| `onGetGridParameters?()` | — | Returns `ITaskGridParameters` UI feature flags. All flags default to `false` when omitted. |

### Example

The quickest way to get started is to use the built-in `DataverseTaskGridDescriptor` from `extensions/dataverse`, which handles all Dataverse wiring for you:

```ts
import { TaskGrid } from '@talxis/base-controls';
import { DataverseTaskGridDescriptor } from '@talxis/base-controls/dist/components/TaskGrid/extensions/dataverse';

const descriptor = new DataverseTaskGridDescriptor({
    height: '600px',
    onInitialize: async () => ({
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
        projectRecord: { entityName: 'talxis_project', id: projectId },
        userId:       currentUserId,
        createFormId: '<form-guid>',
        editFormId:   '<form-guid>',
        gridParameters: { enableInlineCreation: true },
    }),
});

<TaskGrid pcfContext={pcfContext} taskGridDescriptor={descriptor} />
```

See the [Dataverse strategy](#dataverse-strategy-pre-made) section for the full `DataverseTaskGridDescriptor` params reference and how to extend it.

---

## `IFieldMapping`

Maps logical roles to physical attribute names in your entity schema.

| Property | Required | Role |
|----------|:--------:|------|
| `subject` | ✅ | Display name / title. Always pinned left; never hidden. |
| `parentId` | ✅ | Self-referential parent lookup — drives the tree hierarchy. |
| `stackRank` | ✅ | Ordering attribute. Used for default sort and drag-and-drop reordering. |
| `stateCode` | ✅ | Active/inactive status. Used by the *Hide inactive tasks* filter. The Dataverse strategy provides this automatically (always `statecode`) — you do not need to include it in `FieldMapping`.

---

## `ITaskGridParameters`

Feature flags returned by `onGetGridParameters`. All properties are optional and **default to `false`** when not set.

| Property | Description |
|----------|-------------|
| `enableRowDragging` | Show drag handles and allow rows to be reordered by dragging. Suppressed automatically in flat-list mode or when sorted by a non-stack-rank column. |
| `enableEditColumns` | Show the *Edit Columns* ribbon button. |
| `enableTaskEditing` | Allow inline cell editing. |
| `enableTaskCreation` | Show the *New* button. |
| `enableTaskDeletion` | Show the *Delete* button. |
| `enableQuickFind` | Show the quick-find search input. |
| `enableViewSwitcher` | Show the view-switcher dropdown. |
| `enableShowHierarchyToggle` | Show the *Show hierarchy* toggle. |
| `enableHideInactiveTasksToggle` | Show the *Hide inactive tasks* toggle. |
| `enableEditColumnsScopeSelector` | Show the personal/system scope selector inside the Edit Columns panel. |
| `enableUserQueries` | Allow users to create and manage personal saved views. |
| `enableQueryManager` | Show the query manager panel. |
| `enableSaveAsNewQuery` | Show the *Save as new* button in the query manager. |
| `enableSaveQueryChanges` | Show the *Save changes* button in the query manager. |
| `enableCustomColumnCreation` | Allow users to create custom columns. |
| `enableCustomColumnEditing` | Allow users to edit custom column definitions. |
| `enableCustomColumnDeletion` | Allow users to delete custom columns. |
| `enableInlineCreation` | Create new task records inline (in the grid row) instead of opening a form. |
| `enableNavigation` | Enable row navigation (clicking a row opens the record). |
| `enableSorting` | Enable column header sorting. |
| `enableFiltering` | Enable column header filtering. |
| `rowHeight` | Override the default row height in pixels. Uses the AG Grid default when omitted. |

---

## `ITaskDataProviderStrategy`

Handles all data access and mutation for tasks. Return an instance from `onCreateTaskStrategy(deps)`.

`deps` contains:
- `deps.enableTaskEditing` — mirrors `ITaskGridParameters.enableTaskEditing`. Use to conditionally enable inline cell editing in the strategy.
- `deps.enableInlineCreation` — mirrors `ITaskGridParameters.enableInlineCreation`. Use to choose between inline creation and opening a form.
- `deps.templateDataProvider` — present when `onCreateTemplateDataProvider` is implemented.
- `deps.customColumnsDataProvider` — present when `onCreateCustomColumnsStrategy` is implemented.

### Interface reference

| Method | Description |
|--------|-------------|
| `onInitialize(provider)` | Called once on first load. Return `{ columns, rawData, metadata }`. Store the `provider` reference for use in other methods. |
| `onGetRawRecords(ids)` | Fetch raw records by id. Pass an empty array to fetch all. |
| `onGetAvailableColumns(options?)` | Return all columns that can be displayed (native + custom). |
| `onGetAvailableRelatedColumns()` | Return linked-entity columns available for filtering and sorting. |
| `onCreateTask(parentTaskId?)` | Create a task, optionally as a child. Return the raw record or `null` for user cancellation. |
| `onDeleteTasks(taskIds)` | Delete tasks. Return a per-task success/failure result. |
| `onMoveTask(movingId, targetId, position)` | Move a task `'above'`, `'below'`, or as `'child'` of target. Return updated records or `null` for cancellation. |
| `onRecordSave(record)` | Persist an inline cell edit. Return `IRecordSaveOperationResult`. |
| `onIsRecordActive(recordId)` | Return `false` for completed/cancelled tasks. Inactive rows receive a greyed-out style. |
| `onOpenDatasetItems(entityReferences, isTaskEntity)` | Called on cell clicks to open records. `isTaskEntity: true` means the references are task records; `false` means a related entity (e.g. a lookup target). |
| `onCreateTemplateFromTask(taskId)` | Create a template from a task. Return raw record or `null`. |
| `onCreateTasksFromTemplate(templateId, parentId?)` | Instantiate tasks from a template. Return created raw records or `null`. |
| `onGetRootTaskId?()` | Scope the tree to a subtree by returning the root task id. |

### Dataverse example

When targeting Dataverse, use `DataverseTaskStrategy` from `extensions/dataverse`. The class implements the full `ITaskDataProviderStrategy` interface against the Xrm Web API — subclass it to override only what you need.

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

**Built-in implementation:** `DataverseSavedQueryStrategy` — stores user views as `talxis_userquery` records in Dataverse, scoped to a `recordId` and `ownerId`.

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

### Built-in cell renderers

The grid automatically applies built-in renderers when a column's control metadata declares a matching control name. You configure these in the same way as Lookup Many — through the column's `controls` metadata. Currently supported:

| Control name | Applied as | Notes |
|---|---|---|
| `PercentComplete` | renderer + editor | Renders a progress bar and inline percentage editor. Set this control name on any numeric percentage column. |
| `LookupMany` / `ColorfulLookupMany` / `PeopleLookupMany` | renderer | See [Lookup-many columns](#lookup-many-columns). Applied automatically to columns whose `metadata.LookupMany` is set. |

### Custom cell renderer

A cell renderer is a React component assigned to `colDef.cellRenderer`. Use `ICellProps` as the props type. Get the `IRecord` instance from `props.data`, then read the column value with `record.getValue(props.colDef!.colId!)`.

```tsx
import * as React from 'react';
import { IRecord } from '@talxis/client-libraries';
import { ICellProps } from '@talxis/base-controls';

export const PriorityCellRenderer = (props: ICellProps) => {
    const record: IRecord = props.data;
    const priority = record.getValue(props.colDef!.colId!) as number | null;

    if (priority === null || priority === undefined) {
        return null;
    }

    const labels: Record<number, string> = { 1: 'Low', 2: 'Normal', 3: 'High' };
    const colours: Record<number, string> = {
        1: '#107c10',
        2: '#0078d4',
        3: '#d83b01',
    };

    return (
        <span style={{
            padding: '2px 8px',
            borderRadius: 4,
            color: '#fff',
            backgroundColor: colours[priority] ?? '#666',
            fontSize: 12,
            fontWeight: 600,
        }}>
            {labels[priority] ?? String(priority)}
        </span>
    );
};
```

Wire it up in `onGetColumnDefinitions`:

```ts
public onGetColumnDefinitions(colDefs: ColDef[]): ColDef[] {
    for (const colDef of colDefs) {
        if (colDef.colId === 'my_priority') {
            colDef.cellRenderer = PriorityCellRenderer;
        }
    }
    return colDefs;
}
```

---

## `ICustomColumnsStrategy`

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
| `onSaveValue(regardingRecordId, column, value)` | Persist a cell value for a custom column on the given record. |

**Built-in implementation:** `DataverseCustomColumnsStrategy` — stores definitions in `talxis_attributedefinition` and values in `talxis_attributevalue`.

---

## Dataverse strategy (pre-made)

> **⚠️ WIP:** Template-based task creation (`onCreateTemplateFromTask` / `onCreateTasksFromTemplate`) is not yet implemented in the Dataverse strategy. Calling either method will throw. Templating must be handled by a custom `DataverseTaskStrategy` subclass if needed.

`extensions/dataverse` provides a ready-to-use `ITaskGridDescriptor` + `ITaskDataProviderStrategy` implementation that works against any Dataverse entity via the Xrm Web API and FetchXML.

> **Stack ranking** — the Dataverse strategy uses the [LexoRank](https://www.npmjs.com/package/lexorank) algorithm for task ordering. The `stackRank` attribute **must be a text column**; the strategy reads and writes LexoRank strings directly. Drag-and-drop reordering is automatically suppressed when the grid is sorted by any other column.

### Classes

| Class | Role |
|-------|------|
| `DataverseTaskGridDescriptor` | Drop-in `ITaskGridDescriptor` for Dataverse. Accepts a params object — no subclassing needed for the common case. |
| `DataverseTaskStrategy` | `ITaskDataProviderStrategy` that talks to the Xrm Web API. Used internally by `DataverseTaskGridDescriptor` but can be extended independently. |
| `DataverseSavedQueryStrategy` | `ISavedQueryStrategy` that persists user views as `talxis_userquery` Dataverse records. |
| `DataverseGridCustomizerStrategy` | `IGridCustomizerStrategy` that wires lookup-many cell renderers. Returned by the descriptor automatically. |
| `DataverseCustomColumnsStrategy` | `ICustomColumnsStrategy` backed by `talxis_attributedefinition` / `talxis_attributevalue`. |

### Using `DataverseTaskGridDescriptor` as-is

```ts
import { DataverseTaskGridDescriptor } from '@talxis/base-controls/dist/components/TaskGrid/extensions/dataverse';

const descriptor = new DataverseTaskGridDescriptor({
    height: '600px',
    onInitialize: async () => ({
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
        projectRecord: {
            entityName: 'talxis_project',
            id:         projectId,
        },
        userId:         currentUserId,
        editFormId:     '<form-guid>',
        createFormId:   '<form-guid>',
        bulkEditFormId: '<form-guid>',
        gridParameters: {
            enableInlineCreation: true,
        },
    }),
});

<TaskGrid pcfContext={pcfContext} taskGridDescriptor={descriptor} />
```

The `baseFetchXml` supports [Liquid](https://shopify.github.io/liquid/) templates. The variable `{{ projectId }}` is automatically injected when a project reference is present.

### `DataverseTaskGridDescriptor` constructor

The descriptor takes two parameters:

| Property | Required | Description |
|----------|:--------:|-------------|
| `onInitialize` | ✅ | Async factory called once before the grid mounts. Resolve all async data here (e.g. current user, project record) before returning the full params object. |
| `height?` | — | CSS height for the grid container (e.g. `"600px"`, `"100%"`). Sizes to parent when omitted. |

### `IDataverseTaskGridDescriptorParams` reference

| Property | Required | Description |
|----------|:--------:|-------------|
| `baseFetchXml` | ✅ | FetchXML string, optionally with Liquid template variables. |
| `fieldMapping` | ✅ | `IFieldMapping` (+ optional `projectId`) mapping roles to Dataverse attribute names. |
| `systemQueries` | ✅ | `ISavedQuery[]`. At least one required. |
| `projectRecord?` | — | The project associated with these tasks — either `{ entityName, id }` or a fully hydrated `ISingleRecord`. When provided, its id is injected into Liquid fetch templates as `{{ projectId }}`. |
| `sourceRecord?` | — | An additional record whose id is available in Liquid templates (e.g. a sprint or board). |
| `userId?` | — | Current user GUID. Required for `DataverseSavedQueryStrategy` (user query persistence). |
| `enableUserQueries?` | — | Set to `true` to enable personal saved views backed by `DataverseSavedQueryStrategy`. Defaults to `false`. |
| `gridParameters?` | — | `ITaskGridParameters` feature flags. |
| `rootTaskId?` | — | Scope the tree to a subtree by providing the root task GUID. |
| `editFormId?` | — | Form GUID for single-task edit. |
| `createFormId?` | — | Form GUID for task creation. |
| `bulkEditFormId?` | — | Form GUID for bulk task edit. |
| `enableCascadeDelete?` | — | When `true`, deleting a task also deletes its child tasks. Defaults to `false`. |
| `enableDeletingTasksWithChildren?` | — | When `true`, tasks that have children can be deleted. When `false`, such tasks are excluded from deletion and an error is returned. Defaults to `false`. |

### `IFieldMapping` (Dataverse)

Extends `IFieldMapping` with one additional field used by the Dataverse strategy:

| Property | Description |
|----------|-------------|
| `projectId?` | Attribute name of the project lookup on the task entity (e.g. `"talxis_projectid"`). When provided, new tasks are pre-filled with the current project reference. |

### Extending `DataverseTaskStrategy`

Subclass `DataverseTaskStrategy` to override individual operations while keeping everything else intact.

```ts
import {
    DataverseTaskStrategy,
    IDataverseTaskStrategyParams,
} from '@talxis/base-controls/dist/components/TaskGrid/extensions/dataverse';
import { IDeleteTasksResult } from '@talxis/base-controls';

export class MyTaskStrategy extends DataverseTaskStrategy {
    constructor(params: IDataverseTaskStrategyParams) {
        super({
            ...params,
            // Intercept any form navigation call to inject extra parameters.
            form: {
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

To use a custom strategy with `DataverseTaskGridDescriptor`, subclass it and override `onCreateTaskStrategy`:

```ts
import { DataverseTaskGridDescriptor } from '@talxis/base-controls/dist/components/TaskGrid/extensions/dataverse';
import { ITaskStrategyDeps } from '@talxis/base-controls';
import { MyTaskStrategy } from './MyTaskStrategy';

export class MyDescriptor extends DataverseTaskGridDescriptor {
    public onCreateTaskStrategy(deps: ITaskStrategyDeps) {
        // Access the already-resolved descriptor fields via protected/public members,
        // or construct strategy params from your own stored state.
        return new MyTaskStrategy(/* your params */, deps);
    }
}
```

### `IDataverseTaskStrategyParams` reference

| Property | Description |
|----------|-------------|
| `fetchXml` | The FetchXML string (Liquid already rendered at this point). |
| `projectRecord?` | Resolved `ISingleRecord` for the project. New tasks are pre-linked to this record. |
| `sourceRecord?` | An additional resolved `ISingleRecord` whose data is available as Liquid variables. |
| `rootTaskId?` | Root task GUID for subtree scoping. |
| `editFormId?` | Form GUID for single-task edit. |
| `createFormId?` | Form GUID for task creation. |
| `bulkEditFormId?` | Form GUID for bulk task edit. |
| `isEditingEnabled?` | When `false`, disables inline cell editing at the strategy level. |
| `isCascadeDeleteEnabled?` | When `true`, deleting a task also deletes its child tasks. Defaults to `false`. |
| `isDeletingTasksWithChildrenEnabled?` | When `true`, tasks that have children can be deleted. When `false`, such tasks are excluded from deletion and an error is returned. Defaults to `false`. |
| `form?.onGetFormParameters` | `(operation, defaults) => params` — intercept and modify any form navigation call (`'create'`, `'edit'`, `'bulkEdit'`, `'open'`). |

---

### Lookup-many columns

A lookup-many column surfaces a multi-value relationship (1:N or N:N) directly as a grid cell. `DataverseTaskStrategy` detects lookup-many columns by the presence of `metadata.LookupMany` on the column definition, resolves the OData expand clause via the `ReferencedEntityNavigationPropertyName`, and handles associate/disassociate on save.

#### Column name

The column name can be any unique string. The relationship is identified not by the name but by `metadata.LookupMany.ReferencedEntityNavigationPropertyName` — the OData navigation property name of the relationship on the task entity.

#### Defining the column in a system query

Pass the column descriptor inside the `columns` array of an `ISavedQuery`. The `controls[0].bindings.FetchXml` binding is **required** — it defines how candidate records are loaded into the picker.

```ts
const COLUMNS: IColumn[] = [
    { name: 'talxis_name', visualSizeFactor: 300 },
    { name: 'statecode', isHidden: true },
    { name: 'talxis_stackrankstring', isHidden: true },
    { name: 'talxis_parentprojecttaskid', isHidden: true },
    {
        name: 'tags',            // any unique column name
        isVirtual: true,
        dataType: 'Lookup.Simple',
        displayName: 'Tags',
        visualSizeFactor: 300,
        metadata: {
            Targets: ['talxis_tag'],
            LookupMany: {
                ReferencedEntityNavigationPropertyName: 'talxis_projecttask_talxis_Tag_talxis_Tag',
            },
        },
        controls: [{
            appliesTo: 'both',
            name: 'ColorfulLookupMany',
            bindings: {
                FetchXml: {
                    value: '<fetch><entity name="talxis_tag"><attribute name="talxis_tagid" /><attribute name="talxis_name" /><attribute name="talxis_color" /></entity></fetch>',
                    type: 'SingleLine.Text',
                },
                ColorPropertyName: {
                    value: 'talxis_color',
                    type: 'SingleLine.Text',
                },
            },
        }],
    },
];
```

#### Available cell renderers

| `controls[0].name` | Description | Extra bindings |
|--------------------|-------------|----------------|
| `LookupMany` *(default)* | Generic multi-record picker. | — |
| `ColorfulLookupMany` | Picker with colored badge chips. | `ColorPropertyName` — attribute holding a hex color on the related entity. |
| `PeopleLookupMany` | People-style avatar picker. | `ImageUrlPropertyName` — attribute holding a profile image URL on the related entity. |

The `FetchXml` binding supports Liquid variables. Two objects are injected at render time:

| Variable | Description |
|---|---|
| `{{ task.id }}` | GUID of the current task row. |
| `{{ task.<attribute> }}` | Any raw attribute value on the current task record (e.g. `{{ task.talxis_projectid }}`). |
| `{{ project.id }}` | GUID of the project record, when one was provided to the descriptor. |
| `{{ project.<attribute> }}` | Any raw attribute value on the project record. |

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

