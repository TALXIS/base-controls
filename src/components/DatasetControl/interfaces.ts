import { ITranslation } from "../../hooks";
import { IControl, ITwoOptionsProperty } from "../../interfaces";
import { IGridOutputs, IGridParameters } from "../Grid";
import { gridTranslations } from "../Grid/translations";
import { datasetControlTranslations } from "./translations";



export interface IDatasetControl extends IControl<IGridParameters, IGridOutputs, Partial<ITranslation<typeof datasetControlTranslations & typeof gridTranslations>>, any & {onDatasetInit: () => void}> {
    EnableQuickFind?: Omit<ITwoOptionsProperty, 'attributes'>
}
