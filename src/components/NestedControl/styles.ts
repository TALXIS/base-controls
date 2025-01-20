import { mergeStyleSets } from "@fluentui/react";

export const getNestedControlStyles = () => {
    return mergeStyleSets({
        loadingWrapper: {
            paddingLeft: 10,
            paddingRight: 10,
            height: '100%',
            display: 'flex',
            alignItems: 'center'
        },
        shimmerRoot: {
            flexGrow: 1
        },
        shimmerWrapper: {
            height: 10
        }
    })
}