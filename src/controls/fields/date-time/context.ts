import { createContext, MutableRefObject, useContext } from "react";
import { ITranslation } from "@hooks";
import { ITheme } from "@legacy";
import { IDateTime, IDateTimeParameters } from "./interfaces";
import { useDateTime } from "./hooks/useDateTime";

type DateTimeState = ReturnType<typeof useDateTime>;

/**
 * What a `DateTime` is made of, for the parts of it that the picker renders itself.
 *
 * Through a context rather than through props, because `calendarAs` is a component type to the picker: a
 * component built per render is a new type, and a new type remounts the calendar - which drops the focus a
 * keyboard user has inside it. So the calendar is one component that reads this, rather than one the
 * control builds around what it knows.
 */
export interface IDateTimeContext {
    parameters: IDateTimeParameters;
    /** Whether the value carries a time as well as a date. */
    isDateTime: boolean;
    /** The value, and the ways of reading and writing it. */
    date: DateTimeState[3];
    /** How a date, a time and the two together read in this user's locale. */
    patterns: DateTimeState[4];
    labels: ITranslation<Required<IDateTime>['translations']>;
    /** The control's own theme. */
    theme: ITheme;
    /** The host's theme, which is what a callout is drawn in rather than the cell's. */
    applicationTheme?: ITheme;
    /** What was last typed into the time input, which is what an invalid time is reported from. */
    lastInputedTimeString: MutableRefObject<string | undefined>;
}

export const DateTimeContext = createContext<IDateTimeContext | undefined>(undefined);

/** What the surrounding `DateTime` is made of. */
export const useDateTimeContext = (): IDateTimeContext => {
    const dateTime = useContext(DateTimeContext);
    if (!dateTime) {
        throw new Error('This is the DateTime control\'s own: render it inside a DateTimeContext.');
    }
    return dateTime;
};
