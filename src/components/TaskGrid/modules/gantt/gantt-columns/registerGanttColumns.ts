import { IColumn } from "@talxis/client-libraries";
import { applyColumn, ISavedQuery } from "@components/TaskGrid/providers/saved-query";
import { IGanttServiceLocator } from "../services";

/**
 * Puts the timeline's columns on every view, hidden where a view leaves one out.
 *
 * They are ordinary task attributes, so their definitions come from the views themselves — a system view
 * showing the column is what describes it. Registered while the module is built, before any view loads.
 */
export const registerGanttColumns = (services: IGanttServiceLocator): void => {
    services.get('taskGridServices').whenAvailable('savedQueryDataProvider', provider => {
        const fieldMapping = services.get('fieldMapping');
        const columnNames = [fieldMapping.startDate, fieldMapping.endDate, fieldMapping.percentComplete, fieldMapping.statusCode]
            .filter((columnName): columnName is string => !!columnName);
        provider.registerHook(query => {
            for (const columnName of columnNames) {
                if (query.columns.some(column => column.name === columnName)) {
                    continue;
                }
                applyColumn(query, { ...resolveColumn(provider.getSystemQueries(), columnName), isHidden: true });
            }
        });
    });
};

/**
 * @throws When a mapped column appears in no view at all — the timeline would have nothing to read.
 */
const resolveColumn = (queries: ISavedQuery[], columnName: string): IColumn => {
    const column = queries.flatMap(query => query.columns).find(column => column.name === columnName);
    if (!column) {
        throw new Error(`The gantt column ${columnName} is missing from every available view. Add it to a system view, or map the gantt to a column one of them carries.`);
    }
    return column;
};
