import { IParameters } from "@pcf/interfaces";
import { IControl, IOutputs } from "@pcf/interfaces/context";
import { IDataset } from "@talxis/client-libraries";
import { IMapProvider } from "./runtime/providers";


export interface IMap extends IControl<IMapParameters, IMapOutputs, unknown> {

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
