import * as React from 'react';
import { ITimePickerProps, TimePicker as TimePickerBase } from "@fluentui/react";
import { useSurfaceTheme } from "@theme";

/** A time picker whose list is drawn in the application's theme rather than in the input's. */
export const TimePicker = React.forwardRef<HTMLDivElement, ITimePickerProps>((props, ref) => {
    const { calloutProps, ...timePickerProps } = props;
    const theme = useSurfaceTheme();

    return <TimePickerBase ref={ref} {...timePickerProps} calloutProps={{ theme: theme, ...calloutProps }} />;
});
TimePicker.displayName = 'TimePicker';
