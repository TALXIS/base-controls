
import { IDateTime } from "./interfaces";
import { Calendar, IAutofill, ICalendarProps, IDatePicker, useTheme } from "@fluentui/react";
import { useEffect, useRef } from "react";
import { DatePicker } from "./DatePicker";
import { getDateTimeStyles } from "./styles";
import { useDateTime } from "./useDateTime";
import dayjs from 'dayjs';
import { ITimePickerProps, TimePicker } from "@talxis/react-components/dist/components/TimePicker";
import { Text } from '@fluentui/react/lib/Text';

interface IInternalTimePickerProps extends ITimePickerProps {
    visible: boolean;
    timeFormat: string;
}

interface IInternalCalendarProps extends ICalendarProps {
    timePickerProps: IInternalTimePickerProps;
}

const InternalCalendar = (props: IInternalCalendarProps) => {
    const theme = useTheme();
    const styles = getDateTimeStyles(theme);
    const timePickerRef = useRef<IAutofill>(null);
    useEffect(() => {
        //@ts-ignore - we need to use the internal method to display exact time, otherwise the shown value would always get rounded to the next 15 min
        timePickerRef.current?._updateValue(dayjs(props.timePickerProps.defaultValue).format(props.timePickerProps.timeFormat))
    }, [props.timePickerProps.defaultValue]);

    return (
        <div className={styles.calendarCallout}>
            <Calendar {...props} />
            <hr />
            {props.timePickerProps.visible &&
                <TimePicker
                    {...props.timePickerProps}
                    defaultValue={dayjs(new Date()).startOf('day').toDate()}
                    useComboBoxAsMenuWidth
                    autofill={{
                        componentRef: timePickerRef
                    }}
                    buttonIconProps={{
                        iconName: 'Clock'
                    }}
                    onRenderOption={(option) => {
                        //the timepicker displays 24 instead of 00 during the option displaying for some reason
                        return <Text>{option?.text.replace('24', '00')}</Text>
                    }}
                    onValidateUserInput={() => { console.log('dasad'); return 'dsadas' }}
                    increments={15}
                    allowFreeform />
            }
        </div>
    )
}

export const DateTime = (componentProps: IDateTime) => {
    const ref = useRef<HTMLDivElement>(null);
    const datePickerRef = useRef<IDatePicker>(null);
    const theme = useTheme();
    const styles = getDateTimeStyles(theme);
    const [date, stringDate, isDateTime, patterns, labels, setStringDate, selectDate] = useDateTime(componentProps, ref);

    return (
        <div ref={ref}>
            <DatePicker
                className={styles.datePicker}
                componentRef={datePickerRef}
                allowTextInput
                calendarProps={{
                    onSelectDate: (date) => selectDate(date),
                }}
                calendarAs={(props) =>
                    <InternalCalendar {...props} timePickerProps={{
                        timeFormat: patterns.shortTimePattern,
                        label: labels.time,
                        visible: isDateTime && !componentProps.parameters.value.errorMessage,
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
                    errorMessage: componentProps.parameters.value.errorMessage
                }}
                //undefined will break the calendar => it wont reflect date change in it's UI
                value={date ?? new Date()}
            />
        </div>
    );
};