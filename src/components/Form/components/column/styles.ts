import { mergeStyleSets } from "@fluentui/react";

const DEFAULT_MIN_WIDTH = 300;

export const getColumnsStyles = (width: string, minWidth?: string) => {
    return mergeStyleSets({
        column: {
            flexBasis: width,
            flex: 1,
            //should have default min width 
            minWidth: minWidth ?? DEFAULT_MIN_WIDTH
        }
    })
}