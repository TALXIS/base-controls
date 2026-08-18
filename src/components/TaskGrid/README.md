# TaskGrid

A hierarchical task-management grid built on [AG Grid](https://www.ag-grid.com/). It renders tasks in a parent–child tree structure and supports drag-and-drop reordering, inline editing, saved views, custom columns, and template-based task creation.

The control is headless by design: all data access and business logic is supplied by you through a **descriptor** and a set of **strategies**.

## Documentation

The full documentation lives in Storybook, where every page is backed by a live grid:

- [**Get started**](https://talxis.github.io/base-controls/?path=/docs/task-grid-get-started--overview) — what the control is, `<TaskGrid />` props, and picking a strategy
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
import { TaskGrid, MemoryTaskGridDescriptor } from '@talxis/base-controls';

const descriptor = new MemoryTaskGridDescriptor({
    height: '600px',
    onInitialize: async () => ({
        records: TASKS, metadata: { PrimaryIdAttribute: 'taskid' },
        fieldMapping: { subject: 'subject', parentId: 'parentid', stackRank: 'stackrank', stateCode: 'statecode' },
        systemQueries: [ALL_TASKS_VIEW],
        gridParameters: { enableTaskEditing: true, enableRowDragging: true },
    }),
});

export const MyTaskGridPage = ({ pcfContext }) => (
    <TaskGrid
        pcfContext={pcfContext}
        taskGridDescriptor={descriptor}
    />
);
```

## Layout

| Path | Contents |
|------|----------|
| `TaskGrid.tsx` | The component. Takes `pcfContext` and `taskGridDescriptor`. |
| `interfaces.ts` | `ITaskGridDescriptor`, `IFieldMapping`, `ITaskGridParameters`, `ITaskStrategyDeps`. |
| `providers/` | `TaskDataProvider`, `SavedQueryDataProvider`, `CustomColumnsDataProvider`, `ITemplateDataProvider` and their strategy interfaces. |
| `components/grid/` | AG Grid integration: the grid customizer, cell renderers, cell headers, lookup-many controls. |
| `extensions/memory/` | `MemoryTaskGridDescriptor` — in-memory strategy. |
| `extensions/dataverse/` | `DataverseTaskGridDescriptor` — Dataverse / Xrm Web API strategy. |
| `labels.ts` | `ITaskGridLabels` — every localizable string. |

Both extensions are exported from the package root:

```ts
import { MemoryTaskGridDescriptor, DataverseTaskGridDescriptor } from '@talxis/base-controls';
```

## Related

For a minimal PCF wrapper and integration example, see the [demo PCF](https://github.com/brYch97/task-pcf).
