import { mergeStyleSets } from "@fluentui/react";

export const getOptionStyles = (backgroundColor: string, textColor: string) => {
    return mergeStyleSets({
        option: {
            borderRadius: 5,
            paddingLeft: 4,
            paddingRight: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexGrow: 1,
            maxWidth: 'fit-content',
            fontWeight: 600,
            backgroundColor: backgroundColor,
            color: textColor,
        },
    });
};
