import { IParameters } from "../../interfaces";
import { mapTranslations } from "./translations";
import { IControl, IOutputs, ITranslations } from "../../interfaces/context";
import { IDataset } from "@talxis/client-libraries";
import { IMapProvider } from "./providers";


export interface IMap extends IControl<IMapParameters, IMapOutputs, Partial<ITranslations<typeof mapTranslations>>, any> {
    
}

interface IMapEntityProps {
    LatitudeAttributeName: string;
    LongitudeAttributeName: string;

    RouteAttributeName?: string;
}

export interface IMapParameters extends IParameters {
    Dataset: IDataset;
    PinMetadata?: IMapEntityProps;
    MapProvider: IMapProvider;
}

export interface IMapOutputs extends IOutputs {

}
