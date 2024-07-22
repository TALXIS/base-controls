import { IDatePickerProps } from "@talxis/react-components";
import { IDateTimeProperty } from "../../interfaces";
import { IControl, IOutputs, ITranslations } from "../../interfaces/context";
import { IInputParameters } from "../../interfaces/parameters";
import { getDefaultDateTimeTranslations } from "./translations";



export interface IDateTime extends IControl<IDateTimeParameters, IDateTimeOutputs, Partial<ITranslations<ReturnType<typeof getDefaultDateTimeTranslations>>>, IDatePickerProps> {
}
export interface IDateTimeParameters extends IInputParameters {
    value: IDateTimeProperty;
}

export interface IDateTimeOutputs extends IOutputs {
    value?: Date;
}