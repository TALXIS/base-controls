import { ICalendarProps } from "@fluentui/react/lib/components/Calendar/Calendar.types";
import { IAutofill } from "@fluentui/react/lib/components/pickers/AutoFill/BaseAutoFill.types";
import { ITimePickerProps } from "@fluentui/react/lib/components/TimePicker/TimePicker.types";
import { useTheme } from "@fluentui/react/lib/utilities/ThemeProvider/useTheme";
import { Calendar as CalendarBase } from '@fluentui/react/lib/Calendar';
import { useEffect, useRef, useState } from "react";
import { getDateTimeStyles } from "./styles";
import { TimePicker } from "@talxis/react-components/dist/components/TimePicker";
import { Text } from '@fluentui/react/lib/Text';
import dayjs from "dayjs";

interface IInternalTimePickerProps extends ITimePickerProps {
    visible: boolean;
    timeFormat: string;
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
