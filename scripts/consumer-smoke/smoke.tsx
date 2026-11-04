import { DatasetControlEntry, ErrorMessageBoundary, Grid, IDatasetControlRuntime, IGrid, TextField, useOpenErrorDialog, usePcfContext, ThemeProvider } from '@talxis/base-controls';
import { GANTT_LABELS } from '@talxis/base-controls/gantt';

//one name from each layer: core, theme, ui, fields, data, controls
export const layers = [usePcfContext, ThemeProvider, ErrorMessageBoundary, TextField, DatasetControlEntry, Grid, useOpenErrorDialog];
export const gantt = GANTT_LABELS;

//members added by module augmentation
export const userQueries = (runtime: IDatasetControlRuntime) => runtime.modules.get('userQueries').getManageProvider();
export const filtering = (grid: IGrid) => grid.modules.get('filtering');
