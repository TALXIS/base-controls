import { mergeStyleSets } from "@fluentui/react";

export const getRibbonUiStyles = (align: 'start' | 'end') => mergeStyleSets({
    ribbon: {
        display: 'flex',
        height: 44,
        minWidth: 0,
        //Fluent's resize group wraps the command bar without a class of its own
        '& > *': {
            flex: '1 1 auto',
            minWidth: 0,
        },
    },
    //the first and last button line up with whatever holds the ribbon
    commandBar: {
        flex: '1 1 auto',
        minWidth: 0,
        paddingLeft: 0,
        paddingRight: 0,
    },
    commands: {
        justifyContent: align === 'end' ? 'flex-end' : 'flex-start',
    },
});
