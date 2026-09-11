import { mergeStyleSets } from "@fluentui/react";

/** What sits between a cell's content and its edge. AG Grid is told to give a cell none of its own. */
const HORIZONTAL_PADDING = 10;

export const getCellControlStyles = () => mergeStyleSets({
    control: {
        //as wide as what it draws: a control filling the cell leaves the row no space to place it in
        flex: '0 1 auto',
        display: 'flex',
        alignItems: 'center',
        minWidth: 0,
        overflow: 'hidden',
        height: '100%',
        paddingLeft: HORIZONTAL_PADDING,
        paddingRight: HORIZONTAL_PADDING,
    },
});
