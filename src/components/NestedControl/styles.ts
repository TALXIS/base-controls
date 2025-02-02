import { mergeStyleSets } from "@fluentui/react";

export const getNestedControlStyles = (isBaseControl: boolean) => {
    return mergeStyleSets({
        customControlContainer: {
            display: isBaseControl ? 'none' : undefined
        },
        shimmerRoot: {
            flexGrow: 1
        },
        shimmerWrapper: {
            height: 32
        }
    })
}