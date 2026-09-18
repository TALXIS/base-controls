import { IDateTime } from "./interfaces";
import { IDatePicker } from "@fluentui/react";
import { ThemeProvider, useControlSurfaceTheme } from "@utils";
import { useEffect, useRef } from "react";
import { getDateTimeStyles } from "./styles";
import { useDateTime } from "./hooks/useDateTime";
import { Calendar } from "./components/Calendar";
import { DateTimeContext, IDateTimeContext } from "./context";
import { DatePicker } from "@legacy";
import { useControlSizing } from "@hooks/useControlSizing";
import dayjs from "dayjs";
import { useDebouncedCallback } from "use-debounce";

//the picker fills what it is drawn in, so what it is drawn in has to be the container's height
const FILL_STYLE: React.CSSProperties = { height: '100%' };

export const DateTime = (componentProps: IDateTime) => {
    const ref = useRef<HTMLDivElement>(null);
    const onOverrideComponentProps = componentProps.onOverrideComponentProps ?? ((props) => props);
    const datePickerRef = useRef<IDatePicker>(null);
    const context = componentProps.context;
    const parameters = componentProps.parameters;
    const [isDateTime, theme, labels, date, patterns] = useDateTime(componentProps, ref);
    const surfaceTheme = useControlSurfaceTheme(componentProps.context.fluentDesignLanguage);
    const styles = getDateTimeStyles(theme);
    const { height, width, fillsAvailableSpace } = useControlSizing(componentProps.context.mode, componentProps.parameters);
    const lastInputedTimeString = useRef<string>();

    useEffect(() => {
        if (componentProps.parameters.AutoFocus?.raw === true) {
            datePickerRef.current?.showDatePickerPopup();
        }
    }, []);

    const onSelectDate = useDebouncedCallback((value: Date | null | undefined) => {
        date.set(value!);
        //a date-only field is finished once a day is picked, and this is the only path that says so: a
        //date and time one keeps its calendar open for the time, which is why it does not come through here
        parameters.Cell?.raw?.finishEditing();
    }, 0);

    /** What the picker's own parts read: the calendar is one component, handed the control rather than props. */
    const dateTime: IDateTimeContext = {
        parameters: parameters,
        isDateTime: isDateTime,
        date: date,
        patterns: patterns,
        labels: labels,
        theme: theme,
        lastInputedTimeString: lastInputedTimeString
    };

    const datePickerProps = onOverrideComponentProps({
        className: styles.datePicker,
        componentRef: datePickerRef,
        hideErrorMessage: !parameters.ShowErrorMessage?.raw,
        fillAvailableSpace: fillsAvailableSpace,
        keepCalendarOpenAfterDaySelect: isDateTime,
        readOnly: context.mode.isControlDisabled,
        //@ts-ignore - this is a hack to close the calendar when dates get selected on date only fields
        onSelectDate: isDateTime ? undefined : onSelectDate,
        //disable so the user cannot input restricted Dates
        allowTextInput: !parameters.RestrictedDates?.raw && !parameters.RestrictedDaysOfWeek?.raw,
        // Lowest date supported by CDS: https://learn.microsoft.com/en-us/previous-versions/dynamicscrm-2016/developers-guide/dn996866(v=crm.8)?redirectedfrom=MSDN
        minDate: new Date('1753-01-01T00:00:00.000Z'),
        parseDateFromString: (dateString) => {
            const parsedDate = date.parseDateString(dateString);
            if (parsedDate instanceof Date) {
                return parsedDate;
            }
            return null;
        },
        firstDayOfWeek: componentProps.context.userSettings.dateFormattingInfo.firstDayOfWeek,
        deleteButtonProps: parameters.EnableDeleteButton?.raw === true ? {
            key: 'Delete',
            showOnlyOnHover: true,
            iconProps: {
                iconName: 'Cancel'
            },
            onClick: () => date.clear()
        } : undefined,
        clickToCopyProps: parameters.EnableCopyButton?.raw === true ? {
            key: 'copy',
            showOnlyOnHover: true,
            iconProps: {
                iconName: 'Copy'
            }
        } : undefined,
        calendarAs: Calendar,
        errorMessage: parameters.value.errorMessage,
        textField: {
            value: date.getFormatted() ?? "",
            onChange: (e, value) => {
                if (isDateTime) {
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
        },
        value: date.get() ?? undefined
    });

    return (
        <DateTimeContext.Provider value={dateTime}>
            <ThemeProvider theme={theme} surfaceTheme={surfaceTheme} applyTo="none" ref={ref} style={fillsAvailableSpace ? FILL_STYLE : undefined}>
                <DatePicker {...datePickerProps} />
            </ThemeProvider>
        </DateTimeContext.Provider>
    );
};