import { IToggleProps } from "@fluentui/react";
import { ITwoOptionsProperty } from "@interfaces";
import { IControl, IOutputs, ITranslations } from "@interfaces/context";
import { IBaseParameters } from "@interfaces/parameters";
import { twoOptionsTranslations } from "./translations";

export interface ITwoOptions extends IControl<ITwoOptionsParameters, ITwoOptionsOutputs, Partial<ITranslations<typeof twoOptionsTranslations>>, IToggleProps> {
}

export interface ITwoOptionsParameters extends IBaseParameters {
    value: ITwoOptionsProperty;
    EnableOptionSetColors?: Omit<ITwoOptionsProperty, 'attributes'>;
}

export interface ITwoOptionsOutputs extends IOutputs {
    value?: boolean;
}