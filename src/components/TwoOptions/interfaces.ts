import { ITwoOptionsProperty } from "../../interfaces";
import { IComponent, IOutputs, ITranslations } from "../../interfaces/context";
import { IBaseParameters } from "../../interfaces/parameters";

export interface ITwoOptions extends IComponent<ITwoOptionsParameters, ITwoOptionsOutputs, ITwoOptionsTranslations> {
}

export interface ITwoOptionsParameters extends IBaseParameters {
    value: ITwoOptionsProperty
}

export interface ITwoOptionsOutputs extends IOutputs {
    value?: boolean;
}
export interface ITwoOptionsTranslations extends ITranslations {

}