import { IToggleProps } from "@fluentui/react";
import { ITwoOptionsProperty } from "../../interfaces";
import { IControl, IOutputs } from "../../interfaces/context";
import { IBaseParameters } from "../../interfaces/parameters";

export interface ITwoOptions extends IControl<ITwoOptionsParameters, ITwoOptionsOutputs, any, IToggleProps> {
}

export interface ITwoOptionsParameters extends IBaseParameters {
    value: ITwoOptionsProperty;
    EnableOptionSetColors?: Omit<ITwoOptionsProperty, 'attributes'>;
}

export interface ITwoOptionsOutputs extends IOutputs {
    value?: boolean;
}