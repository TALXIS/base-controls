import { ITranslation } from "../../hooks";
import { IControl } from "../../interfaces";
import { IGridOutputs, IGridParameters } from "../Grid";
import { gridTranslations } from "../Grid/translations";
import { datasetTranslations } from "./translations";

//TODO: the translations types should be handle better to support different base controls than grid
export interface IDatasetRenderer extends IControl<IGridParameters, IGridOutputs, Partial<ITranslation<typeof datasetTranslations & typeof gridTranslations>>, any> {
    
}
