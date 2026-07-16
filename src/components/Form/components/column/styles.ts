import { mergeStyleSets } from "@fluentui/react";


export const getColumnsStyles = (colspan?: number) => {
    return mergeStyleSets({
        column: {
            ...(colspan ? {
                gridColumn: `span ${colspan}`,
            } : {})
        }
    })
}