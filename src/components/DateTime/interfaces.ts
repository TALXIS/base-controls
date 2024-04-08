import { IDateTimeProperty } from "../../interfaces";
import { IComponent, IOutputs } from "../../interfaces/context";
import { IBaseParameters } from "../../interfaces/parameters";

export interface IDateTime extends IComponent<IDateTimeParameters, IDateTimeOutputs> {
}

export interface IDateTimeParameters extends IBaseParameters {
    value: IDateTimeProperty;
}

export interface IDateTimeOutputs extends IOutputs {
    value?: Date;
}