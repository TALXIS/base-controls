
import { IDateTime } from "./interfaces";
import { IDatePicker, useTheme } from "@fluentui/react";
import { useEffect, useRef } from "react";
import { getDateTimeStyles } from "./styles";
import { useDateTime } from "./useDateTime";
import dayjs from 'dayjs';
import { Calendar } from "./Calendar";
import { DatePicker } from "@talxis/react-components/dist/components/DatePicker";
import React from 'react';

export const DateTime = (componentProps: IDateTime) => {
    const ref = useRef<HTMLDivElement>(null);
    const datePickerRef = useRef<IDatePicker>(null);
    const theme = useTheme();
    const styles = getDateTimeStyles(theme);
    const context = componentProps.context;
    const parameters = componentProps.parameters;
    const [date, stringDate, isDateTime, patterns, labels, setStringDate, selectDate, clearDate] = useDateTime(componentProps, ref);

    useEffect(() => {
        if(componentProps.parameters.AutoFocus?.raw === true) {
            datePickerRef.current?.showDatePickerPopup();
        }
    }, []);
    return (
        <div ref={ref}>
            <DatePicker
                className={styles.datePicker}
                componentRef={datePickerRef}
                keepCalendarOpenAfterDaySelect={isDateTime}
                allowTextInput
                calendarProps={{
                    //needs to be here as the internal picker does not call the function passed in calendarAs
                    onSelectDate: (date) => selectDate(date),
                }}
                // Lowest date supported by CDS: https://learn.microsoft.com/en-us/previous-versions/dynamicscrm-2016/developers-guide/dn996866(v=crm.8)?redirectedfrom=MSDN
                minDate={new Date('1753-01-01T00:00:00.000Z')}
                firstDayOfWeek={componentProps.context.userSettings.dateFormattingInfo.firstDayOfWeek}
                calendarAs={(props) =>
                    <Calendar {...props}
                        strings={{
                            goToToday: labels.goToToday,
                            days: JSON.parse(labels.days),
                            months: JSON.parse(labels.months),
                            shortDays: JSON.parse(labels.shortDays),
                            shortMonths: JSON.parse(labels.shortMonths)
                        }}
                        timePickerProps={{
                            autoComplete: "off",
                            autoCapitalize: "off",
                            timeFormat: patterns.shortTimePattern,
                            label: labels.time,
                            visible: isDateTime && !parameters.value.errorMessage,
                            useHour12: patterns.shortTimePattern.endsWith('A'),
                            onChange: (e, date) => selectDate(undefined, dayjs(date).format('HH:mm')),
                            defaultValue: date
                        }} />
                }
                textField={{
                    value: stringDate ?? "",
                    onChange: (e, value) => setStringDate(value),
                    placeholder: '---',
                    onNotifyValidationResult: () => null,
                    noValidate: true,
                    borderless: parameters.EnableBorder?.raw === false,
                    errorMessage: parameters.value.errorMessage,
                    styles:{
                        fieldGroup: {
                            height: context.mode.allocatedHeight || undefined,
                            width: context.mode.allocatedWidth || undefined
                        }
                    },
                    //@ts-ignore - TODO: fix types in shared components
                    deleteButtonProps: parameters.EnableDeleteButton?.raw === true ? {
                        key: 'Delete',
                        onClick: clearDate,
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
                value={date ?? new Date()}
            />
        </div>
    );
};