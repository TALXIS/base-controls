import { mergeStyleSets } from "@fluentui/react";

interface IColumnStylesParams {
    columnsPerRow: number;
    colspan?: number;
}

export const getColumnsStyles = (params: IColumnStylesParams) => {
    const colspan = params.colspan ? Math.min(params.colspan, params.columnsPerRow) : undefined;
    return mergeStyleSets({
        column: {
            ...(colspan ? {
                gridColumn: `span ${colspan}`,
            } : {})
        }
    })
}