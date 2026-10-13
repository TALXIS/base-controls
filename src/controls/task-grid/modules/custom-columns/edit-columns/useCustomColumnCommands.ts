import { useDataProvider, usePcfContext } from "@utils";
import { useRequiredDatasetControlRuntime } from "@controls/dataset-control/components/adapters/root";
import { useTaskGridLabels, useTaskGridRuntime } from "@controls/task-grid/context";

/** Creates, edits and deletes custom columns inside the open column editor. */
export const useCustomColumnCommands = () => {
    const customColumns = useTaskGridRuntime().services.get('customColumnsModule');
    const editColumns = useRequiredDatasetControlRuntime().services.get('editColumns');
    const provider = useDataProvider();
    const labels = useTaskGridLabels();
    const pcfContext = usePcfContext();

    const findColumn = (columnName: string) => customColumns.provider.getColumns().find(column => column.name === columnName);

    const createColumn = async () => {
        const columnName = await customColumns.provider.createColumn();
        const column = columnName && findColumn(columnName);
        if (column) {
            editColumns.getSession()?.addColumn(column);
        }
    };

    const editColumn = async (columnName: string) => {
        await customColumns.provider.updateColumn(columnName);
    };

    //a shown column is saved straight away to pick up its new metadata
    const editShownColumn = async (columnName: string) => {
        const response = await pcfContext.navigation.openConfirmDialog({ text: labels.getLocalizedString('confirmColumnEdit') });
        if (!response.confirmed || !await customColumns.provider.updateColumn(columnName)) {
            return;
        }
        const column = findColumn(columnName);
        const session = editColumns.getSession();
        if (column && session) {
            session.removeColumn(columnName);
            session.addColumn(column);
            editColumns.save();
        }
    };

    const deleteColumn = async (columnName: string) => {
        const response = await pcfContext.navigation.openConfirmDialog({ text: labels.getLocalizedString('confirmColumnDelete') });
        if (!response.confirmed || !await customColumns.provider.deleteColumn(columnName)) {
            return;
        }
        editColumns.getSession()?.removeColumn(columnName);
        //gone from the grid too, saved or not
        if (provider.getColumnsMap()[columnName]) {
            provider.setColumns(provider.getColumns().filter(column => column.name !== columnName));
            provider.refresh();
        }
    };

    return { customColumns, createColumn, editColumn, editShownColumn, deleteColumn };
};
