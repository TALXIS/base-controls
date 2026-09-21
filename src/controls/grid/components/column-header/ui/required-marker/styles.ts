import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getColumnHeaderRequiredMarkerStyles = (theme: ITheme) => mergeStyleSets({
    requiredMarker: {
        color: theme.semanticColors.errorText,
    },
});
