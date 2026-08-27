import { mergeStyleSets } from "@fluentui/react";

/**
 * The renderer only reacts to a `Height` of `'100%'`, so a fixed height has to be applied here for the
 * grid — whose root is `height: 100%` — to have an ancestor to fill.
 */
export const getCheckListStyles = (height?: string | null) => {
    return mergeStyleSets({
        checkListRoot: {
            ...(height ? { height: height } : {})
        }
    })
}
