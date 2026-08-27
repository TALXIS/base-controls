import { mergeStyleSets } from "@fluentui/react";

export const getCompletionCellStyles = () => {
    return mergeStyleSets({
        completionCellRoot: {
            //filling the cell is required, not cosmetic: the grid zeroes cell padding, so an inline
            //element would sit hard against the cell's edge instead of centred in it
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        //collapses the gutter Fluent reserves for a label. Without it the box sits left of centre by the
        //width of a label this checkbox does not have
        checkBox: {
            marginRight: 0.5
        }
    })
}
