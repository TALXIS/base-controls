import { IToggleProps } from "@fluentui/react";
import { ITwoOptionsProperty } from "../../interfaces";
import { IComponent, IOutputs } from "../../interfaces/context";
import { IBaseParameters } from "../../interfaces/parameters";

export interface ITwoOptions extends IComponent<ITwoOptionsParameters, ITwoOptionsOutputs, any, IToggleProps> {
}

export interface ITwoOptionsParameters extends IBaseParameters {
    value: ITwoOptionsProperty
}

export interface ITwoOptionsOutputs extends IOutputs {
    value?: boolean;
}