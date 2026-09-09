import { mergeStyleSets } from "@fluentui/react";

export const getCellAdapterStyles = () => mergeStyleSets({
    //the provider's element sits between `.ag-cell` and the cell root, and both size themselves against it
    themeProvider: {
        width: '100%',
        height: '100%',
    },
});
