import { createMemoryDependenciesModule, DatasetControlEntry, ErrorMessageBoundary, Grid, IDatasetControlRuntime, IGrid, ITaskDependency, MemoryTable, TextField, useOpenErrorDialog, usePcfContext, ThemeProvider } from '@talxis/base-controls';
import { GANTT_LABELS } from '@talxis/base-controls/gantt';

//one name from each layer: core, theme, ui, fields, data, controls
export const layers = [usePcfContext, ThemeProvider, ErrorMessageBoundary, TextField, DatasetControlEntry, Grid, useOpenErrorDialog];
export const gantt = GANTT_LABELS;

//members added by module augmentation
export const userQueries = (runtime: IDatasetControlRuntime) => runtime.modules.get('userQueries').getManageProvider();
export const filtering = (grid: IGrid) => grid.modules.get('filtering');
export const focusedCell = (grid: IGrid) => grid.services.get('cells').events.addEventListener('onFocusedCellChanged', () => {});

//memory data kept outside the controls
const dependencies = new MemoryTable<ITaskDependency>({ idKey: 'id' });
export const memory = [createMemoryDependenciesModule({ dependencies }), new MemoryTable<ITaskDependency>({ idKey: 'id', rows: dependencies.getRows() })];
