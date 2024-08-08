import { useEffect, useRef } from "react";
import { useInputBasedControl } from "../../../hooks/useInputBasedControl";
import { IDateTime, IDateTimeOutputs, IDateTimeParameters} from "../interfaces";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getDefaultDateTimeTranslations } from "../translations";
import {ITranslation } from "../../../hooks";
import { ITheme } from "../../../interfaces/theme";
dayjs.extend(customParseFormat);
dayjs.extend(utc);

export const useDateTime = (props: IDateTime, ref: React.RefObject<HTMLDivElement>): [
    boolean,
    ITheme,
    ITranslation<Required<IDateTime>['translations']>,
    {
        get: () => Date | undefined;
        getFormatted: () => string | undefined;
        set: (date?: Date, time?: string) => void;
        setDateString: (value: string | undefined) => void;
        clear: () => void;
    },
    {
        shortDatePattern: string
        shortTimePattern: string;
        fullDateTimePattern: string;
    },
] => {

    const boundValue = props.parameters.value;
    const context = props.context;
    const behavior = boundValue.attributes.Behavior;
    const format = boundValue.attributes.Format;
    const dateFormattingInfo = context.userSettings.dateFormattingInfo;
    const lastValidDateRef = useRef<Date | undefined>(undefined);
    
    const isDateTime = (() => {
        switch (format) {
            case 'DateAndTime':
            case 'Date and Time':
            case 'DateAndTime.DateAndTime':
            case 'datetime': {
                return true;
            }
            default: {
                return false;
            }
        }
    })();

    //MS returns the pattern without correct separator and they do this during formatting
    const shortDatePattern = dateFormattingInfo.shortDatePattern.replace(/\//g, dateFormattingInfo.dateSeparator).toUpperCase();
    const shortTimePattern = dateFormattingInfo.shortTimePattern.replace(/:/g, dateFormattingInfo.timeSeparator).replace('tt', 'A');
    const formatting = (() => {
        if (isDateTime) {
            return `${shortDatePattern} ${shortTimePattern}`;
        }
        return shortDatePattern;
    })();

    const formatDate = (date: Date | undefined | null | string): string | undefined | null => {
        if (date instanceof Date) {
            if (isDateTime) {
                //should handle the time zone conversion
                return context.formatting.formatTime(date, behavior);
            }
            return context.formatting.formatDateShort(date);
        }
        return date;
    };

    const {value, labels, theme, setValue, onNotifyOutputChanged} = useInputBasedControl<string | undefined, IDateTimeParameters, IDateTimeOutputs, Required<IDateTime>['translations']>('DateTime', props, {
        formatter: formatDate,
        defaultTranslations: getDefaultDateTimeTranslations(props.context.userSettings.dateFormattingInfo)
    });

    useEffect(() => {
        const onBlur = () => {
            onNotifyOutputChanged({
                value: dateExtractor(value!) as any
            });
        };
        const input = ref.current?.querySelector('input');
        input?.addEventListener('blur', onBlur);
        return () => {
            input?.removeEventListener('blur', onBlur);
        };
    }, [value]);

    useEffect(() => {
        if (boundValue.raw instanceof Date) {
            lastValidDateRef.current = boundValue.raw;
        }
    }, [boundValue.raw]);

    const getDate = (): Date | undefined => {
        if (boundValue.raw instanceof Date) {
            if (behavior === 3) {
                //the date in javascript gets automatically adjusted to local time zone
                //this will make it think that the date already came in local time, thus not adjusting the time
                const date = new Date(boundValue.raw.toISOString().replace('Z', ''));
                return date;
            }
            return boundValue.raw;
        }
        if(boundValue.error) {
            return lastValidDateRef.current;
        }
        return undefined;
    };

    const dateExtractor = (value: string | Date): Date | string => {
        if (value instanceof Date) {
            return value;
        }
        const dayjsDate = dayjs(value, formatting, true);
        if (!dayjsDate.isValid()) {
            return value;
        }
        return dayjsDate.toDate();
    };

    const clearDate = () => {
        onNotifyOutputChanged({
            value: undefined
        });
    };

    const selectDate = (date?: Date, time?: string) => {
        //onSelectDate can trigger on initial click with empty date, do not continue in this case
        //for clearing dates, date.clear should be used
        if(!date && !time) {
            return;
        }
        let dayjsDate = dayjs(date ?? getDate());
        //date selected from calendar, keep the original time
        if (!time) {
            time = dayjs(getDate()).format(shortTimePattern);
        }
        const dayjsTime = dayjs(time, shortTimePattern, true);
        let invalidDateString;
        if(!dayjsTime.isValid()) {
            invalidDateString = `${dayjsDate.format(shortDatePattern)} ${time}`
        }
        dayjsDate = dayjsDate.hour(dayjsTime.hour());
        dayjsDate = dayjsDate.minute(dayjsTime.minute());
        onNotifyOutputChanged({
            value: dateExtractor(invalidDateString ?? dayjsDate.toDate()) as any
        });
    };
    return [
        isDateTime,
        theme,
        labels,
        {
            get: getDate,
            clear: clearDate,
            getFormatted: () => value,
            set: selectDate,
            setDateString: setValue
        },
        {
            shortDatePattern: shortDatePattern,
            shortTimePattern: shortTimePattern,
            fullDateTimePattern: `${shortDatePattern} ${shortTimePattern}`
        }
    ]
};