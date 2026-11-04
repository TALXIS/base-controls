import { IToggleProps } from "@fluentui/react";
import { ITwoOptionsProperty } from "@core/pcf/interfaces";
import { IControl, IOutputs } from "@core/pcf/interfaces/context";
import { IBaseParameters } from "@core/pcf/interfaces/parameters";

export interface ITwoOptions extends IControl<ITwoOptionsParameters, ITwoOptionsOutputs, IToggleProps> {
}

export interface ITwoOptionsParameters extends IBaseParameters {
    value: ITwoOptionsProperty;
    EnableOptionSetColors?: Omit<ITwoOptionsProperty, 'attributes'>;
}

export interface ITwoOptionsOutputs extends IOutputs {
    value?: boolean;
}