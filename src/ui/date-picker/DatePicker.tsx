import * as React from 'react';
import { DatePicker as DatePickerBase, IDatePickerProps } from "@fluentui/react";
import { useSurfaceTheme } from "@theme";

/** A date picker whose calendar is drawn in the application's theme rather than in the input's. */
export const DatePicker = React.forwardRef<HTMLDivElement, IDatePickerProps>((props, ref) => {
    const { calloutProps, ...datePickerProps } = props;
    const theme = useSurfaceTheme();

    return <DatePickerBase ref={ref} {...datePickerProps} calloutProps={{ theme: theme, ...calloutProps }} />;
});
DatePicker.displayName = 'DatePicker';
