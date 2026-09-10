import { ICalendarDayGridStyles, ICalendarProps, IComboBox, IProcessedStyleSet, ITheme, ThemeProvider } from "@fluentui/react";
import { useTheme } from "@fluentui/react";
import { Calendar as CalendarBase } from '@fluentui/react/lib/Calendar';
import { useEffect, useRef, useState } from "react";
import { getDateTimeStyles } from "../styles";
import { useDateTimeContext } from "../context";
import { ITimePickerProps, TimePicker } from "@legacy";
import dayjs from "dayjs";
import React from 'react';

interface IInternalCalendarProps extends ICalendarProps {
    timePickerProps: IInternalTimePickerProps;
}

export interface IInternalTimePickerProps extends Omit<ITimePickerProps, 'onChange' | 'defaultValue'> {
    formattedDateTime: string;
    visible: boolean;
    timeFormat: string;
    dateTimeFormat: string;
    lastInputedTimeString?: string;
    theme?: ITheme
    onChange: (time?: string) => void;
}

export const Calendar = (calendarProps: ICalendarProps) => {
    const { parameters, isDateTime, date, patterns, labels, applicationTheme, lastInputedTimeString } = useDateTimeContext();
    const theme = useTheme();
    const styles = getDateTimeStyles(theme);
    const timePickerRef = useRef<IComboBox>(null);
    const [error, setError] = useState(false);

    /** The dates the value may not take, where the control was given any. */
    const getRestrictedDates = (): Date[] | undefined => {
        if (!parameters.RestrictedDates?.raw) {
            return undefined;
        }
        return JSON.parse(parameters.RestrictedDates.raw).map((x: string) => new Date(x));
    };

    /** A day of the week the value may not take is drawn as out of bounds, and refuses the click. */
    const onOverrideDayCellProps = (element: HTMLElement, day: Date, classNames: IProcessedStyleSet<ICalendarDayGridStyles>) => {
        if (!element || !parameters.RestrictedDaysOfWeek?.raw) {
            return;
        }
        const weekDaysToExclude: number[] = JSON.parse(parameters.RestrictedDaysOfWeek.raw);
        if (weekDaysToExclude.includes(day.getDay())) {
            element.setAttribute('data-is-focusable', 'false');
            element.classList?.add(classNames.dayOutsideBounds!);
            (element.children[0] as HTMLButtonElement).disabled = true;
        }
    };

    //what the picker hands over, and what the control it belongs to makes of it
    const props: IInternalCalendarProps = {
        ...calendarProps,
        isMonthPickerVisible: parameters.EnableMonthPicker?.raw !== false,
        isDayPickerVisible: parameters.EnableDayPicker?.raw !== false,
        calendarDayProps: {
            restrictedDates: getRestrictedDates(),
            customDayCellRef: onOverrideDayCellProps
        },
        value: date.get(),
        strings: {
            goToToday: labels.goToToday(),
            days: JSON.parse(labels.days()),
            months: JSON.parse(labels.months()),
            shortDays: JSON.parse(labels.shortDays()),
            shortMonths: JSON.parse(labels.shortMonths())
        },
        timePickerProps: {
            dateTimeFormat: patterns.fullDateTimePattern,
            autoComplete: "off",
            autoCapitalize: "off",
            timeFormat: patterns.shortTimePattern,
            label: labels.time(),
            visible: isDateTime,
            errorMessage: labels.invalidTimeInput(),
            lastInputedTimeString: lastInputedTimeString.current,
            useHour12: patterns.shortTimePattern.endsWith('A'),
            onChange: (time?: string) => {
                date.set(undefined, time);
                lastInputedTimeString.current = time;
            },
            value: date.get(),
            formattedDateTime: date.getFormatted() ?? "",
            strings: {
                invalidInputErrorMessage: labels.invalidTimeInput()
            }
        },
        theme: applicationTheme ?? theme,
        //a date and time calendar reports the date itself, since its own time picker is part of the value.
        //Left to the picker on a date only one, which closes as it reports
        ...(isDateTime && { onSelectDate: (newDate: Date) => date.set(newDate) })
    };
    const timePickerProps = props.timePickerProps;
    const formattedDateTime = timePickerProps.formattedDateTime;

    const getFormattedTime = () => {
        const dayjsDate = dayjs(formattedDateTime, timePickerProps.dateTimeFormat, true);
        if (!dayjsDate.isValid()) {
            return timePickerProps.lastInputedTimeString;
        }
        return dayjsDate.format(timePickerProps.timeFormat) ?? "";
    };

    const onChange = (event: React.FormEvent<IComboBox>, time: Date) => {
        const dayjsDate = dayjs(time);
        let timeValue;
        if (!dayjsDate.isValid()) {
            //@ts-ignore - need to access internals to properly show error values
            timeValue = timePickerRef.current.state.currentPendingValue;
        }
        else {
            timeValue = dayjsDate.format(timePickerProps.timeFormat);
        }
        //@ts-ignore - need to access internals to properly show error values
        timePickerProps.onChange(timeValue);

    }

    useEffect(() => {
        setError(false);
        if (!timePickerProps.visible) {
            return;
        }
        const formattedTime = getFormattedTime();
        //@ts-ignore - need to access internals to properly show error values
        timePickerRef.current.setState({
            currentPendingValue: getFormattedTime()
        })
        if(!formattedTime || !formattedDateTime) {
            return;
        }
        const time = dayjs(formattedTime, timePickerProps.timeFormat, true);
        if (!time.isValid()) {
            setError(true);
        }
    }, [formattedDateTime]);


    return (
        <ThemeProvider theme={props.theme} className={styles.calendarCallout}>
            <CalendarBase {...props} value={props.value} />
            <hr />
            {timePickerProps.visible &&
                <TimePicker
                    {...timePickerProps}
                    errorMessage={error ? timePickerProps.errorMessage : undefined}
                    componentRef={timePickerRef}
                    onFormatDate={(date) => dayjs(date).format(timePickerProps.timeFormat)}
                    onChange={onChange}
                    allowFreeform
                    onClick={() => timePickerRef.current?.focus(true)}
                    useComboBoxAsMenuWidth
                    styles={{
                        callout: {
                            maxHeight: '300px !important'
                        }
                    }}
                    increments={15}
                />
            }
        </ThemeProvider>
    );
};
