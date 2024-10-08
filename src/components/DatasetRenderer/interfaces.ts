import { ITranslation } from "../../hooks";
import { IControl, ITwoOptionsProperty } from "../../interfaces";
import { IGridOutputs, IGridParameters } from "../Grid";
import { gridTranslations } from "../Grid/translations";
import { datasetTranslations } from "./translations";

export interface IDatasetRenderer extends IControl<IGridParameters, IGridOutputs, Partial<ITranslation<typeof datasetTranslations & typeof gridTranslations>>, any> {
    EnableQuickFind?: Omit<ITwoOptionsProperty, 'attributes'>
}
