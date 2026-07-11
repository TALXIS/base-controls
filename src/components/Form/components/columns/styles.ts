import { mergeStyleSets } from "@fluentui/react";



export const getColumnsStyles = (children: {width: string; minWidth?: string}[]) => {
    return mergeStyleSets({
        columns: {
            display: 'flex',
            flexWrap: 'wrap',
        }
    })
}