import { IStyle } from "@fluentui/react";
import { ITheme } from "@theme";

export const getGridAggregationStyles = (theme: ITheme): IStyle => ({
    '.ag-grid-pinned-bottom-rows .ag-row-pinned': {
        borderTop: `1px solid ${theme.semanticColors.menuDivider}`,
        borderBottom: 'none',
    },
});
