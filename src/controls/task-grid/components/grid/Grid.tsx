import * as React from "react";
import { createClientSideRowModelModule, createEditingModule, createLegacyClientApiCompatibilityModule, createRowSelectionModule, Grid as GridBase, IGridModules } from "@controls/grid";
import { useGridOptions, useTaskGridRuntime } from "@controls/task-grid/context";
import { createTaskTreeModule } from "@controls/task-grid/module/createTaskTreeModule";

const GRID_STATE_KEY = 'grid';

/** The shared grid, made the task tree and given the modules and features the task grid was. */
export const Grid = () => {
    const runtime = useTaskGridRuntime();
    const options = useGridOptions();
    const modules = React.useMemo<IGridModules>(() => {
        const { custom = [], ...gridModules } = {
            rowSelection: createRowSelectionModule({ mode: 'multiple' }),
            legacyClientApiCompatibility: createLegacyClientApiCompatibilityModule(),
            editing: runtime.isTaskEditingEnabled() ? createEditingModule({ autoSave: true }) : undefined,
            ...options.modules,
        };
        return {
            ...gridModules,
            rowModel: createClientSideRowModelModule(),
            //the tree first: the features reach the task grid through the service it registers
            custom: [createTaskTreeModule({ services: runtime.services }), ...options.features, ...custom],
        };
    }, []);

    return <GridBase.Root
        enableZebra={false}
        enableOptionSetColors={true}
        {...options.gridProps}
        modules={modules}
        stateKey={GRID_STATE_KEY} />;
};
