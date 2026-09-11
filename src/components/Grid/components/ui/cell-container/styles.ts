import { mergeStyleSets } from "@fluentui/react";

export const getCellThemeStyles = () => mergeStyleSets({
    //the provider's element sits between `.ag-cell` and the cell's content, and both size themselves
    //against it
    themeProvider: {
        width: '100%',
        height: '100%',
    },
});
