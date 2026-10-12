import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getLookupManyEditorStyles = (theme: ITheme, width: number) => mergeStyleSets({
    root: {
        width: width,
        minHeight: 40,
        display: 'flex',
        backgroundColor: theme.semanticColors.bodyBackground,
        boxShadow: theme.effects.elevation8,
    },
});
