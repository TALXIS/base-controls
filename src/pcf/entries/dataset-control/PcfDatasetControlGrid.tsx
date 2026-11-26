import React from 'react';
import { useDatasetControl } from '@controls/dataset-control';
import {
    createAggregationModule, createCellSelectionModule, createClipboardModule, createEditingModule, createFilteringModule, createGroupingModule,
    createLicenseModule, createRowSelectionModule, createSortingModule, IGrid, IGridCellSelectionOptions, IGridClipboardOptions, IGridColDef,
    IGridColumnContext, IGridColumnModeControl, IGridModule, IGroupingModuleParameters, ServerSideGrid,
} from '@controls/grid';

/** The grid's setup a view carries in `control.parameters`. */
export interface IPcfDatasetControlGridParameters {
    /** AG Grid Enterprise license key. */
    licenseKey?: string;
    rowHeight?: number;
    enableEditing?: boolean;
    /** Saves each edited record as soon as its value changes. */
    enableAutoSave?: boolean;
    enableSorting?: boolean;
    enableFiltering?: boolean;
    /** Highlighting cells by dragging across them; on unless `false`. */
    cellSelection?: false | IGridCellSelectionOptions;
    /** Copying and pasting cells; on unless `false`. */
    clipboard?: false | Pick<IGridClipboardOptions, 'clipboardDelimiter' | 'copyHeadersToClipboard' | 'copyGroupHeadersToClipboard' | 'suppressCutToClipboard' | 'suppressClipboardPaste' | 'suppressClipboardApi' | 'suppressLastEmptyLineOnPaste'>;
    /** Turns grouping on, set up by these options; `{}` groups with the defaults. */
    grouping?: Omit<IGroupingModuleParameters, 'components'>;
    enableAggregation?: boolean;
    enableZebra?: boolean;
    enableNavigation?: boolean;
    enableOptionSetColors?: boolean;
    selectableRows?: 'none' | 'single' | 'multiple';
    /** Changes the grid's column with the same `colId`. */
    colDefs?: IGridColDef[];
}

/** The grid a PCF's dataset control frame draws, set up by the open view's `control.parameters`. */
export const PcfDatasetControlGrid = () => {
    const view = useDatasetControl().getView();
    const parameters = (view?.control?.parameters ?? {}) as IPcfDatasetControlGridParameters;
    return <ServerSideGrid
        key={view?.id}
        stateKey="grid"
        modules={createGridModules(parameters)}
        rowHeight={parameters.rowHeight}
        enableZebra={parameters.enableZebra}
        enableNavigation={parameters.enableNavigation}
        enableOptionSetColors={parameters.enableOptionSetColors}
        onSetup={grid => applyColDefs(grid, parameters.colDefs ?? [])} />;
};

//last, so the view has the final word over every module
const applyColDefs = (grid: IGrid, colDefs: IGridColDef[]): void => {
    grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
        for (const colDef of colDefs) {
            const existing = columnDefs.find(columnDef => columnDef.colId === colDef.colId);
            if (existing) {
                Object.assign(existing, colDef, { context: mergeContext(existing.context, colDef.context) });
            }
        }
    }, Number.MAX_SAFE_INTEGER);
};

//a view changes one control parameter and keeps the column's others
const mergeContext = (context: IGridColumnContext = {}, changes: IGridColumnContext = {}): IGridColumnContext => ({
    ...context,
    ...changes,
    control: changes.control ? {
        parameters: { ...context.control?.parameters, ...changes.control.parameters },
        renderer: mergeModeControl(context.control?.renderer, changes.control.renderer),
        editor: mergeModeControl(context.control?.editor, changes.control.editor),
    } : context.control,
});

const mergeModeControl = (control?: IGridColumnModeControl, changes?: IGridColumnModeControl): IGridColumnModeControl | undefined => changes ? {
    ...control,
    ...changes,
    parameters: { ...control?.parameters, ...changes.parameters },
} : control;

const createGridModules = (parameters: IPcfDatasetControlGridParameters): IGridModule[] => {
    const modules: IGridModule[] = [];
    if (parameters.licenseKey) {
        modules.push(createLicenseModule({ key: parameters.licenseKey }));
    }
    if (parameters.cellSelection !== false) {
        modules.push(createCellSelectionModule(parameters.cellSelection));
    }
    if (parameters.clipboard !== false) {
        modules.push(createClipboardModule(parameters.clipboard));
    }
    if (parameters.selectableRows && parameters.selectableRows !== 'none') {
        modules.push(createRowSelectionModule({ mode: parameters.selectableRows }));
    }
    if (parameters.enableEditing) {
        modules.push(createEditingModule({ enableAutoSave: parameters.enableAutoSave }));
    }
    if (parameters.enableSorting ?? true) {
        modules.push(createSortingModule());
    }
    if (parameters.enableFiltering ?? true) {
        modules.push(createFilteringModule());
    }
    if (parameters.grouping) {
        modules.push(createGroupingModule({ enableUserGrouping: true, ...parameters.grouping }));
    }
    if (parameters.enableAggregation) {
        modules.push(createAggregationModule({ enableUserAggregation: true }));
    }
    return modules;
};
