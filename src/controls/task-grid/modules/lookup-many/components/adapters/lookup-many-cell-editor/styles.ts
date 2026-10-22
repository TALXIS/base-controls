import { ITheme, mergeStyleSets } from "@fluentui/react";

export const LOOKUP_MANY_EDITOR_MIN_WIDTH = 280;

export const getLookupManyCellEditorStyles = (theme: ITheme) => mergeStyleSets({
    root: {
        backgroundColor: theme.semanticColors.bodyBackground,
        boxShadow: theme.effects.elevation16,
        borderRadius: theme.effects.roundedCorner2,
    },
});
