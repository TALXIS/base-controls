import { IDateTimeProperty } from "../../interfaces";
import { IComponent, IOutputs, ITranslations } from "../../interfaces/context";
import { IBaseParameters } from "../../interfaces/parameters";

export interface IDateTime extends IComponent<IDateTimeParameters, IDateTimeOutputs, IDateTimeTranslations> {
    translations?: IDateTimeTranslations
}

export interface IDateTimeParameters extends IBaseParameters {
    value: IDateTimeProperty;
}

export interface IDateTimeOutputs extends IOutputs {
    value?: Date;
}
export interface IDateTimeTranslations extends ITranslations {
    time?: {[LCID: number]: string}
    goToToday?: {[LCID: number]: string}
    days?: {[LCID: number]: string[]} | string[];
    months?: {[LCID: number]: string[]} | string[];
    shortDays?: {[LCID: number]: string[]} | string[];
    shortMonths?: {[LCID: number]: string[]} | string[];
}