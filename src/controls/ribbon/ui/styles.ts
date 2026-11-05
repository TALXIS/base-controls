import { mergeStyleSets } from "@fluentui/react";

//as tall as a text field
export const RIBBON_HEIGHT = 32;

export const getRibbonUiStyles = () => mergeStyleSets({
    ribbon: {
        '& .ms-CommandBar': {
            height: RIBBON_HEIGHT,
        },
    },
});
