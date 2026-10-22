import { createElement } from "react";
import { LocalizationService } from "@utils";
import type { ICustomColumnsModule } from "../createCustomColumnsModule";
import { CustomColumns, ICustomColumnsParameters } from "../CustomColumns";
import type { ICustomColumnsLabels } from "../labels";
import { IndexedDbCustomColumnsStrategy } from "./IndexedDbCustomColumnsStrategy";
import { ICustomColumnDefinition, IndexedDbCustomColumnForm } from "./IndexedDbCustomColumnForm";
import { IIndexedDbCustomColumnFormLabels, INDEXED_DB_CUSTOM_COLUMN_FORM_LABELS } from "./labels";
import { ColumnFormPanel } from "./column-form-panel";

export interface IIndexedDbCustomColumnsModuleParameters extends Omit<ICustomColumnsParameters, 'strategy' | 'labels'> {
    /** The IndexedDB database the columns and their values are kept in; one per control. */
    databaseName: string;
    /** The columns a new database starts with. */
    columns?: ICustomColumnDefinition[];
    /** Overrides for the module's and the form's strings. */
    labels?: Partial<ICustomColumnsLabels & IIndexedDbCustomColumnFormLabels>;
}

/** The user's own task columns kept in the browser's IndexedDB, defined in a form drawn over the control. */
export const createIndexedDbCustomColumnsModule = (parameters: IIndexedDbCustomColumnsModuleParameters): ICustomColumnsModule => {
    const { databaseName, columns, ...moduleParameters } = parameters;
    return {
        name: 'customColumns',
        onLoad: async datasetControl => {
            const taskDatasetControl = datasetControl.parts.get('taskDatasetControl');
            const labels = new LocalizationService<IIndexedDbCustomColumnFormLabels>({ ...INDEXED_DB_CUSTOM_COLUMN_FORM_LABELS, ...parameters.labels });
            const form = new IndexedDbCustomColumnForm(labels);
            taskDatasetControl.services.register('customColumnForm', () => form);
            datasetControl.surfaces.registerSurface(surfaces => {
                surfaces.push({ key: 'customColumnForm', onRender: () => createElement(ColumnFormPanel) });
            });
            const strategy = new IndexedDbCustomColumnsStrategy({
                databaseName,
                columns,
                onOpenForm: definition => form.open(definition),
                labels: { no: labels.getLocalizedString('no'), yes: labels.getLocalizedString('yes') },
            });
            const customColumns = new CustomColumns(taskDatasetControl, { ...moduleParameters, strategy });
            await customColumns.load();
            return customColumns;
        },
        onDestroy: customColumns => customColumns.destroy(),
    };
};
