import { IComboBoxProps } from "@legacy";
import { IStringProperty, IWholeNumberProperty } from "@interfaces";
import { IControl, IOutputs, ITranslations } from "@interfaces/context";
import { IInputParameters } from "@interfaces/parameters";
import { getDefaultDurationTranslations } from "./translations";

export interface IDuration extends IControl<IDurationParameters, IDurationOutputs, Partial<ITranslations<ReturnType<typeof getDefaultDurationTranslations>>>, IComboBoxProps> {
}

export interface IDurationParameters extends IInputParameters {
    value: IWholeNumberProperty;
    HoursPerDay?: Omit<IWholeNumberProperty, 'attributes'>;
    /** JSON array of the preset durations in minutes; working days by default when `HoursPerDay` is 8. */
    DurationOptions?: IStringProperty;
}

export interface IDurationOutputs extends IOutputs {
    value?: number
}