import { IStyle } from "@fluentui/react";

export const getCheckListReorderingStyles = (): IStyle => ({
    //AG Grid animates a moved row for 0.4s, which trails the pointer during a drag
    '.ag-row': {
        transitionDuration: '0.12s',
    },
});
