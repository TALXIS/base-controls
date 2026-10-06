import { IStyle } from "@fluentui/react";
import { ITheme } from "@theme";

export const getGridAggregationStyles = (theme: ITheme): IStyle => ({
    '.ag-floating-bottom .ag-row-pinned': {
        borderTop: `1px solid ${theme.semanticColors.menuDivider}`,
        borderBottom: 'none',
    },
});
