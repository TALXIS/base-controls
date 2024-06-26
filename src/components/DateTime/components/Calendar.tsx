import { ICalendarProps } from "@fluentui/react";
import { IAutofill } from "@fluentui/react";
import { useTheme } from "@fluentui/react";
import { Calendar as CalendarBase } from '@fluentui/react/lib/Calendar';
import { useEffect, useRef, useState } from "react";
import { getDateTimeStyles } from "../styles";
import { ITimePickerProps, TimePicker } from "@talxis/react-components/dist/components/TimePicker";
import { Text } from '@fluentui/react/lib/Text';
import dayjs from "dayjs";
import React from 'react';

interface IInternalTimePickerProps extends ITimePickerProps {
    visible: boolean;
    timeFormat: string;
    underlined?: boolean;
}

interface IInternalCalendarProps extends ICalendarProps {
    timePickerProps: IInternalTimePickerProps;
}

export const Calendar = (props: IInternalCalendarProps) => {
    const theme = useTheme();
    const styles = getDateTimeStyles(theme);
    const timePickerRef = useRef<IAutofill>(null);
    const [isTimePickerControlled, setIsTimePickerControlled] = useState<boolean>(true);
    useEffect(() => {
        //@ts-ignore - we need to use the internal method to display exact time, otherwise the shown value would always get rounded to the next 15 min
        timePickerRef.current?._updateValue(getFormattedTime());
        setIsTimePickerControlled(false);

    }, [props.timePickerProps.defaultValue]);

    const getFormattedTime = () => {
        return dayjs(props.timePickerProps.defaultValue).format(props.timePickerProps.timeFormat);
    };

    useEffect(() => {
        //hack to focus the selected date for keyboard support
        const day = document.querySelector('.ms-CalendarDay-daySelected') as HTMLButtonElement;
        day?.focus();
    }, [props]);

    return (
        <div className={styles.calendarCallout}>
            <CalendarBase {...props} />
            <hr />
            {props.timePickerProps.visible &&
                <TimePicker
                    {...props.timePickerProps}
                    onChange={(e, time) => {
                        setIsTimePickerControlled(true);
                        props.timePickerProps.onChange!(e, time);
                    }}
                    defaultValue={dayjs(new Date()).startOf('day').toDate()}
                    useComboBoxAsMenuWidth
                    styles={{
                        callout: {
                            maxHeight: '300px !important'
                        }
                    }}
                    autofill={{
                        componentRef: timePickerRef,
                        //hack to prevent blinking on prop updates
                        value: isTimePickerControlled ? getFormattedTime() : undefined
                    }}
                    buttonIconProps={{
                        iconName: 'Clock'
                    }}
                    onRenderOption={(option) => {
                        //the timepicker displays 24 instead of 00 during the option displaying for some reason
                        return <Text>{option?.text.replace('24', '00')}</Text>;
                    }}
                    increments={15}
                    allowFreeform />
            }
        </div>
    );
};
