
import { IDateTime } from "./interfaces";
import { ICalendarDayGridStyles, IDatePicker, IProcessedStyleSet, ThemeProvider } from "@fluentui/react";
import { useEffect, useRef } from "react";
import { getDateTimeStyles } from "./styles";
import { useDateTime } from "./hooks/useDateTime";
import { Calendar, IInternalCalendarProps } from "./components/Calendar";
import { DatePicker } from "@talxis/react-components";
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
                componentRef={datePickerRef}
                hideErrorMessage={!parameters.ShowErrorMessage?.raw}
                keepCalendarOpenAfterDaySelect={isDateTime}
                readOnly={context.mode.isControlDisabled}
                //@ts-ignore - this is a hack to close the calendar when dates get selected on date only fields
                onSelectDate={isDateTime ? undefined : (newDate) => date.set(newDate!)}
                //disable so the user cannot input restricted Dates
                allowTextInput={!parameters.RestrictedDates?.raw && !parameters.RestrictedDaysOfWeek?.raw}
                // Lowest date supported by CDS: https://learn.microsoft.com/en-us/previous-versions/dynamicscrm-2016/developers-guide/dn996866(v=crm.8)?redirectedfrom=MSDN
                minDate={new Date('1753-01-01T00:00:00.000Z')}
                firstDayOfWeek={componentProps.context.userSettings.dateFormattingInfo.firstDayOfWeek}
                deleteButtonProps={parameters.EnableDeleteButton?.raw === true ? {
                    key: 'Delete',
                    showOnlyOnHover: true,
                    iconProps: {
                        iconName: 'Cancel'
                    },
                    onClick: () => date.clear()
                } : undefined}
                clickToCopyProps={ parameters.EnableCopyButton?.raw === true ? {
                    key: 'copy',
                    showOnlyOnHover: true,
                    iconProps: {
                        iconName: 'Copy'
                    }
                } : undefined}
                calendarAs={(props) =>
                {
                    const calendarProps: IInternalCalendarProps = {
                        ...props,
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
                        theme: componentProps.context.fluentDesignLanguage?.applicationTheme
                    };
                    if(isDateTime) {
                        calendarProps.onSelectDate = (newDate) => date.set(newDate)
                    }
                   return <Calendar {...calendarProps} />
                    }
                }
                errorMessage={parameters.value.errorMessage}
                textField={{
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
                    styles: {
                        fieldGroup: {
                            height: height,
                            width: width
                        }
                    }
                }
                }
                value={date.get() ?? undefined}
            />
        </ThemeProvider>
    );
};

