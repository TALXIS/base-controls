import { IDateTimeProperty } from "../../interfaces";
import { IComponent, IOutputs, ITranslations } from "../../interfaces/context";
import { IInputParameters } from "../../interfaces/parameters";
import { getDefaultDateTimeTranslations } from "./translations";



export interface IDateTime extends IComponent<IDateTimeParameters, IDateTimeOutputs, Partial<ITranslations<ReturnType<typeof getDefaultDateTimeTranslations>>>> {
}
export interface IDateTimeParameters extends IInputParameters {
    value: IDateTimeProperty;
}

export interface IDateTimeOutputs extends IOutputs {
    value?: Date;
}