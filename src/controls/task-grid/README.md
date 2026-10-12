# TaskGrid

A hierarchical task-management grid built on [AG Grid](https://www.ag-grid.com/). It renders tasks in a parent–child tree structure and supports drag-and-drop reordering, inline editing, saved views, custom columns, and template-based task creation.

The control is headless by design: all data access and business logic is supplied by you through a **descriptor** and a set of **strategies**.

Task Grid is a `DatasetControl` with a task tree inside. The header, the loading skeleton, the error with its retry, the view switching and the state kept per view are the DatasetControl's.

Optional features — personal views, task templates, user-defined columns, lookup-many pickers, dependencies, checklists, the Gantt — are **features**. You pass the ones you want, and the rest are not in your build.

## Documentation

The full documentation lives in Storybook, where every page is backed by a live grid:

- [**Get started**](https://talxis.github.io/base-controls/?path=/docs/task-grid-get-started--overview) — what the control is, `<TaskGrid />` props, state, and picking a descriptor
- [**Modules**](https://talxis.github.io/base-controls/?path=/docs/task-grid-modules--overview) — the features that ship, how passing one turns it on, and the grid modules beside them
- [**Descriptors**](https://talxis.github.io/base-controls/?path=/docs/task-grid-descriptors-anatomy--overview) — the `ITaskGridDescriptor` contract, what runs when, and the Memory and Dataverse descriptors
- [**Customizations**](https://talxis.github.io/base-controls/?path=/docs/task-grid-customizations--overview) — feature flags, column metadata, labels, replaceable components and the Grid's own options
- [**Extending**](https://talxis.github.io/base-controls/?path=/docs/task-grid-extending--overview) — reusing or extending the shipped strategies, and writing your own

To read them locally:

```bash
npm run storybook
```

## Quick start

```tsx
import {
    TaskGrid, MemoryTaskGridDescriptor, createUserQueryModule, MemoryUserQueryStrategy, PcfContextProvider,
} from '@talxis/base-controls';

const descriptor = new MemoryTaskGridDescriptor({
    onInitialize: async () => ({
        records: TASKS, metadata: { PrimaryIdAttribute: 'taskid' },
        fieldMapping: { subject: 'subject', parentId: 'parentid', stackRank: 'stackrank', stateCode: 'statecode' },
        systemQueries: [ALL_TASKS_VIEW],
        gridParameters: { enableTaskEditing: true, enableRowDragging: true, enableViewSwitcher: true },
    }),
});

const features = {
    userQueries: createUserQueryModule({
        onCreateStrategy: ({ services }) => new MemoryUserQueryStrategy({ userQueries, services }),
        enableQueryManager: true,
    }),
};

export const MyTaskGridPage = () => (
    <PcfContextProvider>
        <TaskGrid descriptor={descriptor} features={features} stateKey='tasks' height='600px' />
    </PcfContextProvider>
);
```

## Features and modules

A feature is one optional piece packaged as one object: the implementation you supply, the UI it needs, and its own options. There is no separate flag for whether a feature exists — **a feature is on because it is present**, and omitting its key leaves both the feature and its UI out.

| Key | Builder | What it turns on |
|-----|---------|------------------|
| `userQueries` | `createUserQueryModule` | Personal views: *My views*, the save commands, and the view manager. |
| `templates` | `createTemplateModule` | Task templates: capturing one from a task, and expanding one into tasks. |
| `customColumns` | `createCustomColumnsModule` | User-defined columns: creating, editing and deleting them, and their values. |
| `lookupMany` | `createLookupManyModule` | The multi-record picker on columns carrying `metadata.LookupMany`. |
| `dependencies` | `createDependenciesModule` | The predecessors and successors columns. |
| `checklist` | `createChecklistModule` | The checklist column. |
| `gantt` | `createGanttModule` | A timeline beside the grid. |
| `project` | `createProjectModule` | The project the tasks belong to. |

`modules` beside them takes the Grid's own modules that work with a task grid: sorting, filtering, clipboard, aggregation and your own in `custom`.

A feature initializes once per mount and lives across view switches; every view gets a task provider of its own. At runtime, read a feature off the service locator: `services.find('templatesModule')` where the feature is optional to the caller, and `services.get('templatesModule')` — which throws when nothing registered it — where the caller only exists because the feature does.

## Layout

| Path | Contents |
|------|----------|
| `TaskGrid.tsx` | The component: a `DatasetControl` with the task grid's header and the grid or Gantt in its body. |
| `runtime/` | `TaskGridRuntime`: initializes once per mount, loads each view, and holds the settings and view actions. |
| `interfaces.ts` | `ITaskGridDescriptor`, `IFieldMapping`, `ITaskGridParameters`. |
| `services/` | `ITaskGridServiceLocator`, `ITaskGridServiceMap` — where every strategy, provider and feature reaches what it needs. |
| `providers/` | `TaskDataProvider`, `SavedQueryDataProvider`, `TaskExpansionProvider`, `ITemplateDataProvider` and `moduleState`. |
| `modules/` | The features and their `create*Module` builders, each with the UI it needs, and the shipped implementations of each contract under `memory/`, `talxis/` and `dataverse/`. |
| `module/` | The grid module that makes the grid a task tree. |
| `components/` | The header parts — command bar, view switcher, settings — the grid body, and `RecordSelector`. |
| `descriptors/` | The shipped descriptors: `memory/MemoryTaskGridDescriptor`, `dataverse/DataverseTaskGridDescriptor`. |
| `strategies/` | The shipped task strategies: `memory/MemoryTaskStrategy`, `dataverse/DataverseTaskStrategy` and their actions. |
| `labels.ts` | `ITaskGridLabels`, `TASK_GRID_LABELS` — every localizable string. |

## Dependency direction

The static dependency arrow points one way: **feature → core, never core → feature.** `modules/interfaces.ts` declares each feature's shape and imports only types; nothing in `interfaces.ts`, `providers/` or `components/` ever imports a feature's UI. That is what keeps an unregistered feature out of your build — a value import in core would drag a feature's components into the graph of every file that touches `ITaskGridDescriptor`.

For the consumer, the consequence is that a feature's components are named in exactly one place: its `create*Module` builder. Importing that builder is what puts them in your bundle, and the grid reaches them through the locator — `useTaskGridRuntime().services` in a component.

Because of that rule, several files in core use `import type` where a plain import would compile just as well. Do not "simplify" those.

## Related

For a minimal PCF wrapper and integration example, see the [demo PCF](https://github.com/brYch97/task-pcf).
