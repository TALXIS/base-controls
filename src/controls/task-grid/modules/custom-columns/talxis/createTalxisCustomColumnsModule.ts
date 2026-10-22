import type { ICustomColumnsModule } from "../createCustomColumnsModule";
import type { ICustomColumnsParameters } from "../CustomColumns";
import { CustomColumns } from "../CustomColumns";
import { ITalxisCustomColumnsStrategyParameters, TalxisCustomColumnsStrategy } from "./TalxisCustomColumnsStrategy";

export interface ITalxisCustomColumnsModuleParameters extends Omit<ITalxisCustomColumnsStrategyParameters, 'pcfContext'>, Omit<ICustomColumnsParameters, 'strategy'> { }

/** The user's own task columns as TALXIS attribute definitions and values. */
export const createTalxisCustomColumnsModule = (parameters: ITalxisCustomColumnsModuleParameters): ICustomColumnsModule => {
    const { entityName, recordId, navigationPropertyName, ...moduleParameters } = parameters;
    return {
        name: 'customColumns',
        onLoad: async datasetControl => {
            const taskDatasetControl = datasetControl.parts.get('taskDatasetControl');
            const strategy = new TalxisCustomColumnsStrategy({ pcfContext: taskDatasetControl.services.get('pcfContext'), entityName, recordId, navigationPropertyName });
            const customColumns = new CustomColumns(taskDatasetControl, { ...moduleParameters, strategy });
            await customColumns.load();
            return customColumns;
        },
        onDestroy: customColumns => customColumns.destroy(),
    };
};
