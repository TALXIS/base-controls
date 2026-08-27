import { mergeStyleSets } from "@fluentui/react";

export const getCheckListGridStyles = () => {
    return mergeStyleSets({
        checkListGridRoot: {
            //AG Grid's own row animation runs 0.4s, which is longer than the gap between two rows being
            //crossed during a drag - every reflow was cut off mid-flight, which is what read as lag.
            //Short enough here to land before the next crossing.
            '.ag-row-animation .ag-row': {
                transition: 'transform 0.15s ease-out, top 0.15s ease-out'
            }
        }
    })
}
