import { ITwoOptionsProperty } from "../../interfaces";
import { IComponent, IOutputs } from "../../interfaces/context";
import { IBaseParameters } from "../../interfaces/parameters";

export interface ITwoOptions extends IComponent<ITwoOptionsParameters, ITwoOptionsOutputs, any> {
}

export interface ITwoOptionsParameters extends IBaseParameters {
    value: ITwoOptionsProperty
}

export interface ITwoOptionsOutputs extends IOutputs {
    value?: boolean;
}