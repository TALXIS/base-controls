# TaskGrid

A hierarchical task-management grid built on [AG Grid](https://www.ag-grid.com/). It renders tasks in a parent–child tree structure and supports drag-and-drop reordering, inline editing, saved views, custom columns, and template-based task creation.

The control is headless by design: all data access and business logic is supplied by you through a **descriptor** and a set of **strategies**.

Optional features — personal views, task templates, user-defined columns, lookup-many pickers, AG Grid customization — are **modules**. You register the ones you want, and the rest are not in your build.

## Documentation

The full documentation lives in Storybook, where every page is backed by a live grid:

- [**Get started**](https://talxis.github.io/base-controls/?path=/docs/task-grid-get-started--overview) — what the control is, `<TaskGrid />` props, and picking a strategy
- [**Modules**](https://talxis.github.io/base-controls/?path=/docs/task-grid-modules--overview) — what a module is, the five that ship, and how registering one turns a feature on
- [**Strategies / Memory**](https://talxis.github.io/base-controls/?path=/docs/task-grid-strategies-memory--overview) — the in-memory descriptor, for local development, tests and demos
- [**Strategies / Dataverse**](https://talxis.github.io/base-controls/?path=/docs/task-grid-strategies-dataverse--overview) — the Dataverse / Xrm Web API descriptor, and its environment prerequisites
- [**Customizations**](https://talxis.github.io/base-controls/?path=/docs/task-grid-customizations--overview) — feature flags, column metadata, labels, replaceable components and the AG Grid customizer
- [**Custom strategies**](https://talxis.github.io/base-controls/?path=/docs/task-grid-custom-strategies--overview) — the `ITaskGridDescriptor` contract, reusing or extending the shipped strategies, and writing your own

To read them locally:

```bash
npm run storybook
```

## Quick start

```tsx
import {
    TaskGrid, MemoryTaskGridDescriptor, createUserQueryModule, MemoryUserQueryStrategy,
} from '@talxis/base-controls';

const descriptor = new MemoryTaskGridDescriptor({
    height: '600px',
    onInitialize: async () => ({
        records: TASKS, metadata: { PrimaryIdAttribute: 'taskid' },
        fieldMapping: { subject: 'subject', parentId: 'parentid', stackRank: 'stackrank', stateCode: 'statecode' },
        systemQueries: [ALL_TASKS_VIEW],
        gridParameters: { enableTaskEditing: true, enableRowDragging: true, enableViewSwitcher: true },
        modules: {
            onGetUserQueriesModule: () => createUserQueryModule({
                strategy: new MemoryUserQueryStrategy({ userQueries }),
                enableQueryManager: true,
            }),
        },
    }),
});

export const MyTaskGridPage = ({ pcfContext }) => (
    <TaskGrid
        pcfContext={pcfContext}
        taskGridDescriptor={descriptor}
    />
);
```

## Modules

A module is one optional feature packaged as one object: the implementation you supply, the UI the feature needs, and its own options. There is no separate flag for whether a feature exists — **a module is on because it is present**, and omitting its key leaves both the feature and its UI out.

| Key | Builder | What it turns on |
|-----|---------|------------------|
| `userQueries` | `createUserQueryModule` | Personal views: *My views*, the save commands, and the view manager. |
| `templates` | `createTemplateModule` | Task templates: capturing one from a task, and expanding one into tasks. |
| `customColumns` | `createCustomColumnsModule` | User-defined columns: creating, editing and deleting them, and their values. |
| `gridCustomizer` | `createGridCustomizerModule` | Deep customization of the AG Grid instance: column definitions, row class rules, one-time init. |
| `lookupMany` | `createLookupManyModule` | The multi-record picker on columns carrying `metadata.LookupMany`. |

On the shipped descriptors you register them through a `modules` key of builders on what `onInitialize` resolves — one `onGetXModule` per feature. On a descriptor you wrote yourself, implement `ITaskGridDescriptor.onGetModules` and return the module objects under the plain keys.

At runtime, read a module off the control: `getModules()` where the feature is optional to the caller, and `getModule('templates')` — which throws when the key is absent — where the caller only exists because the module does.

## Layout

| Path | Contents |
|------|----------|
| `TaskGrid.tsx` | The component. `pcfContext` and `taskGridDescriptor`, plus `labels`, `components` and the event props. |
| `interfaces.ts` | `ITaskGridDescriptor`, `ITaskGridDatasetControl`, `IFieldMapping`, `ITaskGridParameters`, `ITaskStrategyDeps`. |
| `providers/` | `TaskDataProvider`, `SavedQueryDataProvider`, `ITemplateDataProvider` and their strategy interfaces. |
| `modules/` | The optional features and their `create*Module` builders, each with the UI it needs. `CustomColumnsDataProvider` lives here. |
| `components/` | The grid's own UI: AG Grid integration, the customizer, cell renderers, cell headers, the header bar. |
| `extensions/memory/` | `MemoryTaskGridDescriptor` and the in-memory strategies. |
| `extensions/dataverse/` | `DataverseTaskGridDescriptor` and the Dataverse / Xrm Web API strategies. |
| `labels.ts` | `ITaskGridLabels`, `TASK_GRID_LABELS` — every localizable string. |
| `stack-rank/` | `StackRank` — the lexicographic ordering both shipped strategies use. |

Both extensions are exported from the package root:

```ts
import { MemoryTaskGridDescriptor, DataverseTaskGridDescriptor } from '@talxis/base-controls';
```

## Dependency direction

The static dependency arrow points one way: **module → core, never core → module.** `modules/interfaces.ts` declares each module's shape and imports only types; nothing in `interfaces.ts`, `providers/` or `components/` ever imports a module's UI. That is what keeps an unregistered module out of your build — a value import in core would drag a module's components into the graph of every file that touches `ITaskGridDescriptor`.

For the consumer, the consequence is that a module's components are named in exactly one place: its `create*Module` builder. Importing that builder is what puts them in your bundle. You never import them yourself, and the grid reaches them through `control.getModules()`.

Because of that rule, several files in core use `import type` where a plain import would compile just as well. Do not "simplify" those.

## Related

For a minimal PCF wrapper and integration example, see the [demo PCF](https://github.com/brYch97/task-pcf).
