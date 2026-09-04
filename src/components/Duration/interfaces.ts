import { IComboBoxProps } from "@legacy";
import { IWholeNumberProperty } from "@interfaces";
import { IControl, IOutputs, ITranslations } from "@interfaces/context";
import { IInputParameters } from "@interfaces/parameters";
import { getDefaultDurationTranslations } from "./translations";

export interface IDuration extends IControl<IDurationParameters, IDurationOutputs, Partial<ITranslations<ReturnType<typeof getDefaultDurationTranslations>>>, IComboBoxProps> {
    /**
    * Preset durations offered in the dropdown, in minutes. Captions are formatted from these
    * values, so they stay localized and respect `parameters.HoursPerDay`. Defaults to
    * `DEFAULT_DURATION_OPTIONS`. Pass an empty array to offer no presets (free input remains available).
    */
    durationOptions?: number[];
}

export interface IDurationParameters extends IInputParameters {
    value: IWholeNumberProperty;
    HoursPerDay?: Omit<IWholeNumberProperty, 'attributes'>;
}

export interface IDurationOutputs extends IOutputs {
    value?: number
}