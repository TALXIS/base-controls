import { IComboBoxProps } from "@talxis/react-components";
import { IWholeNumberProperty } from "../../interfaces";
import { IControl, IOutputs, ITranslations } from "../../interfaces/context";
import { IInputParameters } from "../../interfaces/parameters";
import { getDefaultDurationTranslations } from "./translations";

export interface IDuration extends IControl<IDurationParameters, IDurationOutputs, Partial<ITranslations<ReturnType<typeof getDefaultDurationTranslations>>>, IComboBoxProps> {
}

export interface IDurationParameters extends IInputParameters {
    value: IWholeNumberProperty;
}

export interface IDurationOutputs extends IOutputs {
    value?: number
}