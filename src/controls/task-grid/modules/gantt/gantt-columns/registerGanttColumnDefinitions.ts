import { DatasetConstants } from "@talxis/client-libraries";
import { ColDef } from "@components/TaskGrid/components/grid";
import { IGanttServiceLocator } from "../services";

/**
 * What the split view needs of the grid's own columns, as a hook over the definitions it built.
 *
 * Registered by the module rather than asked for by the customizer, and at the default priority: it only
 * has to follow the descriptor's strategy, which every hook does.
 */
export const registerGanttColumnDefinitions = (services: IGanttServiceLocator): void => {
    services.get('taskGridServices').whenAvailable('gridCustomizer', customizer => {
        customizer.registerColumnDefinitionsHook(columnDefs => applyGanttColumnDefinitions(columnDefs, services));
    });
};

const applyGanttColumnDefinitions = (columnDefs: ColDef[], services: IGanttServiceLocator): void => {
    const subjectColumnName = services.get('taskGridServices').get('nativeColumns').subject;
    for (const colDef of columnDefs) {
        //the grid is one half of the split view, so nothing in it is pinned against the timeline
        if (colDef.colId === subjectColumnName) {
            colDef.pinned = undefined;
        }
        if (colDef.colId === DatasetConstants.CHECKBOX_COLUMN_KEY) {
            colDef.lockPosition = true;
        }
        //every row is one chart row, so a row that grows to fit its content would break the mirroring
        colDef.autoHeight = false;
    }
};
