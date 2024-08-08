import { ICalendarProps, IComboBox } from "@fluentui/react";
import { useTheme } from "@fluentui/react";
import { Calendar as CalendarBase } from '@fluentui/react/lib/Calendar';
import { useEffect, useRef, useState } from "react";
import { getDateTimeStyles } from "../styles";
import { ITimePickerProps, TimePicker } from "@talxis/react-components";
import dayjs from "dayjs";
import React from 'react';

interface IInternalTimePickerProps extends Omit<ITimePickerProps, 'onChange' | 'defaultValue'> {
    formattedDateTime: string;
    visible: boolean;
    timeFormat: string;
    dateTimeFormat: string;
    lastInputedTimeString?: string;
    onChange: (time?: string) => void;
}

export interface IInternalCalendarProps extends ICalendarProps {
    timePickerProps: IInternalTimePickerProps;
}

export const Calendar = (props: IInternalCalendarProps) => {
    const timePickerProps = props.timePickerProps;
    const formattedDateTime = timePickerProps.formattedDateTime;
    const theme = useTheme();
    const styles = getDateTimeStyles(theme);
    const timePickerRef = useRef<IComboBox>(null);
    const [error, setError] = useState(false);

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
        <div className={styles.calendarCallout}>
            <CalendarBase {...props} value={props.value} />
            <hr />
            {timePickerProps.visible &&
                <TimePicker
                    {...timePickerProps}
                    errorMessage={error ? timePickerProps.errorMessage : undefined}
                    componentRef={timePickerRef}
                    onFormatDate={(date) => dayjs(date).format(timePickerProps.timeFormat)}
                    onChange={onChange}
                    useComboBoxAsMenuWidth
                    styles={{
                        callout: {
                            maxHeight: '300px !important'
                        }
                    }}
                    increments={15}
                    allowFreeform
                />
            }
        </div>
    );
};
