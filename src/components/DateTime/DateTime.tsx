
import { IDateTime } from "./interfaces";
import { DateRangeType, ICalendarDayGridStyles, IDatePicker, IProcessedStyleSet, ThemeProvider } from "@fluentui/react";
import { useEffect, useRef } from "react";
import { getDateTimeStyles } from "./styles";
import { useDateTime } from "./hooks/useDateTime";
import { Calendar } from "./components/Calendar";
import { DatePicker } from "@talxis/react-components";
import React from 'react';
import { useControlSizing } from "../../hooks/useControlSizing";
import dayjs from "dayjs";

export const DateTime = (componentProps: IDateTime) => {
    const ref = useRef<HTMLDivElement>(null);
    const datePickerRef = useRef<IDatePicker>(null);
    const context = componentProps.context;
    const parameters = componentProps.parameters;
    const [isDateTime, theme, labels, date, patterns] = useDateTime(componentProps, ref);
    const styles = getDateTimeStyles(theme);
    const { height, width } = useControlSizing(componentProps.context.mode);
    const lastInputedTimeString = useRef<string>();

    useEffect(() => {
        if (componentProps.parameters.AutoFocus?.raw === true) {
            datePickerRef.current?.showDatePickerPopup();
        }
    }, []);

    const getRestrictedDates = (): Date[] | undefined => {
        if(!parameters.RestrictedDates?.raw) {
            return undefined;
        }
        return JSON.parse(parameters.RestrictedDates?.raw).map((x: string) => new Date(x))
    }
    const onOverrideDayCellProps = (element: HTMLElement, date: Date, classNames: IProcessedStyleSet<ICalendarDayGridStyles>) => {
        if(!element || !parameters.RestrictedDaysOfWeek?.raw) {
            return;
        }
        const weekDaysToExclude: number[] = JSON.parse(parameters.RestrictedDaysOfWeek.raw);
        if(weekDaysToExclude.includes(date.getDay())) {
            element.setAttribute('data-is-focusable', 'false');
            element.classList?.add(classNames.dayOutsideBounds!);
            (element.children[0] as HTMLButtonElement).disabled = true;
        }
    }

    return (
        <ThemeProvider theme={theme} applyTo="none" ref={ref}>
            <DatePicker
                className={styles.datePicker}
                underlined={theme.effects.underlined}
                componentRef={datePickerRef}
                hideErrorMessage={!parameters.ShowErrorMessage?.raw}
                keepCalendarOpenAfterDaySelect={isDateTime}
                readOnly={context.mode.isControlDisabled}
                //disable so the user cannot input restricted Dates
                allowTextInput={!parameters.RestrictedDates && !parameters.RestrictedDaysOfWeek}
                // Lowest date supported by CDS: https://learn.microsoft.com/en-us/previous-versions/dynamicscrm-2016/developers-guide/dn996866(v=crm.8)?redirectedfrom=MSDN
                minDate={new Date('1753-01-01T00:00:00.000Z')}
                firstDayOfWeek={componentProps.context.userSettings.dateFormattingInfo.firstDayOfWeek}
                calendarAs={(props) =>
                    <Calendar {...props}
                        onSelectDate={(newDate) => date.set(newDate)}
                        isMonthPickerVisible={parameters.EnableMonthPicker?.raw !== false}
                        isDayPickerVisible={parameters.EnableDayPicker?.raw !== false}
                        calendarDayProps={{
                            restrictedDates: getRestrictedDates(),
                            customDayCellRef: onOverrideDayCellProps
                        }}
                        strings={{
                            goToToday: labels.goToToday(),
                            days: JSON.parse(labels.days()),
                            months: JSON.parse(labels.months()),
                            shortDays: JSON.parse(labels.shortDays()),
                            shortMonths: JSON.parse(labels.shortMonths())
                        }}
                        timePickerProps={{
                            underlined: theme.effects.underlined,
                            dateTimeFormat: patterns.fullDateTimePattern,
                            autoComplete: "off",
                            autoCapitalize: "off",
                            timeFormat: patterns.shortTimePattern,
                            label: labels.time(),
                            visible: isDateTime,
                            errorMessage: labels.invalidTimeInput(),
                            lastInputedTimeString: lastInputedTimeString.current,
                            useHour12: patterns.shortTimePattern.endsWith('A'),
                            onChange: (time) => {
                                date.set(undefined, time);
                                lastInputedTimeString.current = time;
                            },
                            value: date.get(),
                            formattedDateTime: date.getFormatted() ?? "",
                            strings: {
                                invalidInputErrorMessage: labels.invalidTimeInput()
                            }
                        }} />
                }
                errorMessage={parameters.value.errorMessage}
                textField={{
                    underlined: theme.effects.underlined,
                    value: date.getFormatted() ?? "",
                    onChange: (e, value) => {
                        if(isDateTime) {
                            const datePart = dayjs(value, patterns.shortDatePattern).format(patterns.shortDatePattern);
                            const time = value?.split(datePart).pop()?.substring(1);
                            lastInputedTimeString.current = time;
                        }
                        date.setDateString(value)
                    },
                    placeholder: '---',
                    onNotifyValidationResult: () => null,
                    noValidate: true,
                    borderless: parameters.EnableBorder?.raw === false,
                    styles: {
                        fieldGroup: {
                            height: height,
                            width: width
                        }
                    },
                    //@ts-ignore - TODO: fix types in shared components
                    deleteButtonProps: parameters.EnableDeleteButton?.raw === true ? {
                        key: 'Delete',
                        onClick: date.clear,
                        showOnlyOnHover: true,
                        iconProps: {
                            iconName: 'Cancel'
                        }
                    } : undefined,
                    clickToCopyProps: parameters.EnableCopyButton?.raw === true ? {
                        key: 'copy',
                        showOnlyOnHover: true,
                        iconProps: {
                            iconName: 'Copy'
                        }
                    } : undefined
                }
                }
                //undefined will break the calendar => it wont reflect date change in it's UI
                value={date.get() ?? new Date()}
            />
        </ThemeProvider>
    );
};

