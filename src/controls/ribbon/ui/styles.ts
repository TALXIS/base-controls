import { mergeStyleSets } from "@fluentui/react";

//as tall as a text field
export const RIBBON_HEIGHT = 32;

//Fluent's icon font size in a command bar
const ICON_SIZE = 16;

export const getRibbonUiCommandBarStyles = () => mergeStyleSets({
    ribbon: {
        '& .ms-CommandBar': {
            height: RIBBON_HEIGHT,
        },
    },
    imageIcon: {
        width: ICON_SIZE,
        height: ICON_SIZE,
        '& img': {
            width: ICON_SIZE,
            height: ICON_SIZE,
            objectFit: 'contain',
        },
    },
});
