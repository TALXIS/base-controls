import { IToggleProps } from "@fluentui/react";
import { ITwoOptionsProperty } from "@pcf/interfaces";
import { IControl, IOutputs } from "@pcf/interfaces/context";
import { IBaseParameters } from "@pcf/interfaces/parameters";

export interface ITwoOptions extends IControl<ITwoOptionsParameters, ITwoOptionsOutputs, IToggleProps> {
}

export interface ITwoOptionsParameters extends IBaseParameters {
    value: ITwoOptionsProperty;
    EnableOptionSetColors?: Omit<ITwoOptionsProperty, 'attributes'>;
}

export interface ITwoOptionsOutputs extends IOutputs {
    value?: boolean;
}