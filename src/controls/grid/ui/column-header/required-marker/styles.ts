import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getColumnHeaderUiRequiredMarkerStyles = (theme: ITheme) => mergeStyleSets({
    requiredMarker: {
        color: theme.semanticColors.errorText,
    },
});
