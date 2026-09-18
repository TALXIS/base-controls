import * as React from 'react';
import { ITagPickerProps, TagPicker as TagPickerBase } from "@fluentui/react/lib/Pickers";
import { useSurfaceTheme } from "@theme";

/** A tag picker whose suggestions are drawn in the application's theme rather than in the input's. */
export const TagPicker = React.forwardRef<any, ITagPickerProps>((props, ref) => {
    const { pickerCalloutProps, pickerSuggestionsProps, ...pickerProps } = props;
    const theme = useSurfaceTheme();

    return <TagPickerBase
        ref={ref}
        {...pickerProps}
        pickerCalloutProps={{ theme: theme, ...pickerCalloutProps }}
        //`Suggestions` takes a theme it does not declare, and the list is drawn on the surface
        pickerSuggestionsProps={{ theme: theme, ...pickerSuggestionsProps } as ITagPickerProps['pickerSuggestionsProps']} />;
});
TagPicker.displayName = 'TagPicker';
