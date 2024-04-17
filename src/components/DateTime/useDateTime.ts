import { useEffect, useMemo } from "react";
import { useInputBasedComponent } from "../../hooks/useInputBasedComponent";
import { IDateTime, IDateTimeOutputs, IDateTimeParameters, IDateTimeTranslations } from "./interfaces";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { getDateTimeTranslations } from "./translations";

export const useDateTime = (props: IDateTime, ref: React.RefObject<HTMLDivElement>): [
    Date | undefined,
    string | undefined,
    boolean,
    {
        shortDatePattern: string
        shortTimePattern: string;
    },
    (value: string | undefined) => void,
    (date: Date | undefined, time?: string) => void,
    (key: string) => string

] => {

    const boundValue = props.parameters.value;
    const context = props.context;
    const behavior = boundValue.attributes.Behavior;
    const format = boundValue.attributes.Format;
    const dateFormattingInfo = context.userSettings.dateFormattingInfo;
    const isDateTime = (() => {
        switch(format) {
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

    const shortDatePattern = dateFormattingInfo.shortDatePattern.replace(/\//g, dateFormattingInfo.dateSeparator).toUpperCase();
    const shortTimePattern = dateFormattingInfo.shortTimePattern.replace(/:/g, dateFormattingInfo.timeSeparator).replace('tt', 'A');
    const formatting = (() => {
        if (isDateTime) {
            //MS returns the pattern without correct separator and they do this during formatting
            return `${shortDatePattern} ${shortTimePattern}`
        }
        return shortDatePattern
    })();

    useMemo(() => {
        dayjs.extend(customParseFormat)
    }, []);

    const formatDate = (date: Date | null | string): string | undefined => {
        if (date == null) {
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

    const [dateStringValue, setDateStringValue, notifyOutputChanged, getLabel] = useInputBasedComponent<string | undefined, IDateTimeParameters, IDateTimeOutputs, IDateTimeTranslations>('DateTime', props, {
        formatter: formatDate,
        defaultTranslations: getDateTimeTranslations()
    });

    useEffect(() => {
        const onBlur = () => {
            notifyOutputChanged({
                value: dateExtractor(dateStringValue!) as any
            })
        }
        const input = ref.current?.querySelector('input');
        input?.addEventListener('blur', onBlur);
        return () => {
            input?.removeEventListener('blur', onBlur);
        }
    }, [dateStringValue]);

    const getDate = (): Date | undefined => {
        if (boundValue.raw instanceof Date) {
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

    const selectDate = (date?: Date, time?: string) => {
        let dayjsDate = dayjs(date ?? getDate())
        let _time = time;
        //date selected from calendar, keep the original time
        if(!_time) {
            _time = dayjs(getDate()).format('HH:mm');
        }
        const [hours, minutes] = _time.split(':');
        dayjsDate = dayjsDate.hour(parseInt(hours));
        dayjsDate = dayjsDate.minute(parseInt(minutes));
        notifyOutputChanged({
            value: dayjsDate.toDate()
        })
    }

    return [getDate(), dateStringValue, isDateTime, {shortDatePattern, shortTimePattern}, setDateStringValue, selectDate, getLabel]
}