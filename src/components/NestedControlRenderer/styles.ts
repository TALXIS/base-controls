import { mergeStyleSets } from "@fluentui/react";

const FLEX_STYLE = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
}

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
        },
        messageBarBtn: {
            minHeight: 'inherit'
        }
    })
}

export const getInternalNestedControlStyles = () => {
    return mergeStyleSets({
        nestedControlContainer: {
            ...FLEX_STYLE
        },
        nestedControl: {
            ...FLEX_STYLE
        }
    })
}