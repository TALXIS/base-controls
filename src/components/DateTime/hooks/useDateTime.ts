import { useEffect, useMemo } from "react";
import { useInputBasedComponent } from "../../../hooks/useInputBasedComponent";
import { IDateTime, IDateTimeOutputs, IDateTimeParameters, IDateTimeTranslations } from "../interfaces";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getDefaultDateTimeTranslations } from "../translations";
import { StringProps } from "../../../types";
dayjs.extend(customParseFormat);
dayjs.extend(utc);

export const useDateTime = (props: IDateTime, ref: React.RefObject<HTMLDivElement>): [
    Date | undefined,
    string | undefined,
    boolean,
    {
        shortDatePattern: string
        shortTimePattern: string;
    },
    Required<StringProps<IDateTimeTranslations>>,
    (value: string | undefined) => void,
    (date: Date | undefined, time?: string) => void,
    () => void

] => {

    const boundValue = props.parameters.value;
    const context = props.context;
    const behavior = boundValue.attributes.Behavior;
    const format = boundValue.attributes.Format;
    const dateFormattingInfo = context.userSettings.dateFormattingInfo;
    
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

    const formatDate = (date: Date | undefined | null | string): string | undefined => {
        if (date == undefined) {
            return undefined;
        }
        if (typeof date === 'string') {
            const dayjsDate = dayjs(date, formatting);
            //error situation
            if (!dayjsDate.isValid()) {
                return date;
            }
            date = dayjsDate.toDate();
        }
        if (isDateTime) {
            //should handle the time zone conversion
            return context.formatting.formatTime(date, behavior);
        }
        return context.formatting.formatDateShort(date);
    };

    const {value, labels, setValue, onNotifyOutputChanged} = useInputBasedComponent<string | undefined, IDateTimeParameters, IDateTimeOutputs, IDateTimeTranslations>('DateTime', props, {
        formatter: formatDate,
        defaultTranslations: getDefaultDateTimeTranslations(props.context.userSettings.dateFormattingInfo)
    });

    useEffect(() => {
        const onBlur = () => {
            if (formatDate(boundValue.raw) === value) {
                return;
            }
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
        //this scenario should only happen in cases of error or null value
        return undefined;
    };

    const dateExtractor = (value: string | Date): Date | string => {
        if (value instanceof Date) {
            return value;
        }
        const dayjsDate = dayjs(value, formatting);
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
        let dayjsDate = dayjs(date ?? getDate());
        let _time = time;
        //date selected from calendar, keep the original time
        if (!_time) {
            _time = dayjs(getDate()).format('HH:mm');
        }
        const [hours, minutes] = _time.split(':');
        dayjsDate = dayjsDate.hour(parseInt(hours));
        dayjsDate = dayjsDate.minute(parseInt(minutes));
        onNotifyOutputChanged({
            value: dayjsDate.toDate()
        });
    };

    return [getDate(), value, isDateTime, { shortDatePattern, shortTimePattern }, labels, setValue, selectDate, clearDate];
};