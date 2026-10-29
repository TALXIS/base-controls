import { IParameters } from "../../interfaces";
import { IControl, IOutputs } from "../../interfaces/context";
import { IDataset } from "@talxis/client-libraries";
import { IMapProvider } from "./providers";


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
