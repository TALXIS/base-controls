import { IParameters } from "../../interfaces";
import { mapTranslations } from "./translations";
import { IControl, IOutputs, ITranslations } from "../../interfaces/context";
import { IDataset } from "@talxis/client-libraries";
import { IMapProvider } from "./providers";


export interface IMapPicker extends IControl<IMapPickerParameters, IMapPickerOutputs, Partial<ITranslations<typeof mapTranslations>>, any> {
    
}

interface IMapPickerEntityProps {
    LatitudeAttributeName: string;
    LongitudeAttributeName: string;

    RouteAttributeName?: string;
}

export interface IMapPickerParameters extends IParameters {
    Dataset: IDataset;
    PinMetadata?: IMapPickerEntityProps;
    MapProvider: IMapProvider;
}

export interface IMapPickerOutputs extends IOutputs {

}
