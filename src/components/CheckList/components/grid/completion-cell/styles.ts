import { mergeStyleSets } from "@fluentui/react";

export const getCompletionCellStyles = () => {
    return mergeStyleSets({
        checkBoxRoot: {
            width: '100%',
            height: '100%'
        },
        //the label is the checkbox's hitbox, so filling the cell with it is what makes the whole cell
        //toggle. It also carries the centring: the grid zeroes cell padding, so without it the box would
        //sit hard against the cell's edge
        checkBoxLabel: {
            width: '100%',
            height: '100%',
            //the label is a flex row, so both axes have to be said: `justifyContent` alone leaves the box
            //centred horizontally but stuck to the top of the cell
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer'
        },
        //collapses the gutter Fluent reserves for a label. Without it the box sits left of centre by the
        //width of a label this checkbox does not have
        checkBox: {
            marginRight: 0.5
        }
    })
}
