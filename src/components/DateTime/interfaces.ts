import { IDatePickerProps } from "@talxis/react-components";
import { IDateTimeProperty, IStringProperty, ITwoOptionsProperty } from "../../interfaces";
import { IControl, IOutputs, ITranslations } from "../../interfaces/context";
import { IInputParameters } from "../../interfaces/parameters";
import { getDefaultDateTimeTranslations } from "./translations";



export interface IDateTime extends IControl<IDateTimeParameters, IDateTimeOutputs, Partial<ITranslations<ReturnType<typeof getDefaultDateTimeTranslations>>>, IDatePickerProps> {
}
export interface IDateTimeParameters extends IInputParameters {
    value: IDateTimeProperty;
    EnableMonthPicker?: ITwoOptionsProperty;
    EnableDayPicker?: ITwoOptionsProperty;
    /**
* JSON array of dates that should not be selectable, example: ['2019-01-10', '2019-01-11']
*/
    RestrictedDates?: IStringProperty;
        /**
* JSON array of week days that should not be selectable (0 = Sunday,...6 = Saturday), example: [0,2,3]
*/
    RestrictedDaysOfWeek?: IStringProperty;
}

export interface IDateTimeOutputs extends IOutputs {
    value?: Date;
}